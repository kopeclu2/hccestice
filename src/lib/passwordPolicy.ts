/** Nejkratší povolené heslo do adminu. */
export const MIN_PASSWORD_LENGTH = 12

/**
 * Pravidlo pro nové heslo uživatele adminu. Vrací českou chybu, nebo `null`,
 * když heslo projde. Počítá se v kódových bodech (`[...password]`), ne
 * v UTF-16 jednotkách, aby znak mimo BMP (emoji) nebyl za dva.
 *
 * Záměrně jen délka: délka je to, co doporučuje NIST 800-63B, a pravidla
 * typu „velké písmeno a číslice" vedou k předvídatelným heslům.
 */
export function passwordPolicyError(password: unknown): string | null {
  // Prázdné heslo Payload při `update` ignoruje (`Boolean(password)`), takže
  // formulář, kde správce heslo nemění, nesmí spadnout na délce.
  if (typeof password !== 'string' || password === '') return null
  if ([...password].length >= MIN_PASSWORD_LENGTH) return null
  return `Heslo musí mít alespoň ${MIN_PASSWORD_LENGTH} znaků.`
}
