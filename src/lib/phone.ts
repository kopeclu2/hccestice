/**
 * Telefonní čísla z CMS — ochrana před „prázdným" číslem.
 *
 * Správce v adminu nechal u osoby jen předvolbu („+420"); `person.phone &&`
 * to vzalo za vyplněné a web vykreslil odkaz `tel:+420` bez čísla. Izomorfní
 * modul (žádné importy), protože ho používají view-modely i komponenty.
 */

/** Nejméně tolik číslic musí zbýt po odříznutí předvolby ČR, aby šlo o číslo. */
const MIN_SUBSCRIBER_DIGITS = 6

/**
 * Telefon k zobrazení, nebo `null`, když v hodnotě není skutečné číslo
 * (prázdný řetězec, jen „+420", jen mezery a pomlčky). Neprázdné číslo vrací
 * beze změny (kromě oříznutí okrajových mezer), aby se zobrazilo, jak ho
 * správce napsal.
 */
export function cleanPhone(value: string | null | undefined): string | null {
  const text = value?.trim()
  if (!text) return null
  const digits = text.replace(/\D/g, '')
  // Předvolba ČR se v 00420 i +420 odřízne; zbytek je číslo účastníka.
  const subscriber = digits.replace(/^(?:00)?420/, '')
  return subscriber.length >= MIN_SUBSCRIBER_DIGITS ? text : null
}

/** `tel:` href — mezery (`\s` pokrývá i nedělitelnou) ven, zbytek čísla beze změny. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`
}
