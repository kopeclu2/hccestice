/** Popisky kontaktů partnerů (web, telefon). */

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
