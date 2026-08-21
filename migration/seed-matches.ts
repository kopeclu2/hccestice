/**
 * Seed kolekce matches z reportáží (posts type=report) dané sezóny.
 *
 * Z titulku: kolo/soutěž, soupeř, domácí/hosté, datum (vč. oprav překlepů).
 * Z obsahu:  finální skóre `X:Y [sn|pp] (a:b,c:d,e:f)`, přesné datum+čas
 *            („pátek 27. října 2023 19:30").
 *
 * Idempotentní (zápas s navázaným stejným reportem se přeskočí).
 * Spuštění: bun --env-file=.env migration/seed-matches.ts [season-slug]
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const SEASON_SLUG = process.argv[2] ?? '2023-2024'

// sjednocení názvů soupeřů na existující kluby (klíč = normalizovaný název)
const OPPONENT_ALIAS: Record<string, string> = {
  'aloha lanskroun': 'HC Aloha Lanškroun',
  'hc aloha lanskroun': 'HC Aloha Lanškroun',
  'rebels policka': 'Rebels Polička',
  'rebels': 'Rebels Polička',
}

const CZ_MONTHS: Record<string, number> = {
  ledna: 1, unora: 2, brezna: 3, dubna: 4, kvetna: 5, cervna: 6,
  cervence: 7, srpna: 8, zari: 9, rijna: 10, listopadu: 11, prosince: 12,
}

const strip = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

/** „REBELS POLIČKA" → „Rebels Polička" (celokapitálky na Title Case) */
function normalizeName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => {
      if (w.length > 2 && w === w.toUpperCase() && !/^[A-Z]{2,3}$/.test(w)) {
        return w.charAt(0) + w.slice(1).toLowerCase()
      }
      return w
    })
    .join(' ')
}

/** Oprava překlepů v roce: „20233"→2023, „20024"/„20204"→2024 (dle rozsahu sezóny) */
function fixYear(raw: string, seasonStart: number): number | null {
  const y = parseInt(raw, 10)
  if (y >= 2000 && y <= 2100) return y
  if (raw.length === 5) {
    const candidates = new Set<number>()
    for (let i = 0; i < 5; i++) {
      const c = parseInt(raw.slice(0, i) + raw.slice(i + 1), 10)
      if (c === seasonStart || c === seasonStart + 1) candidates.add(c)
    }
    if (candidates.size === 1) return [...candidates][0]
  }
  return null
}

type Parsed = {
  competition: string
  opponentRaw: string
  home: boolean
  date: string | null // ISO
  scoreOurs: number | null
  scoreOpp: number | null
  overtime: boolean
  shootout: boolean
}

function parsePost(title: string, html: string, seasonStart: number): Parsed | null {
  // --- soutěž / kolo ---
  const playoff = /play[\s-]*off/i.test(title)
  const compMatch = title.match(/\b(OLLH|VČHL|VCHL|KSM|KLM|OSHL)\b/i)
  const round = title.match(/(\d+)\.?\s*kolo/i)
  const competition = [
    round ? `${round[1]}. kolo` : null,
    compMatch ? compMatch[1].toUpperCase() : null,
    playoff ? 'play-off' : null,
  ]
    .filter(Boolean)
    .join(' ')

  // --- týmy: část titulku „A x B" (odstranit prefix kola a datum na konci) ---
  let teams = title
    .replace(/^[^-]*?kolo[^-]*-/i, '')
    .replace(/play[\s-]*off\s*-?\s*(OLLH|VČHL|VCHL)?\s*-?/i, '')
    .replace(/^\s*(OLLH|VČHL|VCHL|KSM|KLM|OSHL)\s*-\s*/i, '')
    .replace(/-?\s*\d{1,2}\.\d{1,2}\.\d{4,5}\s*$/, '')
    .trim()
  const xSplit = teams.split(/\s+x\s+/i)
  if (xSplit.length !== 2) return null
  const [left, right] = xSplit.map((t) => t.replace(/^[-\s]+|[-\s]+$/g, ''))
  const leftIsUs = /cestice/.test(strip(left))
  const rightIsUs = /cestice/.test(strip(right))
  if (!leftIsUs && !rightIsUs) return null
  const home = leftIsUs
  const opponentRaw = normalizeName(home ? right : left)

  // --- datum: nejdřív plné české z obsahu, pak z titulku ---
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
  let date: string | null = null

  const czDate = text.match(
    /(\d{1,2})\.\s*(ledna|února|unora|března|brezna|dubna|května|kvetna|června|cervna|července|cervence|srpna|září|zari|října|rijna|listopadu|prosince)\s*(\d{4})(?:\D{0,10}(\d{1,2}):(\d{2}))?/i,
  )
  if (czDate) {
    const day = parseInt(czDate[1], 10)
    const month = CZ_MONTHS[strip(czDate[2])]
    const year = parseInt(czDate[3], 10)
    if (month && year >= seasonStart && year <= seasonStart + 1) {
      const hh = czDate[4] ? czDate[4].padStart(2, '0') : '17'
      const mm = czDate[5] ?? '00'
      date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${hh}:${mm}:00`
    }
  }
  if (!date) {
    const t = title.match(/(\d{1,2})\.(\d{1,2})\.(\d{4,5})\s*$/)
    if (t) {
      const year = fixYear(t[3], seasonStart)
      if (year) {
        date = `${year}-${t[2].padStart(2, '0')}-${t[1].padStart(2, '0')}T17:00:00`
      }
    }
  }

  // --- skóre: „X:Y [sn|pp] (a:b,c:d,…)" ---
  let scoreLeft: number | null = null
  let scoreRight: number | null = null
  let overtime = false
  let shootout = false
  const score = text.match(/(\d{1,2})\s*:\s*(\d{1,2})\s*(sn|pp)?\s*\(\s*\d{1,2}\s*:/i)
  if (score) {
    scoreLeft = parseInt(score[1], 10)
    scoreRight = parseInt(score[2], 10)
    if (score[3]?.toLowerCase() === 'sn') shootout = true
    if (score[3]?.toLowerCase() === 'pp') overtime = true
  }

  return {
    competition,
    opponentRaw,
    home,
    date,
    scoreOurs: home ? scoreLeft : scoreRight,
    scoreOpp: home ? scoreRight : scoreLeft,
    overtime,
    shootout,
  }
}

async function main() {
  const payload = await getPayload({ config })

  const season = (
    await payload.find({ collection: 'seasons', where: { slug: { equals: SEASON_SLUG } }, limit: 1, depth: 0 })
  ).docs[0]
  if (!season) throw new Error(`Sezóna ${SEASON_SLUG} nenalezena`)
  const seasonStart = season.startYear as number

  const teamMuzi = (
    await payload.find({ collection: 'teams', where: { slug: { equals: 'muzi' } }, limit: 1, depth: 0 })
  ).docs[0]
  if (!teamMuzi) throw new Error('Tým Muži nenalezen')

  const posts = await payload.find({
    collection: 'posts',
    where: { and: [{ season: { equals: season.id } }, { type: { equals: 'report' } }] },
    limit: 0,
    depth: 0,
    sort: 'publishedAt',
  })
  console.log(`Sezóna ${SEASON_SLUG}: ${posts.docs.length} reportáží\n`)

  // cache soupeřů
  const allOpponents = (await payload.find({ collection: 'opponents', limit: 0, depth: 0 })).docs
  const opponentByNorm = new Map(allOpponents.map((o) => [strip(o.name as string), o.id]))

  async function resolveOpponent(raw: string): Promise<number> {
    const aliased = OPPONENT_ALIAS[strip(raw)] ?? raw
    const key = strip(aliased)
    if (opponentByNorm.has(key)) return opponentByNorm.get(key) as number
    const slug = key.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const doc = await payload.create({
      collection: 'opponents',
      data: { name: aliased, slug, generateSlug: false } as any,
      context: { disableRevalidate: true },
    })
    opponentByNorm.set(key, doc.id as number)
    console.log(`  + nový soupeř: ${aliased}`)
    return doc.id as number
  }

  // galerie sezóny podle data (pro navázání)
  const seasonGalleries = (
    await payload.find({
      collection: 'galleries',
      where: { season: { equals: season.id } },
      limit: 0,
      depth: 0,
    })
  ).docs

  let created = 0
  let skipped = 0
  const warnings: string[] = []

  for (const post of posts.docs) {
    const existing = await payload.find({
      collection: 'matches',
      where: { report: { equals: post.id } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) {
      skipped++
      continue
    }

    const parsed = parsePost(post.title as string, (post as any).legacyHtml ?? '', seasonStart)
    if (!parsed) {
      warnings.push(`NEPARSOVATELNÉ: ${post.title}`)
      continue
    }
    if (!parsed.date) {
      warnings.push(`BEZ DATA (přeskočeno): ${post.title}`)
      continue
    }
    if (parsed.scoreOurs === null) {
      warnings.push(`bez skóre (vytvořeno jako odehráno bez výsledku): ${post.title}`)
    }

    const opponentId = await resolveOpponent(parsed.opponentRaw)
    const matchDay = parsed.date.slice(0, 10)
    const gallery = seasonGalleries.find((g) => (g.date as string | null)?.slice(0, 10) === matchDay)

    await payload.create({
      collection: 'matches',
      data: {
        date: parsed.date,
        season: season.id,
        team: teamMuzi.id,
        competition: parsed.competition || undefined,
        opponent: opponentId,
        home: parsed.home,
        venue: parsed.home ? 'zimní stadion Rychnov nad Kněžnou' : undefined,
        scoreOurs: parsed.scoreOurs ?? undefined,
        scoreOpp: parsed.scoreOpp ?? undefined,
        status: 'played',
        overtime: parsed.overtime,
        shootout: parsed.shootout,
        report: post.id,
        gallery: gallery?.id,
      } as any,
      context: { disableRevalidate: true },
    })
    const res =
      parsed.scoreOurs !== null
        ? `${parsed.home ? parsed.scoreOurs + ':' + parsed.scoreOpp : parsed.scoreOpp + ':' + parsed.scoreOurs}${parsed.shootout ? ' sn' : ''}${parsed.overtime ? ' pp' : ''}`
        : '—'
    console.log(
      `  + ${matchDay} ${parsed.home ? 'DOMA ' : 'VENKU'} vs ${parsed.opponentRaw.padEnd(22)} ${res}  [${parsed.competition}]${gallery ? ' 📷' : ''}`,
    )
    created++
  }

  console.log(`\nZápasy: +${created}, přeskočeno ${skipped}`)
  if (warnings.length) {
    console.log('Upozornění:')
    warnings.forEach((w) => console.log('  ⚠ ' + w))
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
