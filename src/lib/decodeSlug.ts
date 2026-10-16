/**
 * Slug z URL, nebo `null` při neplatném procentovém kódování.
 *
 * Next parametry rout někdy předá ještě zakódované, ale `decodeURIComponent`
 * na `%zz` nebo `%E0%A4%A` vyhodí `URIError` a návštěvník dostane HTTP 500
 * (a do Sentry přibude chyba z každého skeneru). Volající `null` mění na
 * `notFound()`. Izomorfní, bez závislostí.
 */
export function decodeSlug(raw: string): string | null {
  try {
    return decodeURIComponent(raw)
  } catch {
    return null
  }
}

/** Totéž pro segmenty catch-all routy; stačí jeden neplatný a výsledek je `null`. */
export function decodeSegments(segments: readonly string[]): string[] | null {
  const decoded: string[] = []
  for (const segment of segments) {
    const value = decodeSlug(segment)
    if (value === null) return null
    decoded.push(value)
  }
  return decoded
}
