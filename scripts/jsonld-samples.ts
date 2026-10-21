/**
 * Ukázkové JSON-LD dokumenty skládané **skutečnými** buildery stránek
 * (bez databáze a bez Next runtime), pro `scripts/check-jsonld.ts` a unit test.
 * Hodnoty jsou smyšlené (příklad.cz, soupeř, fotka), ale tvar je přesně ten,
 * který jde do stránky.
 */
import {
  eventDescription,
  toMatchesJsonLd,
  toMatchJsonLd,
  type SportsEventInput,
} from '@/landing/features/matches/view/matchSchema'
import { articleTrail } from '@/landing/features/posts/components/hero/articleTrail'
import { articleImages, toNewsArticle } from '@/landing/features/posts/view/articleSchema'
import { CLUB_LOGO_LARGE } from '@/lib/club'
import { toHomeGraph, toImageGallery, toWebPage } from '@/lib/schemaOrg'

export const SAMPLE_BASE = 'https://hccestice.example'

const fixture: SportsEventInput = {
  title: 'HC Čestice × SK Divočáci Žamberk',
  startDate: '2026-10-18T14:30:00.000Z',
  homeName: 'HC Čestice',
  awayName: 'SK Divočáci Žamberk',
  venue: null,
  status: 'scheduled',
  description: eventDescription('5. kolo', null, 'HC Čestice', 'SK Divočáci Žamberk'),
  url: `${SAMPLE_BASE}/zapasy/2026-10-18-sk-divocaci-zamberk`,
  image: `${SAMPLE_BASE}${CLUB_LOGO_LARGE}`,
}

const played: SportsEventInput = {
  ...fixture,
  title: 'HC Čestice × HC Zdar',
  startDate: '2026-01-18T15:30:00.000Z',
  awayName: 'HC Zdar',
  status: 'played',
  description: eventDescription('18. kolo', '5:3', 'HC Čestice', 'HC Zdar'),
  url: `${SAMPLE_BASE}/zapasy/2026-01-18-hc-zdar`,
  image: `${SAMPLE_BASE}/api/media/file/reportaz.jpg?2026-01-19T08%3A00%3A00.000Z`,
}

const away: SportsEventInput = {
  ...fixture,
  title: 'HC Choceň × HC Čestice',
  homeName: 'HC Choceň',
  awayName: 'HC Čestice',
  venue: 'Choceň',
  url: `${SAMPLE_BASE}/zapasy/2026-10-25-hc-chocen`,
  startDate: '2026-10-25T18:00:00.000Z',
}

const media = {
  url: '/api/media/file/foto.jpg',
  updatedAt: '2026-09-24T09:54:06.000Z',
  sizes: {
    square: { url: '/api/media/file/foto-500x500.jpg' },
    og: { url: '/api/media/file/foto-1200x630.jpg' },
  },
}

const articleInput = {
  baseUrl: SAMPLE_BASE,
  slug: 'nove-posily',
  headline: 'Nové posily',
  description: 'Do nové sezóny vstupujeme s novými posilami.',
  images: articleImages({ baseUrl: SAMPLE_BASE, media, fallback: null }),
  publishedAt: '2026-08-19T06:42:28.000Z',
  modifiedAt: '2026-09-24T07:54:06.000Z',
  authorName: 'Vladimír Javůrek',
}

const breadcrumbs = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Domů', item: `${SAMPLE_BASE}/` },
    { '@type': 'ListItem', position: 2, name: 'Aktuality', item: `${SAMPLE_BASE}/aktuality` },
    {
      '@type': 'ListItem',
      position: 3,
      name: articleTrail({ badge: 'Novinky', title: 'Nové posily' })[1].schemaName,
    },
  ],
}

/** Dokumenty, které musí projít bez **chyby**: název → JSON-LD. */
export const sampleDocuments: Record<string, unknown> = {
  'home (@graph)': toHomeGraph({
    baseUrl: SAMPLE_BASE,
    email: 'klub@example.cz',
    sameAs: ['https://www.facebook.com/klub', 'https://www.instagram.com/klub/'],
  }),
  'zápas: naplánovaný doma': toMatchJsonLd(fixture, SAMPLE_BASE),
  'zápas: odehraný doma s fotkou reportáže': toMatchJsonLd(played, SAMPLE_BASE),
  'zápas: venku s městem': toMatchJsonLd(away, SAMPLE_BASE),
  'zápas: neznámá hala': toMatchJsonLd({ ...away, venue: 'Aréna Hokej Park' }, SAMPLE_BASE),
  '/zapasy (@graph)': toMatchesJsonLd(
    [fixture, away, played, { ...away, venue: 'Choceň' }],
    SAMPLE_BASE,
  ),
  článek: toNewsArticle(articleInput),
  'článek: autor je klub': toNewsArticle({ ...articleInput, authorName: 'HC Čestice' }),
  'článek: drobečky': breadcrumbs,
  galerie: toImageGallery({
    baseUrl: SAMPLE_BASE,
    path: '/fotogalerie/hc-cestice-x-zh-pardubice',
    name: 'HC Čestice x ZH Pardubice',
    dateCreated: '2025-01-19',
    photos: [{ url: `${SAMPLE_BASE}/api/media/file/f1.jpg`, caption: null }],
  }),
  '/kontakt': toWebPage({
    baseUrl: SAMPLE_BASE,
    kind: 'ContactPage',
    path: '/kontakt',
    name: 'Kontakt HC Čestice',
    description: 'Napište nám.',
    aboutClub: true,
  }),
  '/historie-klubu': toWebPage({
    baseUrl: SAMPLE_BASE,
    kind: 'AboutPage',
    path: '/historie-klubu',
    name: 'Historie klubu HC Čestice',
    description: 'Sedmdesát let hokeje.',
    aboutClub: true,
  }),
  '/sponzori': toWebPage({
    baseUrl: SAMPLE_BASE,
    kind: 'CollectionPage',
    path: '/sponzori',
    name: 'Partneři HC Čestice',
    description: 'Partneři klubu.',
    aboutClub: true,
  }),
}
