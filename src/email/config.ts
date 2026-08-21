/**
 * Identita odchozí pošty. Jediné místo, které čte `EMAIL_*` proměnné —
 * adapter i šablony si sem chodí pro odesílatele, adresáta notifikací
 * a hlavičku layoutu.
 */
import { CLUB_EMAIL } from '@/landing/content'
import { getServerSideURL } from '@/utilities/getURL'

export const CLUB_NAME = 'HC Čestice'

/** Prázdná proměnná v `.env` je totéž jako nenastavená. */
const fromEnv = (name: string): string | undefined => process.env[name]?.trim() || undefined

/**
 * Adresa v hlavičce `From`.
 *
 * U Resendu musí být na ověřené doméně (SPF + DKIM), takže klubová adresa na
 * Seznamu tam NEPROJDE — proto je to env proměnná a ne konstanta.
 */
export const fromAddress = (): string => fromEnv('EMAIL_FROM_ADDRESS') ?? CLUB_EMAIL

export const fromName = (): string => fromEnv('EMAIL_FROM_NAME') ?? CLUB_NAME

/** `"HC Čestice" <web@…>` — hodnota do hlavičky `From`. */
export const formattedFrom = (): string => `${fromName()} <${fromAddress()}>`

/**
 * Kam míří notifikace o odeslaném formuláři, když si adresáta neurčí sám
 * formulář v adminu (pole „E-mail komu").
 */
export const notificationAddress = (): string =>
  fromEnv('EMAIL_NOTIFICATION_ADDRESS') ?? CLUB_EMAIL

/** Hlavička a patička layoutu — stejné pro všechny šablony. */
export const emailBranding = (): { clubName: string; siteUrl: string } => ({
  clubName: CLUB_NAME,
  siteUrl: getServerSideURL(),
})
