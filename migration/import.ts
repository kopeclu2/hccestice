/**
 * Import dat z eStránky do Payload (Local API).
 *
 * Pořadí: média → sezóny/týmy/soupeři → galerie → články (pages/posts)
 *         → siteConfig/sidebar/homepage → redirecty
 *
 * Idempotentní: existující záznamy (podle legacy markerů) se přeskakují,
 * takže skript lze po přerušení spustit znovu.
 *
 * Spuštění: bun run payload run migration/import.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA = (name: string) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, 'data', name), 'utf8'))
const MIRROR = path.resolve(__dirname, '../../ftp_mirror')

// „2012-2012" byla překlepová složka pro sezónu 2012-2013
const SEASON_ALIAS: Record<string, string> = { '2012-2012': '2012-2013' }
const normSeason = (s: string | null): string | null => (s ? (SEASON_ALIAS[s] ?? s) : null)

const TEAM_CATEGORY: Record<string, 'men' | 'youth' | 'prep'> = {
  Muži: 'men',
  Přípravka: 'prep',
  Žáci: 'youth',
  Dorost: 'youth',
  Mládež: 'youth',
}

type Ctx = Awaited<ReturnType<typeof getPayload>>
const noRevalidate = { context: { disableRevalidate: true } }

// Index celého mirroru podle basename — fallback, když soubor neleží na
// cestě z DB (např. fotky hráčů jsou na FTP jinde, než tvrdí p_directories)
let basenameIndex: Map<string, string> | null = null
function findByBasename(filename: string): string | null {
  if (!basenameIndex) {
    basenameIndex = new Map()
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) walk(p)
        else if (!basenameIndex!.has(e.name.toLowerCase())) basenameIndex!.set(e.name.toLowerCase(), p)
      }
    }
    walk(MIRROR)
  }
  return basenameIndex.get(filename.toLowerCase()) ?? null
}

async function findMediaByLegacy(payload: Ctx, source: string, legacyId: number) {
  const res = await payload.find({
    collection: 'media',
    where: {
      and: [{ 'legacy.source': { equals: source } }, { 'legacy.legacyId': { equals: legacyId } }],
    },
    limit: 1,
    depth: 0,
  })
  return res.docs[0] ?? null
}

const failedUploads: string[] = []

async function uploadMedia(
  payload: Ctx,
  args: {
    filePath: string
    alt: string
    source: 'img_picture' | 'file' | 'photo' | 'ftp'
    legacyId: number
    legacyPath: string
  },
) {
  const existing = await findMediaByLegacy(payload, args.source, args.legacyId)
  if (existing) return existing
  try {
    return await payload.create({
      collection: 'media',
      data: {
        alt: args.alt,
        legacy: { source: args.source, legacyId: args.legacyId, legacyPath: args.legacyPath },
      },
      filePath: args.filePath,
      ...noRevalidate,
    })
  } catch (err) {
    // poškozený/extrémní obrázek nesmí shodit celou migraci — zaloguj a pokračuj
    failedUploads.push(`${args.legacyPath}: ${(err as Error).message}`)
    console.error(`  ! upload selhal: ${args.legacyPath} — ${(err as Error).message}`)
    return null
  }
}

async function main() {
  const payload = await getPayload({ config })
  const t0 = Date.now()
  const log = (msg: string) =>
    console.log(`[${Math.round((Date.now() - t0) / 1000)}s] ${msg}`)

  const articles = DATA('articles.json') as any[]
  const galleries = DATA('galleries.json') as any[]
  const pictures = DATA('pictures.json') as any[]
  const files = DATA('files.json') as any[]
  const settings = DATA('settings.json') as Record<string, string>
  const codes = DATA('codes.json') as any[]
  const homepage = DATA('homepage.json') as any[]

  // ==========================================================================
  // 1) MÉDIA
  // ==========================================================================

  // /img/picture/{id}/... → media URL
  const pictureUrl = new Map<number, string>()
  log(`Média: obrázky článků (${pictures.length})…`)
  let done = 0
  for (const p of pictures) {
    const filePath = path.join(MIRROR, 'img/picture', String(p.legacyId), p.filename)
    if (!fs.existsSync(filePath)) {
      log(`  ! chybí na disku: img/picture/${p.legacyId}/${p.filename}`)
      continue
    }
    const doc = await uploadMedia(payload, {
      filePath,
      alt: p.filename.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' '),
      source: 'img_picture',
      legacyId: p.legacyId,
      legacyPath: `/img/picture/${p.legacyId}/${p.filename}`,
    })
    if (doc?.url) pictureUrl.set(p.legacyId, doc.url)
    if (++done % 100 === 0) log(`  …${done}/${pictures.length}`)
  }
  log(`  hotovo (${pictureUrl.size} namapováno)`)

  // /file/{id}/... → media URL
  const fileUrl = new Map<number, string>()
  log(`Média: soubory (${files.length})…`)
  for (const f of files) {
    let filePath = path.join(MIRROR, '__files__', f.filename)
    if (!fs.existsSync(filePath)) {
      const alt = findByBasename(f.filename)
      if (!alt) {
        log(`  ! chybí na disku: __files__/${f.filename}`)
        continue
      }
      filePath = alt
    }
    const doc = await uploadMedia(payload, {
      filePath,
      alt: f.name,
      source: 'file',
      legacyId: f.legacyId,
      legacyPath: `/file/${f.legacyId}/${f.filename}`,
    })
    if (doc?.url) fileUrl.set(f.legacyId, doc.url)
  }
  log(`  hotovo (${fileUrl.size} namapováno)`)

  // fotky alb → media (klíč = p_photos.id); zároveň mapa legacyPath → URL
  const photoDoc = new Map<number, { id: number; url: string }>()
  const totalPhotos = galleries.reduce((s: number, g: any) => s + g.photos.length, 0)
  log(`Média: fotky alb (${totalPhotos})…`)
  done = 0
  for (const g of galleries) {
    for (const p of g.photos) {
      let filePath = path.join(MIRROR, g.diskPath, p.filename)
      if (!fs.existsSync(filePath)) {
        const alt = findByBasename(p.filename)
        if (!alt) {
          log(`  ! chybí na disku: ${g.diskPath}/${p.filename}`)
          continue
        }
        filePath = alt
      }
      const doc = await uploadMedia(payload, {
        filePath,
        alt: p.title || g.title,
        source: 'photo',
        legacyId: p.legacyId,
        legacyPath: `/fotoalbum/${g.diskPath}/${p.filename}`,
      })
      if (doc?.url) photoDoc.set(p.legacyId, { id: doc.id as number, url: doc.url })
      if (++done % 250 === 0) log(`  …${done}/${totalPhotos}`)
    }
  }
  log(`  hotovo (${photoDoc.size} namapováno)`)

  // ==========================================================================
  // 2) TAXONOMIE: sezóny, týmy, soupeři
  // ==========================================================================

  const seasonKeys = new Set<string>()
  for (const a of articles) if (a.season) seasonKeys.add(normSeason(a.season)!)
  for (const g of galleries) if (g.season) seasonKeys.add(normSeason(g.season)!)

  const seasonId = new Map<string, number>()
  for (const key of [...seasonKeys].sort()) {
    const [a, b] = key.split('-')
    const existing = await payload.find({
      collection: 'seasons',
      where: { slug: { equals: key } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) {
      seasonId.set(key, existing.docs[0].id as number)
      continue
    }
    const doc = await payload.create({
      collection: 'seasons',
      data: {
        title: `${a} – ${b}`,
        slug: key,
        generateSlug: false,
        startYear: parseInt(a, 10),
        isCurrent: key === '2025-2026',
      } as any,
      ...noRevalidate,
    })
    seasonId.set(key, doc.id as number)
  }
  log(`Sezóny: ${seasonId.size}`)

  const teamId = new Map<string, number>()
  let order = 0
  for (const name of ['Muži', 'Dorost', 'Žáci', 'Přípravka', 'Mládež']) {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
    const existing = await payload.find({
      collection: 'teams',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) {
      teamId.set(name, existing.docs[0].id as number)
      order++
      continue
    }
    const doc = await payload.create({
      collection: 'teams',
      data: {
        name,
        slug,
        generateSlug: false,
        category: TEAM_CATEGORY[name],
        order: order++,
      } as any,
      ...noRevalidate,
    })
    teamId.set(name, doc.id as number)
  }
  log(`Týmy: ${teamId.size}`)

  // Soupeři — poloautomaticky z log v __files__ (hc_*.png apod.)
  const OPPONENT_LOGOS: Record<string, string> = {
    'HC Skuteč': 'hc_skutec.png',
    'SK Žamberk': 'hc-zamberk.png',
    'HC Litomyšl': 'hc_litomysl.png',
    'HC Spartak Choceň': 'hc_chocen.png',
    'HC Polička': 'hc_policka.png',
    'HC Opočno': 'hc_opocno_baroni.png',
    'HC Moravská Třebová': 'hc_moravska_trebova.png',
    'HC Aloha Lanškroun': 'hc_aloha-lanskroun.png',
    'HC Loko Česká Třebová': 'hc_loko_ceska_trebova.png',
  }
  let opponentsCreated = 0
  for (const [name, logoFile] of Object.entries(OPPONENT_LOGOS)) {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    const existing = await payload.find({
      collection: 'opponents',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) continue
    let logoId: number | undefined
    const logoPath = path.join(MIRROR, '__files__', logoFile)
    if (fs.existsSync(logoPath)) {
      const logoDoc = await payload.create({
        collection: 'media',
        data: { alt: `Logo ${name}`, legacy: { source: 'ftp', legacyPath: `/__files__/${logoFile}` } },
        filePath: logoPath,
        ...noRevalidate,
      })
      logoId = logoDoc.id as number
    }
    await payload.create({
      collection: 'opponents',
      data: { name, slug, generateSlug: false, logo: logoId } as any,
      ...noRevalidate,
    })
    opponentsCreated++
  }
  log(`Soupeři: +${opponentsCreated}`)

  // ==========================================================================
  // 3) GALERIE (jen veřejné — __admin__ složky ne)
  // ==========================================================================

  const galleryBySlugUsed = new Set<string>()
  const galleryRoute = new Map<string, string>() // legacyPath(dir) → /fotogalerie/{slug}
  const publicGalleries = galleries.filter((g: any) => !g.isAdminDir)
  log(`Galerie: ${publicGalleries.length} veřejných…`)
  for (const g of publicGalleries) {
    // unikátní slug (názvy složek se napříč sezónami opakují, např. "zaci")
    let slug = g.slug
    if (galleryBySlugUsed.has(slug)) slug = `${g.slug}-${g.legacyDir}`
    galleryBySlugUsed.add(slug)
    galleryRoute.set(g.legacyPath, `/fotogalerie/${slug}`)

    const existing = await payload.find({
      collection: 'galleries',
      where: { legacyDir: { equals: g.legacyDir } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) continue

    const photoItems = g.photos
      .map((p: any) => photoDoc.get(p.legacyId))
      .filter(Boolean)
      .map((d: any, i: number) => ({
        image: d.id,
        caption: g.photos[i]?.title || undefined,
      }))

    await payload.create({
      collection: 'galleries',
      data: {
        title: g.title,
        slug,
        generateSlug: false,
        date: g.date || undefined,
        season: g.season ? seasonId.get(normSeason(g.season)!) : undefined,
        team: g.team ? teamId.get(g.team) : undefined,
        group: g.group,
        cover: photoItems[0]?.image,
        photos: photoItems,
        legacyDir: g.legacyDir,
        legacyPath: g.legacyPath,
      } as any,
      ...noRevalidate,
    })
  }
  log(`  hotovo`)

  // ==========================================================================
  // 4) PŘEPIS ODKAZŮ v HTML
  // ==========================================================================

  const articleRoute = new Map<string, string>() // starý slug → nová cesta
  for (const a of articles) {
    articleRoute.set(a.slug, a.target === 'page' ? `/${a.slug}` : `/posts/${a.slug}`)
  }
  // fotky: legacyPath → media URL (pro <img src="/fotoalbum/...">)
  const photoPathUrl = new Map<string, string>()
  for (const g of galleries) {
    for (const p of g.photos) {
      const d = photoDoc.get(p.legacyId)
      if (d) photoPathUrl.set(`/fotoalbum/${g.diskPath}/${p.filename}`.toLowerCase(), d.url)
    }
  }
  const galleryPrefixes = [...galleryRoute.keys()].sort((a, b) => b.length - a.length)

  function rewriteHtml(html: string): string {
    let out = html
    // absolutní URL na vlastní doménu → relativní
    out = out.replace(/https?:\/\/(www\.)?hccestice\.cz/gi, '')
    // obrázky článků
    out = out.replace(/\/img\/picture\/(\d+)\/[^"'\s)]+/g, (m, id) => {
      return pictureUrl.get(parseInt(id, 10)) ?? m
    })
    // soubory
    out = out.replace(/\/file\/(\d+)\/[^"'\s)]+/g, (m, id) => {
      return fileUrl.get(parseInt(id, 10)) ?? m
    })
    // odkazy na fotky/alba
    out = out.replace(/\/fotoalbum\/[^"'\s)]+/g, (m) => {
      const clean = decodeURIComponent(m).replace(/\.html?$/i, '')
      const direct = photoPathUrl.get(clean.toLowerCase())
      if (direct) return direct
      for (const prefix of galleryPrefixes) {
        if (clean.toLowerCase().startsWith(prefix.toLowerCase())) return galleryRoute.get(prefix)!
      }
      return m
    })
    // interní odkazy na články
    out = out.replace(/\/clanky\/([^"'\s)]+?)\.html/g, (m, slug) => {
      return articleRoute.get(decodeURIComponent(slug)) ?? m
    })
    return out
  }

  // ==========================================================================
  // 5) ČLÁNKY → pages / posts
  // ==========================================================================

  log(`Články: ${articles.length}…`)
  const articleDocId = new Map<number, { collection: 'pages' | 'posts'; id: number }>()
  done = 0
  for (const a of articles) {
    const collection = a.target === 'page' ? 'pages' : 'posts'
    const existing = await payload.find({
      collection,
      where: { 'legacy.articleId': { equals: a.legacyId } },
      limit: 1,
      depth: 0,
      draft: true,
    })
    if (existing.docs[0]) {
      articleDocId.set(a.legacyId, { collection, id: existing.docs[0].id as number })
      done++
      continue
    }

    const html = rewriteHtml(a.html)
    const publishedAt = a.dateDisplay && a.dateDisplay !== '0000-00-00' ? a.dateDisplay : a.created
    const meta = {
      title: a.meta.title || a.title,
      description: a.meta.description || a.annotation || undefined,
    }

    let doc
    if (collection === 'pages') {
      doc = await payload.create({
        collection: 'pages',
        depth: 0,
        data: {
          title: a.title,
          slug: a.slug,
          generateSlug: false,
          hero: { type: 'none' },
          layout: [{ blockType: 'rawHtml', html }],
          publishedAt,
          legacy: { articleId: a.legacyId, url: `/clanky/${a.slug}.html` },
          meta,
          _status: a.publish ? 'published' : 'draft',
        } as any,
        ...noRevalidate,
      })
    } else {
      doc = await payload.create({
        collection: 'posts',
        depth: 0,
        data: {
          title: a.title,
          slug: a.slug,
          generateSlug: false,
          contentType: 'html',
          legacyHtml: html,
          type: a.type,
          season: a.season ? seasonId.get(normSeason(a.season)!) : undefined,
          team: a.team ? teamId.get(a.team) : undefined,
          publishedAt,
          legacy: { articleId: a.legacyId, url: `/clanky/${a.slug}.html` },
          meta,
          _status: a.publish ? 'published' : 'draft',
        } as any,
        ...noRevalidate,
      })
    }
    articleDocId.set(a.legacyId, { collection, id: doc.id as number })
    if (++done % 50 === 0) log(`  …${done}/${articles.length}`)
  }
  log(`  hotovo`)

  // ==========================================================================
  // 6) SITE CONFIG, SIDEBAR, HOMEPAGE
  // ==========================================================================

  await payload.updateGlobal({
    slug: 'siteConfig',
    data: {
      titleText: settings['s_title_text'] || 'HC Čestice',
      contactEmail: settings['s_m_contact_email'] || undefined,
      facebook: settings['facebook'] || undefined,
      instagram: settings['instagram'] || undefined,
    } as any,
    ...noRevalidate,
  })
  log('siteConfig nastaven')

  const enabledCodes = codes.filter((c: any) => c.enabled)
  await payload.updateGlobal({
    slug: 'sidebar',
    data: {
      widgets: enabledCodes.map((c: any) => ({
        blockType: 'rawHtml',
        blockName: c.title.trim() || undefined,
        html: rewriteHtml(c.html),
      })),
    } as any,
    ...noRevalidate,
  })
  log(`sidebar: ${enabledCodes.length} widgetů (RawHtml, k postupnému překlopení)`)

  // homepage → page se slugem 'home'
  const hp = homepage[0]
  if (hp?.enabled && hp.html) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
      limit: 1,
      depth: 0,
      draft: true,
    })
    if (!existing.docs[0]) {
      await payload.create({
        collection: 'pages',
        depth: 0,
        data: {
          title: settings['s_title_text'] || 'HC Čestice',
          slug: 'home',
          generateSlug: false,
          hero: { type: 'none' },
          layout: [{ blockType: 'rawHtml', html: rewriteHtml(hp.html) }],
          legacy: { url: '/' },
          _status: 'published',
        } as any,
        ...noRevalidate,
      })
      log('homepage vytvořena (slug: home)')
    }
  }

  // ==========================================================================
  // 7) REDIRECTY (301 ze starých URL)
  // ==========================================================================

  log('Redirecty…')
  let redirects = 0
  async function ensureRedirect(from: string, to: any) {
    const existing = await payload.find({
      collection: 'redirects',
      where: { from: { equals: from } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) return
    await payload.create({ collection: 'redirects', data: { from, to } as any, ...noRevalidate })
    redirects++
  }

  for (const a of articles) {
    const target = articleDocId.get(a.legacyId)
    if (!target) continue
    await ensureRedirect(`/clanky/${a.slug}.html`, {
      type: 'reference',
      reference: { relationTo: target.collection, value: target.id },
    })
  }
  for (const [legacyPath, route] of galleryRoute) {
    await ensureRedirect(legacyPath, { type: 'custom', url: route })
  }
  log(`  +${redirects} redirectů`)

  // ==========================================================================
  // SOUHRN
  // ==========================================================================

  const counts: Record<string, number> = {}
  for (const c of ['media', 'pages', 'posts', 'seasons', 'teams', 'opponents', 'galleries', 'redirects'] as const) {
    const r = await payload.count({ collection: c })
    counts[c] = r.totalDocs
  }
  console.log('\n=== IMPORT DOKONČEN ===')
  console.table(counts)
  if (failedUploads.length) {
    console.log(`\nSelhané uploady (${failedUploads.length}):`)
    failedUploads.forEach((f) => console.log('  -', f))
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
