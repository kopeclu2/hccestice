import type { Media, Person } from '@/payload-types'

import type { PersonCard, Photo } from '../types'

/**
 * Sdílené formátovací helpery datové vrstvy landing bloků:
 * české datumy/časy (Europe/Prague) a převody Payload dokumentů
 * na view-modely (`types.ts`).
 */

export const CZECH_LOCALE = 'cs-CZ'
export const TIMEZONE = 'Europe/Prague'

/** „8. 3." */
export const formatDay = (iso: string): string =>
  new Date(iso).toLocaleDateString(CZECH_LOCALE, {
    day: 'numeric',
    month: 'numeric',
    timeZone: TIMEZONE,
  })

/** „8. března 17:00" */
export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleDateString(CZECH_LOCALE, {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  })

/** „ne 8. 3." */
export const formatWeekdayDay = (iso: string): string =>
  new Date(iso).toLocaleDateString(CZECH_LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    timeZone: TIMEZONE,
  })

/** „17:00" */
export const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString(CZECH_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  })

/** „8. 3. 2026" */
export const formatFullDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(CZECH_LOCALE, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: TIMEZONE,
  })

/** „8. března 2026" */
export const formatLongDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(CZECH_LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIMEZONE,
  })

/** URL detailu článku. Jediný zdroj pravdy — používá `postHref` i reporty zápasů. */
export const postPath = (slug: string | null | undefined): string | null =>
  slug ? `/aktuality/${slug}` : null

/** Media dokument → Photo view-model pro `next/image`. */
export const toPhoto = (media: Media): Photo => ({
  url: media.url ?? '',
  alt: media.alt || 'HC Čestice',
  width: media.width ?? 1600,
  height: media.height ?? 1200,
})

/** Upload pole (populated přes depth) → Photo, jinak null. */
export const uploadToPhoto = (value: number | Media | null | undefined): Photo | null =>
  typeof value === 'object' && value ? toPhoto(value) : null

/** Neprázdné pole z bloku/globalu, jinak fallback z content.ts. */
export const arrayOr = <T, F>(
  rows: T[] | null | undefined,
  fallback: F[],
  map: (row: T) => F,
): F[] => (rows && rows.length > 0 ? rows.map(map) : fallback)

/** Person dokument → PersonCard view-model (null pro nepopulovanou relaci). */
export const toPersonCard = (person: number | Person): PersonCard | null => {
  if (typeof person !== 'object') return null
  return {
    name: person.name,
    role: person.role,
    note: person.note ?? null,
    mail: person.email ?? null,
    phone: person.phone ?? null,
    photo: uploadToPhoto(person.photo),
  }
}

/** Id z relace (populated objekt nebo číslo). */
export const relId = (value: unknown): number | null =>
  typeof value === 'object' && value ? (value as { id: number }).id : ((value as number) ?? null)

/* ── Doba čtení ──────────────────────────────────────────────────────────── */

/** Počet slov v lexical stromu (rekurzivní sběr `text` polí). */
export const lexicalWordCount = (node: unknown): number => {
  if (!node || typeof node !== 'object') return 0
  const record = node as { text?: unknown; children?: unknown; root?: unknown }
  let count = 0
  if (typeof record.text === 'string') {
    count += record.text.split(/\s+/).filter(Boolean).length
  }
  if (record.root) count += lexicalWordCount(record.root)
  if (Array.isArray(record.children)) {
    for (const child of record.children) count += lexicalWordCount(child)
  }
  return count
}

/** Počet slov v HTML (po odstranění tagů). */
export const htmlWordCount = (html: string): number =>
  html
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

/** „4 min čtení" — 200 slov/min, minimálně 1 minuta. */
export const readingLabel = (words: number): string =>
  `${Math.max(1, Math.round(words / 200))} min čtení`

/* ── Textový úryvek (textové karty výpisu) ───────────────────────────────── */

// HTML → text a zkrácení řeší utilities/plainText (používá to i generateMeta)
export {
  dropTitleEcho,
  echoesTitle,
  htmlPlainText,
  looksLikeProse,
  snippet,
} from '@/utilities/plainText'

/** Prostý text z lexical stromu (rekurzivní sběr `text` polí). */
export const lexicalPlainText = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''
  const record = node as { text?: unknown; children?: unknown; root?: unknown }
  const parts: string[] = []
  if (typeof record.text === 'string') parts.push(record.text)
  if (record.root) parts.push(lexicalPlainText(record.root))
  if (Array.isArray(record.children)) {
    for (const child of record.children) parts.push(lexicalPlainText(child))
  }
  return parts.filter(Boolean).join(' ')
}

/* ── České skloňování a kontakty ─────────────────────────────────────────── */

/** „hráč" / „hráči" / „hráčů" — formy [1, 2–4, 5+]; 0 bere formu 5+. */
export const pluralForm = (n: number, forms: [string, string, string]): string =>
  n === 1 ? forms[0] : n >= 2 && n <= 4 ? forms[1] : forms[2]

/** „1 hráč" / „3 hráči" / „24 hráčů" — formy [1, 2–4, 5+]. */
export const countLabel = (n: number, forms: [string, string, string]): string =>
  `${n} ${pluralForm(n, forms)}`

/** Sociální sítě se v odkazu ukazují značkou, ne doménou (handoff: „Facebook"). */
const SOCIAL_LABELS: Record<string, string> = {
  'facebook.com': 'Facebook',
  'instagram.com': 'Instagram',
}

/**
 * Popisek odkazu na web partnera: doména („www.tipo.cz"), u sociálních sítí
 * název sítě („Facebook"). Nevalidní URL se zobrazí osekaná o schéma.
 */
export const webLabel = (url: string): string => {
  try {
    const { hostname } = new URL(url)
    return SOCIAL_LABELS[hostname.replace(/^www\./, '')] ?? hostname
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
}

/** `tel:` href — mezery (`\s` pokrývá i nedělitelnou) ven, zbytek čísla beze změny. */
export const telHref = (phone: string): string => `tel:${phone.replace(/\s/g, '')}`
