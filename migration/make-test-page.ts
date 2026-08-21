import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })

// smaž případnou předchozí verzi
const old = await payload.find({ collection: 'pages', where: { slug: { equals: 'ukazka-bloku' } }, limit: 1, depth: 0, draft: true })
if (old.docs[0]) await payload.delete({ collection: 'pages', id: old.docs[0].id, context: { disableRevalidate: true } })

const gallery = (await payload.find({ collection: 'galleries', where: { title: { like: 'play-off' } }, limit: 1, depth: 0 })).docs[0]
  ?? (await payload.find({ collection: 'galleries', limit: 1, depth: 0, sort: '-date' })).docs[0]
const season = (await payload.find({ collection: 'seasons', where: { slug: { equals: '2025-2026' } }, limit: 1, depth: 0 })).docs[0]

await payload.create({
  collection: 'pages',
  depth: 0,
  data: {
    title: 'Ukázka bloků',
    slug: 'ukazka-bloku',
    generateSlug: false,
    hero: { type: 'none' },
    layout: [
      { blockType: 'matchWidget', mode: 'played', season: season?.id, limit: 5 },
      { blockType: 'standingsTable', title: 'Tabulka VČHL 2025-2026 (ukázka)', season: season?.id, rows: [
        { rank: 1, team: 'HC Skuteč', gp: 18, w: 14, otw: 1, otl: 0, l: 3, gf: 98, ga: 45, pts: 44 },
        { rank: 2, team: 'HC Čestice', gp: 18, w: 13, otw: 2, otl: 0, l: 3, gf: 95, ga: 60, pts: 43 },
        { rank: 3, team: 'Rebels Polička', gp: 18, w: 11, otw: 0, otl: 1, l: 6, gf: 88, ga: 70, pts: 34 },
      ]},
      { blockType: 'galleryBlock', gallery: gallery?.id },
      { blockType: 'youtube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      { blockType: 'sponsorsBlock', title: 'Sponzoři' },
      { blockType: 'roster', title: 'Soupiska 2025 – 2026', season: season?.id },
    ],
    _status: 'published',
  } as any,
  context: { disableRevalidate: true },
})
console.log('Testovací stránka vytvořena: /ukazka-bloku')
process.exit(0)
