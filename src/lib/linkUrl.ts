/**
 * Validace adres odkazů zadávaných v adminu (odkazy v rich textu, tlačítka
 * bloků, sociální sítě, sponzoři). Izomorfní, bez závislostí.
 *
 * Povolená jsou jen schémata `http(s):`, `mailto:`, `tel:` a relativní
 * adresy (`/cesta`, `#kotva`). `javascript:`, `data:` a `vbscript:` by se
 * z `<a href>` spustily kliknutím návštěvníka — stored XSS z účtu editora.
 * Whitelist místo blacklistu, protože prohlížeč ignoruje tabulátory
 * a odřádkování uvnitř schématu (`java\tscript:`), takže hledat „zakázané"
 * se nedá spolehlivě.
 */

const SAFE_LINK = /^(?:https?:|mailto:|tel:|\/|#)/i

/** Řídicí znaky (vč. tabulátoru a odřádkování) v adrese nemají co dělat. */
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/

/** Je adresa odkazu bezpečná? Prázdná hodnota **není** (řeší `required`). */
export function isSafeLinkUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  return SAFE_LINK.test(trimmed) && !CONTROL_CHARS.test(trimmed)
}

export const LINK_URL_ERROR =
  'Adresa musí začínat http://, https://, mailto:, tel:, lomítkem (/cesta) nebo # (kotva).'

type LinkUrlOptions = { required?: boolean }

/**
 * Validátor pro `validate` textového pole v Payloadu. `validate` nahrazuje
 * výchozí validaci pole, takže `required` se musí vyřešit tady.
 */
export function linkUrlValidator({ required = false }: LinkUrlOptions = {}): (
  value: string | null | undefined,
) => true | string {
  return (value) => {
    if (value === undefined || value === null || value.trim() === '') {
      return required ? 'Toto pole je povinné.' : true
    }
    return isSafeLinkUrl(value) ? true : LINK_URL_ERROR
  }
}
