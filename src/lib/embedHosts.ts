/**
 * Jediný seznam hostů, jejichž stránky smí web vložit do `<iframe>`:
 * HTML sanitizér (`hooks/sanitizeHtml`, legacy články a blok RawHtml)
 * i blok „Externí obsah". Izomorfní, bez závislostí.
 *
 * Seznam vychází z dat v produkční databázi (legacy články z eStránky
 * vkládají YouTube, Google Tabulky a Formuláře, výsledky z online-puk /
 * onlinepuk, ecomail formulář a tabulku z lidovky.cz) a z toho, co do
 * bloků správce reálně vkládá (FB plugin, tabulky ahl.cz, mapy). Nový host
 * se přidává sem — nikde jinde.
 */

type EmbedRule = {
  host: string
  /** Cesta musí začínat tímto prefixem; bez něj stačí shoda hosta. */
  pathPrefix?: string
}

const EMBED_RULES: readonly EmbedRule[] = [
  { host: 'youtube.com', pathPrefix: '/embed/' },
  { host: 'www.youtube.com', pathPrefix: '/embed/' },
  { host: 'youtube-nocookie.com', pathPrefix: '/embed/' },
  { host: 'www.youtube-nocookie.com', pathPrefix: '/embed/' },
  { host: 'player.vimeo.com', pathPrefix: '/video/' },
  { host: 'www.google.com', pathPrefix: '/maps/' },
  { host: 'maps.google.com' },
  { host: 'docs.google.com', pathPrefix: '/spreadsheets/' },
  { host: 'docs.google.com', pathPrefix: '/spreadsheet/' },
  { host: 'docs.google.com', pathPrefix: '/forms/' },
  { host: 'www.facebook.com', pathPrefix: '/plugins/' },
  { host: 'mapy.cz' },
  { host: 'frame.mapy.cz' },
  { host: 'ahl.cz' },
  { host: 'www.ahl.cz' },
  { host: 'vysledky.lidovky.cz' },
  { host: 'online-puk.eu' },
  { host: 'www.onlinepuk.cz' },
  // Historické výsledky z legacy článků (14 článků). Cizí doména, kterou
  // klub nevlastní — až se výsledky přesunou, host z toho seznamu pryč.
  { host: 'main.onlinepuk.vibrant-easley.mlj.solutions' },
  { host: 'hejduksport.ecomailapp.cz' },
]

/**
 * `sandbox` pro vložené iframy. YouTube a ostatní přehrávače potřebují
 * skripty a vlastní origin, Google Formulář a ecomail formuláře odesílání;
 * bez `allow-top-navigation` vložená stránka nepřesměruje celý web.
 */
export const EMBED_SANDBOX =
  'allow-scripts allow-same-origin allow-popups allow-presentation allow-forms'

/** `new URL`, který neháže a bere i protokolově relativní `//host/…`. */
function parseAbsoluteUrl(raw: string): URL | null {
  const trimmed = raw.trim()
  const candidate = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed
  try {
    return new URL(candidate)
  } catch {
    return null
  }
}

/**
 * Smí se adresa vložit jako `src` iframe? Jen `http(s)`, bez přihlašovacích
 * údajů, host přesně ze seznamu (žádné „končí na"), a pokud pravidlo hlídá
 * cestu, tak i ta. Relativní adresa neprojde — iframe na vlastní origin
 * nemá důvod existovat.
 */
export function isAllowedEmbedUrl(raw: string | null | undefined): boolean {
  if (!raw) return false
  const url = parseAbsoluteUrl(raw)
  if (!url) return false
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
  if (url.username || url.password) return false

  const host = url.hostname.toLowerCase()
  return EMBED_RULES.some(
    (rule) => rule.host === host && (!rule.pathPrefix || url.pathname.startsWith(rule.pathPrefix)),
  )
}

/**
 * Validátor pole s adresou vkládané stránky (`validate` textového pole v
 * Payloadu): jen hosty ze seznamu, aby editor nemohl do webu vložit
 * libovolný cizí iframe.
 */
export function embedUrlValidator({ required = false }: { required?: boolean } = {}): (
  value: string | null | undefined,
) => true | string {
  return (value) => {
    if (!value || !value.trim()) return required ? 'Toto pole je povinné.' : true
    return isAllowedEmbedUrl(value)
      ? true
      : 'Tento web nejde vložit. Povolené jsou YouTube, Vimeo, Google Mapy/Tabulky/Formuláře, Mapy.cz, Facebook plugin a ahl.cz; další hosty se přidávají v lib/embedHosts.'
  }
}

/** Host adresy pro hlášení (např. „které iframy sanitizér vyhodil"). */
export function embedHostOf(raw: string | null | undefined): string {
  const url = raw ? parseAbsoluteUrl(raw) : null
  return url?.hostname.toLowerCase() ?? '(neplatná adresa)'
}
