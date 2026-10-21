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
  /** Jméno služby pro návštěvníka („Načíst YouTube"), ne technický host. */
  service: string
}

const EMBED_RULES: readonly EmbedRule[] = [
  { host: 'youtube.com', pathPrefix: '/embed/', service: 'YouTube' },
  { host: 'www.youtube.com', pathPrefix: '/embed/', service: 'YouTube' },
  { host: 'youtube-nocookie.com', pathPrefix: '/embed/', service: 'YouTube' },
  { host: 'www.youtube-nocookie.com', pathPrefix: '/embed/', service: 'YouTube' },
  { host: 'player.vimeo.com', pathPrefix: '/video/', service: 'Vimeo' },
  { host: 'www.google.com', pathPrefix: '/maps/', service: 'Google Mapy' },
  { host: 'maps.google.com', service: 'Google Mapy' },
  { host: 'docs.google.com', pathPrefix: '/spreadsheets/', service: 'Google Tabulky' },
  { host: 'docs.google.com', pathPrefix: '/spreadsheet/', service: 'Google Tabulky' },
  { host: 'docs.google.com', pathPrefix: '/forms/', service: 'Google Formuláře' },
  { host: 'www.facebook.com', pathPrefix: '/plugins/', service: 'Facebook' },
  { host: 'mapy.cz', service: 'Mapy.cz' },
  { host: 'frame.mapy.cz', service: 'Mapy.cz' },
  { host: 'ahl.cz', service: 'ahl.cz' },
  { host: 'www.ahl.cz', service: 'ahl.cz' },
  { host: 'vysledky.lidovky.cz', service: 'Lidovky.cz' },
  { host: 'online-puk.eu', service: 'Online puk' },
  { host: 'www.onlinepuk.cz', service: 'Online puk' },
  // Historické výsledky z legacy článků (14 článků). Cizí doména, kterou
  // klub nevlastní — až se výsledky přesunou, host z toho seznamu pryč.
  { host: 'main.onlinepuk.vibrant-easley.mlj.solutions', service: 'Online puk' },
  { host: 'hejduksport.ecomailapp.cz', service: 'Ecomail' },
]

/**
 * Zdroje pro `frame-src` v CSP (`next.config.ts`): tytéž hosty, jen bez
 * cest — CSP cestu u hostu porovnává jinak než `isAllowedEmbedUrl`.
 */
export const EMBED_FRAME_SOURCES: readonly string[] = [
  ...new Set(EMBED_RULES.map((rule) => `https://${rule.host}`)),
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
  return matchEmbedRule(raw) !== null
}

/** Pravidlo, které adresu propouští; `null` = adresa se vložit nesmí. */
function matchEmbedRule(raw: string | null | undefined): EmbedRule | null {
  if (!raw) return null
  const url = parseAbsoluteUrl(raw)
  if (!url) return null
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (url.username || url.password) return null

  const host = url.hostname.toLowerCase()
  return (
    EMBED_RULES.find(
      (rule) =>
        rule.host === host && (!rule.pathPrefix || url.pathname.startsWith(rule.pathPrefix)),
    ) ?? null
  )
}

/**
 * Adresa, která se do iframe skutečně vloží, nebo `null`, když ji vložit
 * nesmíme. Navíc proti `isAllowedEmbedUrl`:
 * - `http://` → `https://` (na https stránce by prohlížeč smíšený obsah
 *   v iframe stejně zablokoval),
 * - `youtube.com/embed` → `youtube-nocookie.com/embed` (legacy články mají
 *   běžnou doménu, která si nastavuje cookies hned při načtení rámu),
 * - protokolově relativní `//host/…` → `https://host/…`.
 * Výstup je pevný bod: `normalize(normalize(x)) === normalize(x)`.
 */
export function normalizeEmbedUrl(raw: string | null | undefined): string | null {
  if (!matchEmbedRule(raw)) return null
  const url = parseAbsoluteUrl(raw as string) as URL
  url.protocol = 'https:'
  const host = url.hostname.toLowerCase()
  if (host === 'youtube.com' || host === 'www.youtube.com') {
    url.hostname = 'www.youtube-nocookie.com'
  }
  const href = url.href
  // Přepsání hosta musí zůstat uvnitř seznamu; jinak raději nic.
  return isAllowedEmbedUrl(href) ? href : null
}

/** Jméno služby pro popisky („YouTube", „Google Mapy"); neznámé = host. */
export function embedServiceOf(raw: string | null | undefined): string {
  return matchEmbedRule(raw)?.service ?? embedHostOf(raw)
}

/**
 * Adresa pro odkaz „Otevřít v novém okně" (záloha bez JS). U YouTube vede
 * na stránku videa, ne na holý přehrávač; jinak stejná adresa jako iframe.
 */
export function embedOpenUrl(raw: string | null | undefined): string | null {
  const href = normalizeEmbedUrl(raw)
  if (!href) return null
  const url = new URL(href)
  const youtubeId = /^\/embed\/([A-Za-z0-9_-]{6,15})\/?$/.exec(url.pathname)?.[1]
  if (url.hostname === 'www.youtube-nocookie.com' && youtubeId) {
    return `https://www.youtube.com/watch?v=${youtubeId}`
  }
  return href
}

/** Text pod názvem v zástupném rámečku — stejný pro React i legacy HTML. */
export function embedNotice(service: string): string {
  return `Po kliknutí se načte obsah třetí strany (${service}) a odešle se jí tvoje IP adresa.`
}

export function embedLoadLabel(service: string): string {
  return `Načíst ${service}`
}

export const EMBED_OPEN_LABEL = 'Otevřít v novém okně'

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
