import { EMBED_SANDBOX, normalizeEmbedUrl } from '@/lib/embedHosts'

/**
 * Načtení cizího iframe až po kliknutí — část pro legacy HTML (články,
 * RawHtml), které React nevlastní. Server (`landing/lib/legacyEmbeds`)
 * nahradí každý iframe zástupným rámečkem s těmito atributy a klient
 * (`EmbedLoader`) ho po kliknutí na tlačítko vymění za iframe.
 *
 * Izomorfní a bez vedlejších efektů při importu, aby šla testovat v jsdomu.
 */

/** Kořen zástupného rámečku; hodnota je adresa iframe. */
export const EMBED_ATTR = 'data-embed'
export const EMBED_TITLE_ATTR = 'data-embed-title'
export const EMBED_WIDTH_ATTR = 'data-embed-width'
export const EMBED_HEIGHT_ATTR = 'data-embed-height'
/** Tlačítko uvnitř rámečku, které iframe načte. */
export const EMBED_LOAD_ATTR = 'data-embed-load'

const DIMENSION = /^\d{1,4}$/

/**
 * Vymění zástupný rámeček za iframe. Adresa se znovu ověří proti seznamu
 * hostů (atributy mohly vzniknout jinde než na serveru) a sandbox je vždy
 * pevný — z atributů se nečte. Vrací vložený iframe, nebo `null`, když
 * rámeček nemá povolenou adresu (nic se nevloží).
 */
export function activateEmbed(placeholder: Element): HTMLIFrameElement | null {
  const src = normalizeEmbedUrl(placeholder.getAttribute(EMBED_ATTR))
  if (!src) return null

  const iframe = placeholder.ownerDocument.createElement('iframe')
  iframe.src = src
  iframe.title = placeholder.getAttribute(EMBED_TITLE_ATTR) ?? 'Externí obsah'
  iframe.className = 'max-w-full border-0'
  iframe.setAttribute('sandbox', EMBED_SANDBOX)
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin')
  iframe.setAttribute('allowfullscreen', '')

  const width = placeholder.getAttribute(EMBED_WIDTH_ATTR)
  const height = placeholder.getAttribute(EMBED_HEIGHT_ATTR)
  if (width && DIMENSION.test(width)) iframe.setAttribute('width', width)
  if (height && DIMENSION.test(height)) iframe.setAttribute('height', height)

  placeholder.replaceWith(iframe)
  return iframe
}

/**
 * Obsluha kliknutí v dokumentu: když cíl leží v tlačítku zástupného
 * rámečku, rámeček se načte a fokus přejde na iframe (tlačítko zmizelo).
 * Vrací, jestli kliknutí obslouženo.
 */
export function handleEmbedClick(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  const button = target.closest(`[${EMBED_LOAD_ATTR}]`)
  const placeholder = button?.closest(`[${EMBED_ATTR}]`)
  if (!placeholder) return false
  activateEmbed(placeholder)?.focus()
  return true
}
