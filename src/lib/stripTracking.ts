/**
 * Parametry, které do trvalého odkazu na webu nepatří — vznikají proklikem
 * z jiné platformy a redaktor je zkopíruje spolu s URL z adresního řádku.
 *
 * `utm_*` se řeší prefixem, zbytek výčtem.
 */
const TRACKING_PARAMS = new Set([
  'fbclid',
  'gclid',
  'dclid',
  'msclkid',
  'igshid',
  'igsh',
  'mibextid',
  'twclid',
  'ttclid',
  '_ga',
  'ref_src',
  'ref_url',
])

/**
 * Odstraní z URL trackovací parametry a vrátí ji jako string.
 *
 * Odkaz na klubový Instagram byl v `siteConfig` uložený včetně
 * `?fbclid=IwY2xjawGfuF5…` (redaktor ho zkopíroval z Facebooku), takže se
 * ten balast renderoval na **každé** stránce webu — v patičce, v bloku
 * Kontakt, v CTA pod výpisem aktualit, na obrazovce údržby a od doplnění
 * `sameAs` i ve strukturovaných datech.
 *
 * Sanitizace je záměrně v `fetchSite()`, ne v komponentách: konzumentů je
 * šest a přidáním sedmého by se na to zapomnělo.
 *
 * Whitelistový přístup (mažeme jen známé trackery) je tu podstatný —
 * klubový Facebook je `profile.php?id=61568735361560`, takže plošné
 * zahození query stringu by odkaz rozbilo.
 *
 * Neparsovatelnou hodnotu vrací nezměněnou: pole v CMS je volný text bez
 * validace na URL a rozbít odkaz kvůli úklidu je horší než balast nechat.
 */
export const stripTracking = (raw?: string | null): string | null => {
  if (!raw) return null

  const value = raw.trim()
  if (!value) return null

  try {
    const url = new URL(value)

    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) {
        url.searchParams.delete(key)
      }
    }

    // `toString()` by u prázdného query nechal viset `?`.
    return url.search === '' ? url.toString().replace(/\?$/, '') : url.toString()
  } catch {
    return value
  }
}
