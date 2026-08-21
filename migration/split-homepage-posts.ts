/**
 * Rozsekání legacy úvodní stránky eStránky na jednotlivé posty.
 *
 * Komentáře zápasů se na eStránky psaly do jednoho velkého HTML bloku úvodní
 * stránky, ne do článků — migrace ho proto naimportovala jako celek
 * (page `home-legacy`, resp. posty „Úvodní strana <sezóna>"). Tenhle skript
 * blok rozdělí na samostatné posty, u zápasových navíc navazuje `matches`
 * doc (hero varianta `zapas` = výsledková tabule) a doplní `matches.report`.
 *
 * Zdroje:
 *   --source=homepage        migration/data/homepage.json (sezóna 2025-2026)
 *   --source=<legacyId>      článek z migration/data/articles.json (archiv)
 *
 * Default je DRY-RUN — zapisuje se jen s `--apply`. Idempotentní podle
 * `legacy.url` (`homepage#zapasid=…`, resp. `homepage:<id>#<slug>`), takže
 * opakované spuštění nic nepřidá. Vedlejší efekt klíče: bloky se shodným
 * titulkem v jednom zdroji (např. 4× „Změny tréninků pro dospělé a děti"
 * z různých měsíců) se naimportují jen jednou — záměrně, jinak by v aktualitách
 * vznikly čtyři nerozlišitelné položky.
 *
 * Dedup proti už naimportovaným článkům: shodný titulek (i napříč sezónami)
 * nebo shoda kolo + soupeř + datum zápasu. Archivní úvodní stránky jsou totiž
 * z většiny jen teasery plných článků, které import.ts už vytvořil.
 *
 * Spuštění: bun --env-file=.env migration/split-homepage-posts.ts \
 *             --source=homepage [--apply] [--dump] > /tmp/split-report.txt 2>&1
 * (přes `payload run` NE — ten zahazuje CLI argumenty.)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA = (name: string) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, 'data', name), 'utf8'))
const noRevalidate = { context: { disableRevalidate: true } }

const argv = process.argv.slice(2)
const arg = (name: string) => argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1]
const APPLY = argv.includes('--apply')
const DUMP = argv.includes('--dump')
const SOURCE = arg('source') ?? 'homepage'
const SEASON_OVERRIDE = arg('season')
const MIN_WORDS = Number(arg('min-words') ?? 15)
// pod touhle šířkou nemá smysl dělat z obrázku celoplošný hero
const MIN_HERO_WIDTH = Number(arg('min-hero-width') ?? 500)

// ---------------------------------------------------------------------------
// HTML → text
// ---------------------------------------------------------------------------

/** Smajlíky z CKEditoru eStránky → emoji (dle atributu alt). */
const SMILEY: Record<string, string> = {
  yes: '👍',
  no: '👎',
  heart: '❤️',
  angry: '😠',
  laugh: '😄',
  smile: '🙂',
  smiley: '🙂',
  cool: '😎',
  cry: '😢',
  sad: '🙁',
  wink: '😉',
  tongue: '😛',
  surprise: '😮',
  kiss: '😗',
  broken_heart: '💔',
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  bdquo: '„',
  ldquo: '“',
  rdquo: '”',
  laquo: '«',
  raquo: '»',
  eacute: 'é',
  iacute: 'í',
  times: '×',
  middot: '·',
  bull: '•',
  deg: '°',
  euro: '€',
  copy: '©',
  reg: '®',
  sbquo: '‚',
  lsquo: '‘',
  rsquo: '’',
}

const unescapeHtml = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[String(name).toLowerCase()] ?? m)

/** HTML blok → řádky prostého textu; smajlíky nahrazené emoji. */
function htmlToLines(html: string): string[] {
  let s = html
    .replace(/<img[^>]*>/gi, (tag) => {
      const alt = /alt="([^"]*)"/i.exec(tag)?.[1]?.toLowerCase() ?? ''
      const isSmiley = /smiley\/images|editor\/ckeditor/i.test(tag)
      return isSmiley ? (SMILEY[alt] ?? '') : ''
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h[1-6]|caption|table)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
  s = unescapeHtml(s).replace(/ /g, ' ')
  return s
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line) => line && line !== '|' && !/^[_—–\-|]+$/.test(line))
}

const dia = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const slugify = (s: string) =>
  dia(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
    .replace(/-+$/g, '')

const DATE_ONLY = /^(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})\.?$/
const DATE_TITLE = /^(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})\s*[-–—]\s*(.+)$/
const toISO = (d: string, m: string, y: string) =>
  `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`

// ---------------------------------------------------------------------------
// Parser bloků
// ---------------------------------------------------------------------------

type Block = {
  /** datum publikace na eStránky */
  publishedDate: string | null
  /** datum zápasu (u archivu na konci titulku, u homepage na jeho začátku) */
  itemDate: string | null
  title: string
  lines: string[]
  goals: string | null
  /** obrázky bloku v pořadí výskytu, `/img/original/` (plná velikost) první */
  photos: string[]
  ahlId: string | null
  /** odkazy „Více zde…" — na eStránky mířily na plný článek, galerii nebo ven */
  links: { href: string; text: string }[]
  isMatch: boolean
  words: number
}

/** Absolutní URL starého webu → relativní cesta (redirecty už v DB jsou). */
function normalizeHref(href: string): string {
  const stripped = href.replace(/^https?:\/\/(www\.)?hccestice\.(cz|estranky\.cz)/i, '')
  return stripped || href
}

/** Odkaz je teaser plného článku? → vrátí legacy cestu `/clanky/<slug>.html` */
function legacyArticlePath(href: string): string | null {
  const path = normalizeHref(href)
  const m = /\/clanky\/(?:[^?#]*\/)?([^/?#]+)\.html$/i.exec(path)
  return m ? `/clanky/${decodeURIComponent(m[1])}.html` : null
}

const TEAM_WORDS =
  /(zamberk|policka|chocen|litomysl|skutec|opocno|lanskroun|pardubice|trebova|semechnice|voderady|nove mesto|hrusky|divocaci|rebels|aloha|slovan|orli|spartak|cestice)/

/** Titulek vypadá jako zápas? („N.kolo", „A x B", „utkání o …") */
function looksLikeMatch(title: string): boolean {
  const t = dia(title)
  if (/foto|fotografie|fotky/.test(t)) return false
  const hasRound = /\d+\s*\.?\s*kolo|utkani o|play-?off|ctvrtfinale|semifinale/.test(t)
  const hasVersus = /\s+x\s+/.test(t) && TEAM_WORDS.test(t)
  return hasVersus || (hasRound && hasVersus)
}

/** Segmenty bez datové hlavičky — pro vyúčtování, že se nic neztratilo. */
const skippedSegments: { words: number; preview: string }[] = []

function parseBlocks(html: string): Block[] {
  const segments = html.split(/<hr\s*\/?>|_{15,}/i)
  const blocks: Block[] = []

  for (const seg of segments) {
    const lines = htmlToLines(seg)
    if (!lines.length) continue

    // šedá hlavička = samostatný řádek jen s datem
    let publishedDate: string | null = null
    let idx = 0
    for (; idx < lines.length && idx < 3; idx++) {
      const m = DATE_ONLY.exec(lines[idx])
      if (m) {
        publishedDate = toISO(m[1], m[2], m[3])
        idx++
        break
      }
    }
    if (!publishedDate) idx = 0

    // titulek = první řádek „D.M.YYYY - něco"
    let titleIdx = -1
    let leadDate: string | null = null
    let title = ''
    for (let i = idx; i < lines.length; i++) {
      const m = DATE_TITLE.exec(lines[i])
      if (m) {
        titleIdx = i
        leadDate = toISO(m[1], m[2], m[3])
        title = m[4].trim().replace(/\s*[-–—]\s*$/, '')
        break
      }
    }
    if (titleIdx < 0) {
      const text = lines.join(' ')
      skippedSegments.push({ words: text.split(/\s+/).filter(Boolean).length, preview: text.slice(0, 110) })
      continue
    }

    // Homepage: úvodní datum titulku = datum zápasu, publikace je v šedé hlavičce.
    // Archiv: úvodní datum = datum publikace, datum zápasu bývá na konci titulku.
    const inTitle = [...title.matchAll(/(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})/g)]
    const itemDate = inTitle.length
      ? toISO(inTitle[inTitle.length - 1][1], inTitle[inTitle.length - 1][2], inTitle[inTitle.length - 1][3])
      : leadDate
    if (!publishedDate) publishedDate = leadDate

    // tělo = řádky za titulkem; končí opakováním titulku (popisek fotky)
    const titleFp = dia(title).replace(/[^a-z0-9]/g, '')
    const body: string[] = []
    for (let i = titleIdx + 1; i < lines.length; i++) {
      const line = lines[i]
      const key = dia(line).replace(/[^a-z0-9]/g, '')
      if (titleFp.length > 12 && (key.includes(titleFp) || titleFp.includes(key)) && key.length > 12)
        break
      if (DATE_TITLE.test(line) || DATE_ONLY.test(line)) break
      body.push(line)
    }

    // „Branky: X, Y" i varianta, kde je label na vlastním řádku a střelci až pod ním
    const goalsIdx = body.findIndex((l) => /^branky\s*:?/i.test(l))
    let goals: string | null = null
    if (goalsIdx >= 0) {
      const inline = body[goalsIdx].replace(/^branky\s*:?\s*/i, '').trim()
      goals = (inline || body.slice(goalsIdx + 1).join(' ').trim()) || null
    }
    const text = goalsIdx >= 0 ? body.slice(0, goalsIdx) : body

    // `/img/original/` je na eStránky plná velikost, `/img/picture/` zmenšenina
    // z editoru — originál má přednost. `/file/…` jsou znaky klubů, ne fotky.
    const photos = [
      ...[...seg.matchAll(/(?:src|href)="\/img\/original\/\d+\/([^"]+)"/gi)],
      ...[...seg.matchAll(/src="\/img\/picture\/\d+\/([^"]+)"/gi)],
    ].map((m) => decodeURIComponent(m[1]))
    const ahlId = /zapasid=(\d+)/i.exec(seg)?.[1] ?? null

    // odkazy uvnitř bloku (mimo obrázkové wrappery a ahl.cz, ten řeší `ahlId`)
    const links = [...seg.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
      .map((m) => ({ href: m[1], text: htmlToLines(m[2]).join(' ') }))
      .filter((l) => l.text && !/ahl\.cz/i.test(l.href))

    // „více zde…", „Podrobnosti zde…" apod. jako samostatný řádek nemá po
    // odstranění HTML žádnou hodnotu — nahradí ho lexical odkaz v buildContent
    const linkTexts = new Set(links.map((l) => dia(l.text).replace(/[^a-z0-9]/g, '')))
    const cleaned = text
      .filter((line) => {
        const key = dia(line).replace(/[^a-z0-9]/g, '')
        if (!key) return false
        return (
          !(linkTexts.has(key) && key.length < 40) &&
          !/^(vice|podrobnosti|fotky|fotoalbum)?zde/.test(key)
        )
      })
      // „…včetně videa...... více zde..." → odstranit koncový odkazovací zbytek
      .map((line) =>
        line
          .replace(/[\s.…]*\b(více|vice|podrobnosti|fotky)?\s*zde\s*[.…]*\s*(\(\.pdf\))?$/i, '')
          .replace(/[\s.…]+$/, (m) => (m.includes('...') || m.includes('…') ? '…' : ''))
          .trim(),
      )
      .filter(Boolean)

    blocks.push({
      publishedDate,
      itemDate,
      title,
      lines: cleaned,
      goals,
      photos: [...new Set(photos)],
      ahlId,
      links,
      isMatch: looksLikeMatch(title) || Boolean(ahlId),
      words: cleaned.join(' ').split(/\s+/).filter(Boolean).length,
    })
  }

  return blocks
}

// ---------------------------------------------------------------------------
// Lexical helpers
// ---------------------------------------------------------------------------

const textNode = (text: string, bold = false) => ({
  type: 'text',
  detail: 0,
  format: bold ? 1 : 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

const paragraph = (children: unknown[]) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  children,
})

const linkParagraph = (label: string, url: string) =>
  paragraph([
    {
      type: 'link',
      format: '',
      indent: 0,
      version: 3,
      direction: 'ltr',
      fields: { linkType: 'custom', newTab: true, url },
      children: [textNode(label)],
    },
  ])

/**
 * Odkazy, které mají v obsahu smysl. Interní legacy cesty pustíme dál jen
 * když na ně existuje redirect — sekce typu `/clanky/muzi/rozpis-zapasu/`
 * se nemigrovaly a vedly by na 404.
 */
async function contentLinks(block: Block): Promise<string[]> {
  const seen = new Set<string>()
  const out: string[] = []
  for (const link of block.links) {
    const href = normalizeHref(link.href)
    if (/^\/img\/picture\//i.test(href)) continue // jen zvětšenina fotky v bloku
    if (seen.has(href)) continue
    seen.add(href)
    if (href.startsWith('/')) {
      const redirect = await payload.find({
        collection: 'redirects',
        where: { from: { equals: href } },
        limit: 1,
        depth: 0,
      })
      if (!redirect.docs[0]) continue
    }
    out.push(href)
  }
  return out.slice(0, 3)
}

function linkLabel(href: string): string {
  if (/\/fotoalbum\//i.test(href)) return 'Fotogalerie'
  if (/zonerama/i.test(href)) return 'Fotogalerie (Zonerama)'
  if (/online-puk/i.test(href)) return 'Přehled zápasu'
  if (/facebook/i.test(href)) return 'Facebook HC Čestice'
  if (/instagram/i.test(href)) return 'Instagram HC Čestice'
  if (/^mailto:/i.test(href)) return href.replace(/^mailto:/i, '')
  if (/\.pdf$/i.test(href) || /\/file\//i.test(href)) return 'Dokument ke stažení'
  if (/^\//.test(href)) return 'Více informací'
  return `Více na ${href.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}`
}

async function buildContent(block: Block): Promise<Record<string, unknown>> {
  const children: unknown[] = block.lines.map((line) => paragraph([textNode(line)]))
  if (block.goals) {
    children.push(paragraph([textNode('Branky: ', true), textNode(block.goals)]))
  }
  if (block.ahlId) {
    children.push(
      linkParagraph(
        'Detail zápasu na ahl.cz',
        `https://www.ahl.cz/soutez/vychodoceska_hokejova_liga/zapas/?zapasid=${block.ahlId}`,
      ),
    )
  }
  for (const href of await contentLinks(block)) {
    children.push(linkParagraph(linkLabel(href), href))
  }
  if (!children.length) children.push(paragraph([textNode(block.title)]))

  return {
    root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children },
  }
}

/** Titulek sjednocený s existujícími reporty: „…soutěž - A x B - D.M.YYYY" */
function postTitle(block: Block): string {
  if (!block.isMatch || !block.itemDate) return block.title
  // titulek už datum obsahuje (archivní formát) → neduplikovat
  if (/\d{1,2}\.\s?\d{1,2}\.\s?\d{4}|\d{1,2}\.\s?(led|únor|břez|dub|květ|červ|srp|září|říj|listop|prosin)/i.test(block.title))
    return block.title
  const [y, m, d] = block.itemDate.split('-')
  return `${block.title} - ${Number(d)}.${Number(m)}.${y}`
}

// ---------------------------------------------------------------------------
// Zdroj dat
// ---------------------------------------------------------------------------

function loadSource(): { html: string; season: string | null; label: string } {
  if (SOURCE === 'homepage') {
    const hp = DATA('homepage.json') as { enabled: boolean; html: string }[]
    return {
      html: hp.map((h) => h.html).join('\n<hr />\n'),
      season: SEASON_OVERRIDE ?? '2025-2026',
      label: 'homepage.json',
    }
  }
  const legacyId = Number(SOURCE)
  const articles = DATA('articles.json') as {
    legacyId: number
    title: string
    html: string
    season: string | null
  }[]
  const art = articles.find((a) => a.legacyId === legacyId)
  if (!art) throw new Error(`Článek legacyId=${legacyId} v articles.json nenalezen`)
  return {
    html: art.html,
    season: SEASON_OVERRIDE ?? art.season,
    label: `articles.json #${legacyId} „${art.title}"`,
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const { html, season: seasonSlug, label } = loadSource()
const blocks = parseBlocks(html)

const payload = await getPayload({ config })

const season = seasonSlug
  ? (
      await payload.find({
        collection: 'seasons',
        where: { slug: { equals: seasonSlug } },
        limit: 1,
        depth: 0,
      })
    ).docs[0]
  : undefined
const teamMuzi = (
  await payload.find({ collection: 'teams', where: { slug: { equals: 'muzi' } }, limit: 1, depth: 0 })
).docs[0]

const seasonMatches = season
  ? (
      await payload.find({
        collection: 'matches',
        where: { season: { equals: season.id } },
        limit: 0,
        depth: 0,
        sort: 'date',
      })
    ).docs
  : []

// --- dedup proti už naimportovaným článkům sezóny -------------------------
// Archivní úvodní stránky jsou z velké části jen teasery plných článků, které
// import.ts už vytvořil (jinými slovy v titulku). Klíč: kolo + soupeř + datum.
type TitleKey = { round: string | null; teams: Set<string>; dates: Set<string> }

function titleKey(title: string): TitleKey {
  const t = dia(title)
  const round = /(\d+)\s*\.?\s*kolo/.exec(t)?.[1] ?? null
  const teams = new Set(
    [...t.matchAll(new RegExp(TEAM_WORDS.source, 'g'))].map((m) => m[0]).filter((w) => w !== 'cestice'),
  )
  const dates = new Set(
    [...title.matchAll(/(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})/g)].map((m) => toISO(m[1], m[2], m[3])),
  )
  return { round, teams, dates }
}

const overlaps = (a: Set<string>, b: Set<string>) => [...a].some((x) => b.has(x))

/** Odpovídá blok některému existujícímu postu sezóny? */
function findDuplicate(title: string, keys: { key: TitleKey; id: number; title: string }[]) {
  const fp = dia(title).replace(/[^a-z0-9]/g, '')
  const sameTitle = keys.find(
    ({ title: other }) => fp.length > 15 && dia(other).replace(/[^a-z0-9]/g, '') === fp,
  )
  if (sameTitle) return sameTitle

  const k = titleKey(title)
  if (!k.teams.size && !k.dates.size) return undefined
  return keys.find(({ key }) => {
    const sameTeams = k.teams.size > 0 && overlaps(k.teams, key.teams)
    const sameDate = k.dates.size > 0 && overlaps(k.dates, key.dates)
    const sameRound = k.round !== null && k.round === key.round
    return (sameTeams && (sameDate || sameRound)) || (sameDate && sameRound)
  })
}

const seasonPosts = season
  ? (
      await payload.find({
        collection: 'posts',
        where: { season: { equals: season.id } },
        limit: 0,
        depth: 0,
        draft: true,
      })
    ).docs.map((p) => ({ id: p.id as number, title: p.title as string, key: titleKey(p.title as string) }))
  : []

type MediaPick = { id: number; filename: string; width: number | null; height?: number | null }

/**
 * Z obrázků bloku vybere ten do hero panelu. Hero je široký pruh, takže
 * na výšku otočený sken (parte, plakát, rozpis) v něm vypadá špatně — když
 * blok nabízí i snímek na šířku, vyhrává ten.
 */
async function pickHeroPhoto(filenames: string[]): Promise<MediaPick | undefined> {
  const picks: MediaPick[] = []
  for (const filename of filenames) {
    const pick = await bestMedia(filename)
    if (pick) picks.push(pick)
  }
  if (picks.length < 2) return picks[0]

  const ratio = (p: MediaPick) => (p.width && p.height ? p.width / p.height : 0)
  const landscape = picks
    .filter((p) => ratio(p) >= 1.2 && (p.width ?? 0) >= MIN_HERO_WIDTH)
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))
  return landscape[0] ?? picks[0]
}

/**
 * Fotka dle názvu — ale v nejvyšším dostupném rozlišení.
 *
 * Obrázky vložené do editoru eStránky jsou zmenšeniny (`/img/picture/…`, často
 * 140–300 px). Tentýž snímek bývá v `media` i v plné velikosti z fotoalba, jen
 * pod jménem s příponou (`foo-1.jpg`), protože Payload takhle řeší kolizi názvů.
 * Bereme největší variantu se stejným poměrem stran — jiný poměr znamená, že
 * jde o jiný snímek, který se jen shodou okolností jmenuje stejně.
 */
async function bestMedia(filename: string): Promise<MediaPick | undefined> {
  // eStránky občas nesou dvojitou tečku (`foo..jpg`), Payload ji při uploadu
  // normalizoval na `foo.jpg` — bez tohohle stripu se fotka nenajde vůbec
  const base = filename.replace(/\.[a-z0-9]+$/i, '').replace(/\.+$/, '')
  const candidates = (
    await payload.find({
      collection: 'media',
      where: { filename: { like: base } },
      limit: 50,
      depth: 0,
    })
  ).docs
    .map((d) => ({
      id: d.id as number,
      filename: String(d.filename ?? ''),
      width: (d.width as number | null) ?? null,
      height: (d.height as number | null) ?? null,
    }))
    .filter((d) => new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(-\\d+)?\\.[a-z0-9]+$`, 'i').test(d.filename))

  const exact = candidates.find((c) => c.filename === filename)
  // bez přesné shody (přepsaný název) bereme největší variantu — poměr stran
  // není s čím srovnat, ale všechny kandidáty spojuje stejný základ názvu
  if (!exact) return candidates.sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]
  if (!exact.width || !exact.height) return exact

  const ratio = exact.width / exact.height
  const bigger = candidates
    .filter((c) => c.width && c.height && c.width > exact.width!)
    .filter((c) => Math.abs(c.width! / c.height! - ratio) < 0.03)
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]

  return bigger ?? exact
}

/** Zápas dle data (± 1 den, kvůli přepsaným datům v titulcích). */
function findMatch(itemDate: string | null) {
  if (!itemDate) return undefined
  const target = Date.parse(`${itemDate}T12:00:00`)
  let best: (typeof seasonMatches)[number] | undefined
  let bestDiff = Infinity
  for (const m of seasonMatches) {
    const diff = Math.abs(Date.parse(m.date as string) - target)
    if (diff < bestDiff) {
      bestDiff = diff
      best = m
    }
  }
  return bestDiff <= 36 * 3600 * 1000 ? best : undefined
}

// --purge: smaže posty vytvořené tímhle skriptem z daného zdroje (jen s --apply)
if (argv.includes('--purge')) {
  // pozor na prefixy: homepage zapisuje `homepage#zapasid=…` i `homepage:homepage#…`
  const prefixes =
    SOURCE === 'homepage' ? ['homepage#', 'homepage:homepage#'] : [`homepage:${SOURCE}#`]
  const mine = (
    await payload.find({
      collection: 'posts',
      where: { 'legacy.url': { like: 'homepage' } },
      limit: 0,
      depth: 0,
      draft: true,
    })
  ).docs.filter((p) => {
    const url = String((p.legacy as { url?: string } | undefined)?.url ?? '')
    return prefixes.some((prefix) => url.startsWith(prefix))
  })
  console.log(`--purge: ${mine.length} postů ze zdroje „${prefixes.join(' | ')}"${APPLY ? '' : ' (DRY-RUN)'}`)
  for (const p of mine) {
    console.log(`  ${APPLY ? '- smazáno' : '- ke smazání'}: #${p.id} ${String(p.title).slice(0, 70)}`)
    if (APPLY) await payload.delete({ collection: 'posts', id: p.id, ...noRevalidate })
  }
  process.exit(0)
}

console.log(`Zdroj: ${label}`)
console.log(`Sezóna: ${seasonSlug ?? '—'}${season ? '' : ' (v DB nenalezena!)'}`)
console.log(`Režim: ${APPLY ? 'APPLY (zapisuje)' : 'DRY-RUN'}`)
console.log(`Bloků s hlavičkou: ${blocks.length}`)
console.log(`Segmentů bez hlavičky (nejsou články): ${skippedSegments.length}`)
for (const seg of skippedSegments) {
  console.log(`  · ${String(seg.words).padStart(4)}w  ${seg.preview}`)
}
console.log('')

let created = 0
let skippedExisting = 0
let skippedStub = 0
let skippedDuplicate = 0

/** Volný slug — kolize (např. 4× „Změny tréninků") rozlišíme datem. */
async function freeSlug(base: string, date: string | null): Promise<string> {
  const taken = async (s: string) =>
    ((
      await payload.find({
        collection: 'posts',
        where: { slug: { equals: s } },
        limit: 1,
        depth: 0,
        draft: true,
      })
    ).docs.length > 0) || usedSlugs.has(s)
  if (!(await taken(base))) return base
  const dated = date ? `${base}-${date.split('-').reverse().join('-')}` : base
  if (dated !== base && !(await taken(dated))) return dated
  for (let i = 2; i < 30; i++) {
    const candidate = `${dated}-${i}`
    if (!(await taken(candidate))) return candidate
  }
  return `${dated}-x`
}
const usedSlugs = new Set<string>()

for (const block of blocks) {
  const title = postTitle(block)
  const baseSlug = slugify(title)
  const legacyUrl = block.ahlId
    ? `homepage#zapasid=${block.ahlId}`
    : `homepage:${SOURCE}#${baseSlug}`
  const match = block.isMatch ? findMatch(block.itemDate) : undefined
  const photo = await pickHeroPhoto(block.photos)
  // Celoplošný fotohero z drobné grafiky (klubový znak, tabulka, logo) vypadá
  // rozmazaně — takovou fotku zahodíme a necháme typografickou variantu.
  // Výjimka: s navázaným zápasem je hero `zapas`, kde fotka slouží jen jako
  // podklad na 16 % krytí, takže nízké rozlišení nevadí.
  const tooSmall = Boolean(photo?.width && photo.width < MIN_HERO_WIDTH)
  const photoId = photo && !(tooSmall && !match) ? photo.id : undefined
  const type = block.isMatch ? 'report' : 'news'

  const flag = (ok: unknown) => (ok ? '✓' : '✗')
  const info =
    `${(block.publishedDate ?? block.itemDate ?? '????-??-??').padEnd(10)} ` +
    `${type.padEnd(6)} ${flag(match)}zápas ${photo ? `${photoId ? '✓' : '↓'}foto ${String(photo.width ?? '?').padStart(4)}px` : '✗foto      '} ${String(block.words).padStart(3)}w  ` +
    `${title.slice(0, 78)}`

  const existing = await payload.find({
    collection: 'posts',
    where: { 'legacy.url': { equals: legacyUrl } },
    limit: 1,
    depth: 0,
    draft: true,
  })
  if (existing.docs[0]) {
    skippedExisting++
    console.log(`  = EXISTUJE  ${info}  → post #${existing.docs[0].id}`)
    continue
  }

  // Nejsilnější signál teaseru: blok odkazuje „Více zde…" na plný článek,
  // který import.ts už vytvořil (dohledáme dle legacy.url `/clanky/<slug>.html`).
  let teaserOf: { id: number; title: string } | undefined
  for (const link of block.links) {
    const legacyPath = legacyArticlePath(link.href)
    if (!legacyPath) continue
    for (const collection of ['posts', 'pages'] as const) {
      const hit = await payload.find({
        collection,
        where: { 'legacy.url': { equals: legacyPath } },
        limit: 1,
        depth: 0,
        draft: true,
      })
      if (hit.docs[0]) {
        teaserOf = { id: hit.docs[0].id as number, title: hit.docs[0].title as string }
        break
      }
    }
    if (teaserOf) break
  }
  if (teaserOf) {
    skippedDuplicate++
    console.log(
      `  = TEASER    ${info}\n              ↳ plný článek je post #${teaserOf.id} „${teaserOf.title.slice(0, 70)}"`,
    )
    continue
  }

  // shodný titulek napříč sezónami (např. „Odstoupení vedení oddílu…" je
  // na úvodní stránce 2016-2017 i 2017-2018)
  const sameTitle = await payload.find({
    collection: 'posts',
    where: { title: { equals: title } },
    limit: 1,
    depth: 0,
    draft: true,
  })
  const dup =
    (sameTitle.docs[0]
      ? { id: sameTitle.docs[0].id as number, title: sameTitle.docs[0].title as string }
      : undefined) ?? findDuplicate(title, seasonPosts)
  if (dup) {
    skippedDuplicate++
    console.log(`  = DUPLIKÁT  ${info}\n              ↳ už jako post #${dup.id} „${dup.title.slice(0, 70)}"`)
    continue
  }

  // Stub až tady, po vyloučení duplicit — jinak by se ve výpisu ztratilo,
  // jestli je krátký blok teaser existujícího článku, nebo unikátní obsah.
  if (block.words < MIN_WORDS && !block.ahlId) {
    skippedStub++
    console.log(`  – STUB      ${info}`)
    continue
  }

  if (DUMP) {
    for (const line of block.lines) console.log(`        │ ${line}`)
    if (block.goals) console.log(`        │ Branky: ${block.goals}`)
    if (block.photos.length) console.log(`        │ foto: ${block.photos.join(', ')}`)
  }

  if (!APPLY) {
    created++
    console.log(`  + NOVÝ      ${info}`)
    continue
  }

  const heroVariant = match ? 'zapas' : photoId ? 'foto' : 'typograficke'
  const publishedAt = `${block.publishedDate ?? block.itemDate}T18:00:00.000Z`
  const slug = await freeSlug(baseSlug, block.publishedDate ?? block.itemDate)
  usedSlugs.add(slug)
  const excerpt = block.lines[0]?.replace(/[\u{1F300}-\u{1FAFF}☀-➿️]/gu, '').trim()

  const doc = await payload.create({
    collection: 'posts',
    depth: 0,
    data: {
      title,
      slug,
      generateSlug: false,
      contentType: 'richText',
      content: await buildContent(block),
      excerpt: excerpt || undefined,
      heroImage: photoId,
      heroVariant,
      match: match?.id,
      type,
      season: season?.id,
      team: teamMuzi?.id,
      publishedAt,
      legacy: { url: legacyUrl },
      meta: { title, description: excerpt || undefined },
      _status: 'published',
    } as never,
    ...noRevalidate,
  })

  if (match) {
    await payload.update({
      collection: 'matches',
      id: match.id,
      data: { report: doc.id } as never,
      ...noRevalidate,
    })
  }

  created++
  console.log(`  + VYTVOŘENO ${info}  → post #${doc.id}${match ? ` ↔ zápas #${match.id}` : ''}`)
}

console.log(
  `\n${APPLY ? 'Vytvořeno' : 'Ke vytvoření'}: ${created} · existuje: ${skippedExisting} · duplikát: ${skippedDuplicate} · stub: ${skippedStub}`,
)
if (!APPLY) console.log('\nDRY-RUN — nic se nezapsalo. Pro import přidej --apply')
process.exit(0)
