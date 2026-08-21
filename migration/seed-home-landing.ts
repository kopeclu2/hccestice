// @ts-nocheck — HISTORICKÝ skript: global `landingPage` byl po migraci
// (2026-08-18) odstraněn z konfigurace, skript už nelze spustit znovu.
// Ponechán jako dokumentace, jak se obsah převedl na home stránku s bloky.
/**
 * Migrace obsahu landing page: global `landingPage` → dokument `pages`
 * se slugem „home" složený z landing bloků (layout builder).
 *
 * ⚠️ Musí běžet, dokud je global `landingPage` ještě registrovaný
 * v payload.config (čte z něj data). Až po úspěšném běhu se global
 * odstraňuje z konfigurace.
 *
 * Kroky:
 *  1. importovaná legacy homepage (slug `home` z eStránek) → `home-legacy`
 *  2. nový publikovaný doc `home` s 12 landing bloky z dat globalu
 *  3. patička z globalu → `siteConfig.footer` (pevná část stránky)
 *
 * Idempotentní: existující home s landing bloky se nepřepíše bez --force.
 *
 * Spuštění: bun --env-file=.env migration/seed-home-landing.ts [--force]
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const force = process.argv.includes('--force')
const payload = await getPayload({ config })
const ctx = { disableRevalidate: true }

/** Payload array rows mají `id` — při kopii mezi dokumenty je zahodit. */
const stripIds = <T extends Record<string, unknown>>(rows: T[] | null | undefined) =>
  (rows ?? []).map(({ id: _id, ...rest }) => rest)

// ── 1) legacy home → home-legacy ────────────────────────────────────────────
const existingHome = (
  await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1, depth: 0 })
).docs[0]

if (existingHome) {
  const isLandingHome = (existingHome.layout ?? []).some((b: any) =>
    String(b.blockType).startsWith('landing'),
  )
  if (isLandingHome && !force) {
    console.log('Home stránka s landing bloky už existuje (--force přepíše). Konec.')
    process.exit(0)
  }
  if (!isLandingHome) {
    await payload.update({
      collection: 'pages',
      id: existingHome.id,
      data: { slug: 'home-legacy', generateSlug: false, _status: 'draft' } as any,
      context: ctx,
    })
    console.log(`Legacy homepage (id ${existingHome.id}) přejmenována na home-legacy (draft)`)
  }
}

// ── 2) data z globalu → landing bloky ───────────────────────────────────────
const g = await payload.findGlobal({ slug: 'landingPage', depth: 0 })

const layout = [
  {
    blockType: 'landingHero',
    photo: g.hero?.photo,
    intro: g.hero?.intro,
    headlineLight: g.hero?.headlineLight,
    headlineBold: g.hero?.headlineBold,
    ctaLabel: g.hero?.ctaLabel,
    navCtaLabel: g.hero?.navCtaLabel,
  },
  {
    blockType: 'landingNews',
    main: g.news?.main,
    items: stripIds(g.news?.items as any),
    highlight: g.news?.highlight,
  },
  {
    blockType: 'landingSeason',
    reportPhotos: stripIds(g.season?.reportPhotos as any),
    standings: g.season?.standings
      ? { ...g.season.standings, rows: stripIds(g.season.standings.rows as any) }
      : undefined,
  },
  {
    blockType: 'landingStats',
    seasonLabel: g.season?.stats?.seasonLabel,
    items: stripIds(g.season?.stats?.items as any),
  },
  {
    blockType: 'landingTrainings',
    headline: g.trainings?.headline,
    headlineHighlight: g.trainings?.headlineHighlight,
    headlineRest: g.trainings?.headlineRest,
    perex: g.trainings?.perex,
    rows: stripIds(g.trainings?.rows as any),
    photo: g.trainings?.photo,
    photoTitle: g.trainings?.photoTitle,
    photoSubtitle: g.trainings?.photoSubtitle,
    event: g.trainings?.event,
  },
  {
    blockType: 'landingClub',
    kicker: g.club?.kicker,
    headlineStart: g.club?.headlineStart,
    headlineHighlight: g.club?.headlineHighlight,
    perex: g.club?.perex,
    ctaLabel: g.club?.ctaLabel,
    stadium: g.club?.stadium,
    youth: g.club?.youth,
    note: g.club?.note,
  },
  { blockType: 'landingAlbum', mosaic: stripIds(g.album?.mosaic as any) },
  {
    blockType: 'landingHistory',
    kicker: g.history?.kicker,
    watermark: g.history?.watermark,
    headline: g.history?.headline,
    perex: g.history?.perex,
    milestones: stripIds(g.history?.milestones as any),
  },
  {
    blockType: 'landingPeople',
    intro: g.peopleSection?.intro,
    people: g.peopleSection?.people,
  },
  {
    blockType: 'landingSponsors',
    title: 'Klub drží nad vodou naši partneři',
    ctaLabel: 'Chci podpořit klub',
  },
  { blockType: 'landingFaq', items: stripIds(g.faq?.items as any) },
  {
    blockType: 'landingContact',
    kicker: g.contact?.kicker,
    perex: g.contact?.perex,
    pills: stripIds(g.contact?.pills as any),
    topics: stripIds(g.contact?.topics as any),
  },
]

const homeData = {
  title: 'HC Čestice — hokejový klub',
  slug: 'home',
  generateSlug: false,
  hero: { type: 'none' },
  layout,
  meta: {
    title: 'HC Čestice — hokejový klub | TJ Sokol Čestice',
    description:
      'Hokejový klub HC Čestice (TJ Sokol Čestice) hraje Východočeskou hokejovou ligu. Zápasy, výsledky, tréninky, fotoalbum a nábor nových hráčů i mládeže.',
  },
  _status: 'published',
} as any

const landingHome = (
  await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1, depth: 0 })
).docs[0]

if (landingHome) {
  await payload.update({ collection: 'pages', id: landingHome.id, data: homeData, context: ctx })
  console.log(`Home stránka aktualizována (id ${landingHome.id}, ${layout.length} bloků)`)
} else {
  const created = await payload.create({ collection: 'pages', data: homeData, context: ctx })
  console.log(`Home stránka vytvořena (id ${created.id}, ${layout.length} bloků)`)
}

// ── 3) patička → siteConfig.footer ──────────────────────────────────────────
await payload.updateGlobal({
  slug: 'siteConfig',
  data: {
    footer: {
      photo: g.footer?.photo,
      headline: g.footer?.headline,
      perex: g.footer?.perex,
      columns: stripIds(g.footer?.columns as any).map((column: any) => ({
        ...column,
        links: stripIds(column.links),
      })),
      league: g.footer?.league,
    },
  } as any,
  context: ctx,
})
console.log('Patička přenesena do siteConfig.footer')
process.exit(0)
