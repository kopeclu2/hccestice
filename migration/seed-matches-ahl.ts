/**
 * Seed zápasů sezóny 2025-2026 z ahl.cz (VČHL).
 *
 * Zdroj odkazů: homepage eStránky (migration/data/homepage.json) obsahuje
 * <a href="https://www.ahl.cz/...zapas/?zapasid=X"> pro každý zápas.
 * Z každé stránky zápasu se čte: plné názvy týmů, skóre, třetiny, soutěž
 * (Základní část / Play off), datum+čas, místo.
 *
 * Idempotentní (existující zápas dle sezóna+den+soupeř se přeskočí).
 * Spuštění: bun --env-file=.env migration/seed-matches-ahl.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SEASON_SLUG = '2025-2026'

const strip = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

// sjednocení názvů z ahl.cz na existující soupeře
const OPPONENT_ALIAS: Record<string, string> = {
  'aloha lanskroun': 'HC Aloha Lanškroun',
  'hc aloha lanskroun': 'HC Aloha Lanškroun',
  'baroni opocno': 'HC Opočno',
  'hc baroni opocno': 'HC Opočno',
  'rebels policka': 'Rebels Polička',
  'hc stavoblock rebels policka': 'Rebels Polička',
  'hc spartak policka b': 'HC Polička B',
  'hc spartak policka "b"': 'HC Polička B',
  'zavodni hokejova pardubice': 'ZH Pardubice',
  'hc spartak chocen b': 'HC Choceň B',
}

type AhlMatch = {
  zapasid: string
  home: string
  away: string
  scoreHome: number | null
  scoreAway: number | null
  thirds: string | null
  overtime: boolean
  shootout: boolean
  competition: string
  playoff: boolean
  dateISO: string | null
  venue: string | null
}

function parseAhlPage(html: string, zapasid: string): AhlMatch | null {
  const collapsed = html
    .replace(/<script[\s\S]*?<\/script>/gi, '|')
    .replace(/<style[\s\S]*?<\/style>/gi, '|')
    .replace(/<[^>]+>/g, '|')
    .replace(/&nbsp;/g, ' ')
  const tokens = collapsed
    .split('|')
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  // skóre token „1 : 4" — domácí tým je token před ním, třetiny a hosté za ním
  const scoreIdx = tokens.findIndex((t) => /^\d{1,2}\s*:\s*\d{1,2}$/.test(t))
  let home = ''
  let away = ''
  let scoreHome: number | null = null
  let scoreAway: number | null = null
  let thirds: string | null = null

  let snPp: string | null = null
  if (scoreIdx > 0) {
    const m = tokens[scoreIdx].match(/^(\d{1,2})\s*:\s*(\d{1,2})$/)!
    scoreHome = parseInt(m[1], 10)
    scoreAway = parseInt(m[2], 10)
    home = tokens[scoreIdx - 1]
    let next = scoreIdx + 1
    // za skóre může být v libovolném pořadí: „sn"/„pp" a „(třetiny)"
    while (next < tokens.length) {
      if (/^(sn|pp)$/i.test(tokens[next])) {
        snPp = tokens[next].toLowerCase()
        next++
      } else if (/^\(/.test(tokens[next])) {
        thirds = tokens[next]
        next++
      } else {
        break
      }
    }
    away = tokens[next] ?? ''
  } else {
    // budoucí/neodehraný zápas: „- : -" nebo bez skóre — tymy kolem „vs"? přeskočit
    return null
  }

  // soutěž + datum + místo: „VČHL 1.ročník", „Základní část"/„Play off",
  // „Neděle 4. 1. 2026, 16:30", „Rychnov nad Kněžnou"
  const playoff = tokens.some((t) => /play\s*off/i.test(t))
  const dateTok = tokens.find((t) => /^\S+\s+\d{1,2}\.\s*\d{1,2}\.\s*\d{4},\s*\d{1,2}:\d{2}/.test(t))
  let dateISO: string | null = null
  if (dateTok) {
    const dm = dateTok.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4}),\s*(\d{1,2}):(\d{2})/)
    if (dm) {
      dateISO = `${dm[3]}-${dm[4].length ? dm[2].padStart(2, '0') : ''}-${dm[1].padStart(2, '0')}T${dm[4].padStart(2, '0')}:${dm[5]}:00`
      dateISO = `${dm[3]}-${dm[2].padStart(2, '0')}-${dm[1].padStart(2, '0')}T${dm[4].padStart(2, '0')}:${dm[5]}:00`
    }
  }
  const dateIdx = dateTok ? tokens.indexOf(dateTok) : -1
  const venue = dateIdx >= 0 && tokens[dateIdx + 1] && !/^Zápas/.test(tokens[dateIdx + 1]) ? tokens[dateIdx + 1] : null

  // prodloužení/nájezdy: token „sn"/„pp" za třetinami, případně 4. třetina
  const overtime = snPp === 'pp' || (thirds ? thirds.split(',').length > 3 : false)
  const shootout = snPp === 'sn'

  return {
    zapasid,
    home,
    away,
    scoreHome,
    scoreAway,
    thirds,
    overtime,
    shootout,
    competition: playoff ? 'VČHL play-off' : 'VČHL',
    playoff,
    dateISO,
    venue,
  }
}

async function main() {
  const hp = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'homepage.json'), 'utf8'),
  )[0].html as string
  // dodatečná ID lze předat jako argumenty (zápasy, které na homepage nejsou)
  const extraIds = process.argv.slice(2).filter((a) => /^\d+$/.test(a))
  const ids = [...new Set([...[...hp.matchAll(/zapasid=(\d+)/g)].map((m) => m[1]), ...extraIds])]
  console.log(`Nalezeno ${ids.length} unikátních zápasů na ahl.cz\n`)

  // stáhnout a naparsovat
  const matches: AhlMatch[] = []
  for (const id of ids) {
    const url = `https://www.ahl.cz/soutez/vychodoceska_hokejova_liga/zapas/?zapasid=${id}`
    try {
      const res = await fetch(url)
      const html = await res.text()
      const parsed = parseAhlPage(html, id)
      if (!parsed) {
        console.log(`  ~ ${id}: bez skóre (neodehráno?) — přeskočeno`)
      } else if (!/cestice/.test(strip(parsed.home) + strip(parsed.away))) {
        console.log(`  ~ ${id}: cizí zápas (${parsed.home} x ${parsed.away}) — přeskočeno`)
      } else {
        matches.push(parsed)
      }
    } catch (err) {
      console.log(`  ! ${id}: fetch selhal — ${(err as Error).message}`)
    }
    await new Promise((r) => setTimeout(r, 350))
  }
  console.log(`\nZápasů HC Čestice se skóre: ${matches.length}\n`)

  const payload = await getPayload({ config })
  const season = (
    await payload.find({ collection: 'seasons', where: { slug: { equals: SEASON_SLUG } }, limit: 1, depth: 0 })
  ).docs[0]
  if (!season) throw new Error(`Sezóna ${SEASON_SLUG} nenalezena`)
  const teamMuzi = (
    await payload.find({ collection: 'teams', where: { slug: { equals: 'muzi' } }, limit: 1, depth: 0 })
  ).docs[0]

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

  const seasonGalleries = (
    await payload.find({ collection: 'galleries', where: { season: { equals: season.id } }, limit: 0, depth: 0 })
  ).docs

  let created = 0
  let skipped = 0
  matches.sort((a, b) => (a.dateISO ?? '').localeCompare(b.dateISO ?? ''))

  for (const m of matches) {
    const weAreHome = /cestice/.test(strip(m.home))
    const opponentName = weAreHome ? m.away : m.home
    const opponentId = await resolveOpponent(opponentName)
    if (!m.dateISO) {
      console.log(`  ⚠ bez data: ${m.home} x ${m.away} — přeskočeno`)
      continue
    }
    const day = m.dateISO.slice(0, 10)

    const existing = await payload.find({
      collection: 'matches',
      where: {
        and: [
          { season: { equals: season.id } },
          { opponent: { equals: opponentId } },
          { date: { greater_than_equal: `${day}T00:00:00` } },
          { date: { less_than_equal: `${day}T23:59:59` } },
        ],
      },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) {
      skipped++
      continue
    }

    const gallery = seasonGalleries.find((g) => (g.date as string | null)?.slice(0, 10) === day)

    await payload.create({
      collection: 'matches',
      data: {
        date: m.dateISO,
        season: season.id,
        team: teamMuzi.id,
        competition: m.competition,
        opponent: opponentId,
        home: weAreHome,
        venue: m.venue ?? undefined,
        scoreOurs: weAreHome ? m.scoreHome : m.scoreAway,
        scoreOpp: weAreHome ? m.scoreAway : m.scoreHome,
        status: 'played',
        overtime: m.overtime,
        shootout: m.shootout,
        gallery: gallery?.id,
      } as any,
      context: { disableRevalidate: true },
    })
    const res = `${m.scoreHome}:${m.scoreAway}`
    console.log(
      `  + ${day} ${weAreHome ? 'DOMA ' : 'VENKU'} vs ${opponentName.padEnd(24)} ${res} ${m.thirds ?? ''} [${m.competition}]${gallery ? ' 📷' : ''}`,
    )
    created++
  }

  console.log(`\nZápasy 2025-2026: +${created}, přeskočeno ${skipped}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
