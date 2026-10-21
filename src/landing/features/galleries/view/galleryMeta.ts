import { formatLongDate } from '@/lib/datetime'
import { countLabel, type PluralForms } from '@/lib/plural'

/** Tvary pro počet fotek: 1 fotka / 2–4 fotky / 0 a 5+ fotek. */
export const PHOTO_FORMS: PluralForms = ['fotka', 'fotky', 'fotek']

/**
 * Čitelný název ze slugu — jen záloha, když galerie nemá titulek (import
 * z eStránky občas nechal v `title` samotný slug). Diakritika se z adresy
 * zpátky nevrátí, takže `turnaj-pardubice-2025` dá „Turnaj pardubice 2025";
 * skutečný název patří do administrace.
 */
export const titleFromSlug = (slug: string): string => {
  const words = slug.replace(/[-_]+/g, ' ').trim()
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : ''
}

/**
 * Titulek galerie pro `<title>` a popisek: vlastní, nebo ze slugu, když je
 * prázdný nebo je to doslova slug (`title === slug`).
 */
export const galleryTitle = (title: string | null | undefined, slug: string): string => {
  const clean = (title ?? '').trim()
  return !clean || clean === slug ? titleFromSlug(slug) || clean : clean
}

/**
 * Meta description galerie: „Fotogalerie Turnaj z 8. března 2026 — 3 fotky."
 * Počet se skloňuje (`plural`), datum je v genitivu („z 8. března"), a když
 * není, věta bez něj.
 */
export const galleryDescription = (args: {
  title: string
  photoCount: number
  date?: string | null
}): string => {
  const when = args.date ? formatLongDate(args.date) : ''
  return `Fotogalerie ${args.title}${when ? ` z ${when}` : ''} — ${countLabel(args.photoCount, PHOTO_FORMS)}.`
}
