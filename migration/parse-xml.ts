/**
 * Parser zálohy eStránky (Backup_*.xml) → normalizované JSON entity.
 *
 * Vstup:  ../../Backup_2026_08_17_05_52_18.xml (databázový dump eStránky)
 * Výstup: ./data/*.json (articles, sections, galleries, photos, pictures, files, settings, codes)
 *
 * Spuštění: bun run migration/parse-xml.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const XML_PATH = path.resolve(__dirname, '../../Backup_2026_08_17_05_52_18.xml')
const OUT_DIR = path.resolve(__dirname, 'data')

// ---------------------------------------------------------------------------
// Nízkoúrovňový parser: <table name="..."> → řádky → sloupce
// ---------------------------------------------------------------------------

type Row = Record<string, string>

function parseTables(xml: string): Map<string, Row[]> {
  const tables = new Map<string, Row[]>()
  const tableRe = /<table name="([^"]+)">([\s\S]*?)<\/table>/g
  let tm: RegExpExecArray | null
  while ((tm = tableRe.exec(xml))) {
    const [, name, body] = tm
    const rows: Row[] = []
    const rowRe = /<tablerow>([\s\S]*?)<\/tablerow>/g
    let rm: RegExpExecArray | null
    while ((rm = rowRe.exec(body))) {
      const row: Row = {}
      const colRe = /<tablecolumn name="([^"]+)">([\s\S]*?)<\/tablecolumn>/g
      let cm: RegExpExecArray | null
      while ((cm = colRe.exec(rm[1]))) {
        row[cm[1]] = cm[2]
      }
      rows.push(row)
    }
    tables.set(name, rows)
  }
  return tables
}

// ---------------------------------------------------------------------------
// Base64 heuristika — hodnoty jsou NEKONZISTENTNĚ kódované (někde base64,
// někde plain text). Dekóduj jen když výsledek je validní UTF-8 bez
// kontrolních znaků.
// ---------------------------------------------------------------------------

const B64_RE = /^[A-Za-z0-9+/]*={0,2}$/

function maybeDecode(value: string): string {
  const v = value.trim()
  if (v === '') return ''
  if (v.length % 4 !== 0 || !B64_RE.test(v)) return value
  // krátké čistě číselné/alfanumerické hodnoty ("1", "2010") jsou skoro vždy
  // plain — base64 dekódování by z nich udělalo binární šum
  if (/^\d+$/.test(v)) return value
  try {
    const buf = Buffer.from(v, 'base64')
    const decoded = buf.toString('utf8')
    // validní UTF-8? (roundtrip test) + žádné kontrolní znaky kromě \n \r \t
    if (Buffer.from(decoded, 'utf8').compare(buf) !== 0) return value
    // eslint-disable-next-line no-control-regex
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(decoded)) return value
    return decoded
  } catch {
    return value
  }
}

const num = (v: string | undefined): number => (v ? parseInt(v, 10) || 0 : 0)

// ---------------------------------------------------------------------------
// Načtení
// ---------------------------------------------------------------------------

console.log('Čtu XML…')
const xml = fs.readFileSync(XML_PATH, 'utf8')
const tables = parseTables(xml)
for (const [name, rows] of tables) console.log(`  ${name}: ${rows.length} řádků`)

// ---------------------------------------------------------------------------
// Sekce → strom, odvození sezóny a týmu
// ---------------------------------------------------------------------------

type Section = {
  id: number
  parent: number
  title: string
  url: string
  pageTitle: string
  pageKeywords: string
  pageDescription: string
}

const sections = new Map<number, Section>()
for (const r of tables.get('a_sections') ?? []) {
  const id = num(r.id)
  sections.set(id, {
    id,
    parent: num(r.parent_section),
    title: maybeDecode(r.title ?? '').trim(),
    url: maybeDecode(r.url ?? '').trim(),
    pageTitle: maybeDecode(r.page_title ?? '').trim(),
    pageKeywords: maybeDecode(r.page_keywords ?? '').trim(),
    pageDescription: maybeDecode(r.page_description ?? '').trim(),
  })
}

const SEASON_RE = /^\s*(20\d{2})\s*-+\s*(20\d{2})\s*$/
const TEAM_TITLES: Record<string, string> = {
  muži: 'Muži',
  muzi: 'Muži',
  přípravka: 'Přípravka',
  pripravka: 'Přípravka',
  žáci: 'Žáci',
  zaci: 'Žáci',
  dorost: 'Dorost',
  mládež: 'Mládež',
  mladez: 'Mládež',
}

function detectTeamFromTitle(title: string): string | null {
  const t = title.trim().toLowerCase()
  return TEAM_TITLES[t] ?? null
}

function detectSeasonFromText(text: string): string | null {
  const m = text.match(/(20\d{2})\s*[-–/]+\s*(20\d{2})/)
  if (m) return `${m[1]}-${m[2]}`
  return null
}

/** Projde předky sekce a vrátí { season, team } */
function resolveSectionContext(sectionId: number): { season: string | null; team: string | null } {
  let season: string | null = null
  let team: string | null = null
  let cur = sections.get(sectionId)
  const seen = new Set<number>()
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id)
    if (!season) {
      const m = cur.title.match(SEASON_RE)
      if (m) season = `${m[1]}-${m[2]}`
    }
    if (!team) team = detectTeamFromTitle(cur.title)
    cur = sections.get(cur.parent)
  }
  return { season, team }
}

// ---------------------------------------------------------------------------
// Články → klasifikace (viz plán)
// ---------------------------------------------------------------------------

const PAGE_TITLES_RE =
  /historie klubu|kontakty|sponzo|nábor|reklamní předměty|zimním stadionu|pomocná úvodní|hráčské příspěvky|navod|návod/i

type Article = {
  legacyId: number
  slug: string
  title: string
  html: string
  annotation: string
  created: string
  updated: string
  dateDisplay: string
  publish: boolean
  notInMenu: boolean
  sectionId: number
  target: 'page' | 'post'
  type: 'news' | 'report' | 'roster' | 'schedule' | 'standings'
  season: string | null
  team: string | null
  meta: { title: string; keywords: string; description: string }
  counter: number
}

const articles: Article[] = []
for (const r of tables.get('a_articles') ?? []) {
  const title = maybeDecode(r.title ?? '').trim()
  const slug = maybeDecode(r.url ?? '').trim()
  const sectionId = num(r.section)
  const ctx = resolveSectionContext(sectionId)

  // typ dle heuristiky z plánu
  let type: Article['type'] = 'news'
  let target: Article['target'] = 'post'
  const sec = sections.get(sectionId)
  const secTitle = sec?.title ?? ''

  if (/soupiska/i.test(title)) type = 'roster'
  else if (/rozpis|rozlosov/i.test(title)) type = 'schedule'
  else if (/tabulka|výsledky|vysledky/i.test(title)) type = 'standings'
  else if (
    /\d+\.?\s*kolo/i.test(slug + ' ' + title) ||
    /x[- ]hc[- ]cestice|hc[- ]cestice[- ]x|x-hc-|-x-/i.test(slug) ||
    /zápasech|zapasech|zápasy|zapasy/i.test(secTitle)
  )
    type = 'report'

  if (sectionId === 0 && PAGE_TITLES_RE.test(title) && type === 'news') {
    target = 'page'
  }

  // season/team: nejdřív sekce, pak titulek
  const season = ctx.season ?? detectSeasonFromText(title) ?? detectSeasonFromText(slug)
  const team = ctx.team ?? detectTeamFromTitle(title)

  articles.push({
    legacyId: num(r.id),
    slug,
    title,
    html: maybeDecode(r.content ?? ''),
    annotation: maybeDecode(r.annotation ?? '').trim(),
    created: r.created ?? '',
    updated: r.updated ?? '',
    dateDisplay: r.date_display ?? '',
    publish: r.publish === '1',
    notInMenu: r.notinmenu === '1',
    sectionId,
    target,
    type,
    season,
    team,
    meta: {
      title: maybeDecode(r.page_title ?? '').trim(),
      keywords: maybeDecode(r.page_keywords ?? '').trim(),
      description: maybeDecode(r.page_description ?? '').trim(),
    },
    counter: num(r.counter),
  })
}

// ---------------------------------------------------------------------------
// Fotoalba: p_directories (+_lang) → galerie s season/team/date + cesta na disku
// ---------------------------------------------------------------------------

type Dir = {
  id: number
  parent: number
  slug: string // dir = jméno složky na FTP
  quantity: number
  title: string
  url: string
  annotation: string
}

const dirs = new Map<number, Dir>()
{
  // lang řádky klíčované přes iid
  const langByIid = new Map<number, Row>()
  for (const r of tables.get('p_directories_lang') ?? []) {
    langByIid.set(num(r.iid), r)
  }
  for (const r of tables.get('p_directories') ?? []) {
    const id = num(r.id)
    const lang = langByIid.get(id)
    dirs.set(id, {
      id,
      parent: num(r.parent_directory),
      slug: maybeDecode(r.dir ?? '').trim(),
      quantity: num(r.quantity),
      title: (lang ? maybeDecode(lang.title ?? '').trim() : '') || maybeDecode(r.dir ?? '').trim(),
      url: lang ? maybeDecode(lang.url ?? '').trim() : '',
      annotation: lang ? maybeDecode(lang.annotation ?? '').trim() : '',
    })
  }
}

/** Cesta složky na FTP disku (řetězení slugů předků) */
function dirDiskPath(id: number): string {
  const parts: string[] = []
  let cur = dirs.get(id)
  const seen = new Set<number>()
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id)
    parts.unshift(cur.slug)
    cur = dirs.get(cur.parent)
  }
  return parts.join('/')
}

function resolveDirContext(id: number): { season: string | null; team: string | null } {
  let season: string | null = null
  let team: string | null = null
  let cur = dirs.get(id)
  const seen = new Set<number>()
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id)
    if (!season) season = detectSeasonFromText(cur.title) ?? detectSeasonFromText(cur.slug)
    if (!team) team = detectTeamFromTitle(cur.title)
    cur = dirs.get(cur.parent)
  }
  return { season, team }
}

/** Datum z názvu složky: 8_1_2009 / 10.2.2017 / 28.12.2013 / 22.prosince-2024 */
const CZECH_MONTHS: Record<string, number> = {
  ledna: 1, unora: 2, února: 2, brezna: 3, března: 3, dubna: 4, kvetna: 5, května: 5,
  cervna: 6, června: 6, cervence: 7, července: 7, srpna: 8, zari: 9, září: 9,
  rijna: 10, října: 10, listopadu: 11, prosince: 12,
}

function detectDateFromName(name: string): string | null {
  let m = name.match(/(\d{1,2})[._-](\d{1,2})[._-](20\d{2})/)
  if (m) {
    const [, d, mo, y] = m
    const day = parseInt(d, 10)
    const month = parseInt(mo, 10)
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }
  m = name.match(/(\d{1,2})\.?\s*[.-]?\s*(ledna|února|unora|března|brezna|dubna|května|kvetna|června|cervna|července|cervence|srpna|září|zari|října|rijna|listopadu|prosince)[.-]*\s*(20\d{2})/i)
  if (m) {
    const day = parseInt(m[1], 10)
    const month = CZECH_MONTHS[m[2].toLowerCase()]
    if (month && day >= 1 && day <= 31) {
      return `${m[3]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }
  return null
}

// fotky podle adresáře
type Photo = {
  legacyId: number
  directory: number
  filename: string
  width: number
  height: number
  title: string
  order: number
}

const photosByDir = new Map<number, Photo[]>()
{
  const langByIid = new Map<number, Row>()
  for (const r of tables.get('p_photos_lang') ?? []) langByIid.set(num(r.iid), r)
  for (const r of tables.get('p_photos') ?? []) {
    const id = num(r.id)
    const lang = langByIid.get(id)
    const photo: Photo = {
      legacyId: id,
      directory: num(r.directory),
      filename: maybeDecode(r.filename ?? '').trim(),
      width: num(r.width),
      height: num(r.height),
      title: lang ? maybeDecode(lang.title ?? '').trim() : '',
      order: lang ? num(lang.order) : 0,
    }
    const arr = photosByDir.get(photo.directory) ?? []
    arr.push(photo)
    photosByDir.set(photo.directory, arr)
  }
  for (const arr of photosByDir.values()) arr.sort((a, b) => a.order - b.order)
}

const THEME_ROOTS = /zimní stadion|zimni|historie|hráči|hraci|ostatní|ostatni|__admin__/i

type Gallery = {
  legacyDir: number
  title: string
  slug: string
  diskPath: string
  legacyPath: string
  season: string | null
  team: string | null
  group: 'season' | 'theme'
  date: string | null
  isAdminDir: boolean
  photos: Photo[]
}

const galleries: Gallery[] = []
for (const d of dirs.values()) {
  const photos = photosByDir.get(d.id) ?? []
  if (photos.length === 0) continue // složky bez fotek galerii netvoří (jen sdružují)
  const ctx = resolveDirContext(d.id)
  const diskPath = dirDiskPath(d.id)
  const isAdminDir = /(^|\/)__admin__(\/|$)/.test(diskPath)
  // tematická = bez sezóny NEBO pod tematickým kořenem
  const group: Gallery['group'] = ctx.season && !THEME_ROOTS.test(diskPath) ? 'season' : 'theme'
  galleries.push({
    legacyDir: d.id,
    title: d.title,
    slug: d.slug,
    diskPath,
    legacyPath: '/fotoalbum/' + diskPath,
    season: ctx.season,
    team: ctx.team,
    group,
    date: detectDateFromName(d.slug) ?? detectDateFromName(d.title),
    isAdminDir,
    photos,
  })
}

// ---------------------------------------------------------------------------
// s_pictures (obrázky článků), s_files (soubory), settings, s_codes
// ---------------------------------------------------------------------------

const pictures = (tables.get('s_pictures') ?? []).map((r) => ({
  legacyId: num(r.id),
  filename: maybeDecode(r.filename ?? '').trim(),
}))

const files = (tables.get('s_files') ?? []).map((r) => ({
  legacyId: num(r.id),
  name: maybeDecode(r.name ?? '').trim(),
  filename: maybeDecode(r.filename ?? '').trim(),
  filesize: num(r.filesize),
}))

const settings: Record<string, string> = {}
for (const r of tables.get('settings') ?? []) {
  const key = maybeDecode(r.identifier ?? '').trim()
  if (key) settings[key] = maybeDecode(r.data ?? '')
}

const codes = (tables.get('s_codes') ?? []).map((r) => ({
  legacyId: num(r.id),
  enabled: r.enabled === '1',
  title: maybeDecode(r.title ?? '').trim(),
  // kód je HTML-escapovaný v DB → odescapovat
  html: maybeDecode(r.code ?? '')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&'),
}))

const homepage = (tables.get('s_hp') ?? []).map((r) => ({
  enabled: r.s_hp_text_enabled === '1',
  html: maybeDecode(r.s_hp_text_content ?? ''),
}))

// ---------------------------------------------------------------------------
// Výstup
// ---------------------------------------------------------------------------

fs.mkdirSync(OUT_DIR, { recursive: true })
const write = (name: string, data: unknown) => {
  const p = path.join(OUT_DIR, name)
  fs.writeFileSync(p, JSON.stringify(data, null, 2))
  console.log(`  → ${name}`)
}

console.log('Zapisuji JSON…')
write('articles.json', articles)
write('sections.json', [...sections.values()])
write('galleries.json', galleries)
write('pictures.json', pictures)
write('files.json', files)
write('settings.json', settings)
write('codes.json', codes)
write('homepage.json', homepage)

// ---------------------------------------------------------------------------
// Souhrn
// ---------------------------------------------------------------------------

const byTarget = { page: 0, post: 0 }
const byType: Record<string, number> = {}
for (const a of articles) {
  byTarget[a.target]++
  byType[a.type] = (byType[a.type] ?? 0) + 1
}
const totalPhotos = galleries.reduce((s, g) => s + g.photos.length, 0)
const seasonsFound = new Set(galleries.map((g) => g.season).filter(Boolean))
for (const a of articles) if (a.season) seasonsFound.add(a.season)

console.log('\n=== SOUHRN ===')
console.log(`Články: ${articles.length} (pages: ${byTarget.page}, posts: ${byTarget.post})`)
console.log(`  typy:`, byType)
console.log(`Galerie: ${galleries.length} (fotek: ${totalPhotos})`)
console.log(`  sezónní: ${galleries.filter((g) => g.group === 'season').length}, tematické: ${galleries.filter((g) => g.group === 'theme').length}, admin: ${galleries.filter((g) => g.isAdminDir).length}`)
console.log(`  s datem: ${galleries.filter((g) => g.date).length}`)
console.log(`Sezóny detekované: ${[...seasonsFound].sort().join(', ')}`)
console.log(`Obrázky článků (s_pictures): ${pictures.length}`)
console.log(`Soubory (s_files): ${files.length}`)
console.log(`Settings: ${Object.keys(settings).length}, Codes: ${codes.length}`)
