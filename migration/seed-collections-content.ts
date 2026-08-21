/**
 * Přesun obsahu landing bloků do kolekcí (homepage tahá živá data):
 *
 *  1. tabulka ligy → dokument sezóny 2025-2026 (Sezóny → Tabulka ligy)
 *  2. auto-link zápas ↔ galerie podle shody data a sezóny
 *  3. odpublikování legacy navigačních posts („Úvodní strana…", „Nejbližší zápasy")
 *  4. home bloky přepnout na auto režim (news: fallback foto, stats/mozaika: prázdné = auto)
 *
 * Idempotentní. Spuštění: bun --env-file=.env migration/seed-collections-content.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

import { STANDINGS } from '../src/landing/content'

const payload = await getPayload({ config })
const ctx = { disableRevalidate: true }

// ── 1) tabulka na sezónu ─────────────────────────────────────────────────────
const season = (
  await payload.find({
    collection: 'seasons',
    where: { isCurrent: { equals: true } },
    limit: 1,
    depth: 0,
  })
).docs[0]
if (!season) throw new Error('Aktuální sezóna nenalezena')

if ((season.standings?.rows ?? []).length === 0) {
  await payload.update({
    collection: 'seasons',
    id: season.id,
    data: {
      standings: {
        label: STANDINGS.seasonLabel,
        fullTableUrl: STANDINGS.fullTableUrl,
        rows: STANDINGS.rows.map((row) => ({
          pos: row.pos,
          team: row.team,
          games: row.games,
          points: row.points,
        })),
      },
    } as any,
    context: ctx,
  })
  console.log(`Tabulka (${STANDINGS.rows.length} řádků) zapsána na sezónu ${season.title}`)
} else {
  console.log('Sezóna už tabulku má — přeskakuji')
}

// ── 2) auto-link zápas ↔ galerie (podle data + sezóny) ──────────────────────
const { docs: matches } = await payload.find({
  collection: 'matches',
  where: {
    and: [{ status: { equals: 'played' } }, { gallery: { exists: false } }],
  },
  limit: 0,
  depth: 0,
})
/** Lokální (Europe/Prague) kalendářní den z ISO data. */
const localDay = (iso: string) =>
  new Date(iso).toLocaleDateString('sv-SE', { timeZone: 'Europe/Prague' })

let linked = 0
for (const match of matches) {
  const day = localDay(match.date)
  // ±1 den v UTC a porovnat lokální den (galerie mají půlnoc lokálního času)
  const from = new Date(new Date(`${day}T00:00:00Z`).getTime() - 86_400_000).toISOString()
  const to = new Date(new Date(`${day}T00:00:00Z`).getTime() + 2 * 86_400_000).toISOString()
  const candidates = await payload.find({
    collection: 'galleries',
    where: {
      and: [{ date: { greater_than_equal: from } }, { date: { less_than: to } }],
    },
    limit: 5,
    depth: 0,
  })
  const gallery = candidates.docs.find((g) => g.date && localDay(g.date) === day)
  if (gallery) {
    await payload.update({
      collection: 'matches',
      id: match.id,
      data: { gallery: gallery.id },
      context: ctx,
    })
    console.log(`  ~ zápas ${match.displayTitle ?? match.id} ↔ galerie „${gallery.title}"`)
    linked++
  }
}
console.log(`Nalinkováno ${linked} galerií k zápasům`)

// ── 3) legacy navigační posts → draft ────────────────────────────────────────
const { docs: legacyPosts } = await payload.find({
  collection: 'posts',
  where: {
    and: [
      { _status: { equals: 'published' } },
      { title: { in: ['Nejbližší zápasy', 'Úvodní strana 2024 - 2025'] } },
    ],
  },
  limit: 10,
  depth: 0,
})
for (const post of legacyPosts) {
  await payload.update({
    collection: 'posts',
    id: post.id,
    data: { _status: 'draft' } as any,
    context: ctx,
  })
  console.log(`  - odpublikován legacy post: ${post.title}`)
}

// ── 4) home bloky do auto režimu ─────────────────────────────────────────────
const home = (
  await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1, depth: 0 })
).docs[0]
if (!home) throw new Error('Home stránka nenalezena')

// fallback fotka hlavní karty aktualit = dosavadní fotka brigády
const fallbackPhoto = (
  await payload.find({
    collection: 'media',
    where: { filename: { equals: 'p3082213.jpg' } },
    limit: 1,
    depth: 0,
  })
).docs[0]

const layout = (home.layout ?? []).map((block: any) => {
  switch (block.blockType) {
    case 'landingNews':
      return {
        ...block,
        pinnedPost: block.pinnedPost ?? null,
        count: block.count ?? 3,
        fallbackPhoto: block.fallbackPhoto ?? fallbackPhoto?.id ?? null,
      }
    case 'landingSeason':
      return { ...block, season: null } // prázdné = aktuální sezóna
    case 'landingStats':
      return { ...block, season: null, items: [] } // prázdné = auto-výpočet
    case 'landingAlbum':
      return { ...block, gallery: null, mosaic: [] } // prázdné = nejnovější galerie
    default:
      return block
  }
})

await payload.update({
  collection: 'pages',
  id: home.id,
  data: { layout } as any,
  context: ctx,
})
console.log('Home bloky přepnuty na auto režim (aktuality/tabulka/čísla/mozaika z kolekcí)')
process.exit(0)
