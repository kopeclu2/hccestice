import 'server-only'

import { JSDOM } from 'jsdom'

import { buttonVariants } from '@/components/ui/button'
import { sanitizeHtml } from '@/hooks/sanitizeHtml'
import {
  EMBED_BOX_CLASS,
  EMBED_LINK_CLASS,
  EMBED_NOTE_CLASS,
  EMBED_TITLE_CLASS,
} from '@/landing/ui/clickToLoad'
import {
  EMBED_ATTR,
  EMBED_HEIGHT_ATTR,
  EMBED_LOAD_ATTR,
  EMBED_TITLE_ATTR,
  EMBED_WIDTH_ATTR,
} from '@/lib/embedActivate'
import {
  EMBED_OPEN_LABEL,
  embedLoadLabel,
  embedNotice,
  embedOpenUrl,
  embedServiceOf,
} from '@/lib/embedHosts'

/**
 * Legacy HTML (`posts.legacyHtml`, blok RawHtml) pro vykreslení: po
 * sanitizaci nahradí každý cizí iframe zástupným rámečkem „Načíst …", aby
 * stránka před kliknutím nekontaktovala třetí stranu. Iframe vloží až klient
 * (`EmbedLoader` → `activateEmbed`).
 *
 * Sanitizace běží první a její výstup se jen přepisuje: `src` iframe už je
 * ověřený proti seznamu hostů, přepsaný na `https` a u YouTube na
 * `youtube-nocookie.com` (viz `sanitizeHtml`). Zástupný rámeček vzniká přes
 * DOM (`textContent`, `setAttribute`), nikdy skládáním řetězců, takže název
 * ani adresa z legacy dat se do markupu nedostanou jinak než jako hodnota.
 */

let document: Document | null = null

function getDocument(): Document {
  document ??= new JSDOM('').window.document
  return document
}

const DIMENSION = /^\d{1,4}$/

/** Rozměr z atributu (`width="705"`) nebo z `style` (`width: 711px`); jinak `null`. */
function dimensionOf(iframe: Element, name: 'width' | 'height'): string | null {
  const attr = iframe.getAttribute(name)?.trim()
  if (attr && DIMENSION.test(attr)) return attr
  const fromStyle = new RegExp(`(?:^|;)\\s*${name}\\s*:\\s*(\\d{1,4})px`, 'i').exec(
    iframe.getAttribute('style') ?? '',
  )
  return fromStyle?.[1] ?? null
}

function span(doc: Document, className: string, text: string): HTMLSpanElement {
  const element = doc.createElement('span')
  element.className = className
  element.textContent = text
  return element
}

function buildPlaceholder(doc: Document, iframe: Element): HTMLElement | null {
  const src = iframe.getAttribute('src')
  const openHref = embedOpenUrl(src)
  if (!src || !openHref) return null

  const service = embedServiceOf(src)
  // Serializér jsdomu v hodnotě atributu `<` a `>` nepřepisuje; v uvozovkách je
  // to neškodné, ale z názvu je stejně nepotřebujeme, tak ať v markupu nejsou.
  const title =
    iframe.getAttribute('title')?.replace(/[<>]/g, '').trim() || `Externí obsah — ${service}`

  const box = doc.createElement('span')
  box.className = `${EMBED_BOX_CLASS} min-h-48 w-full max-w-full`
  box.setAttribute(EMBED_ATTR, src)
  box.setAttribute(EMBED_TITLE_ATTR, title)
  box.setAttribute('role', 'group')
  box.setAttribute('aria-label', title)
  const width = dimensionOf(iframe, 'width')
  const height = dimensionOf(iframe, 'height')
  if (width) box.setAttribute(EMBED_WIDTH_ATTR, width)
  if (height) box.setAttribute(EMBED_HEIGHT_ATTR, height)

  const button = doc.createElement('button')
  button.type = 'button'
  button.className = buttonVariants({ size: 'sm', variant: 'dark' })
  button.setAttribute(EMBED_LOAD_ATTR, '')
  button.textContent = embedLoadLabel(service)

  const link = doc.createElement('a')
  link.className = EMBED_LINK_CLASS
  link.setAttribute('href', openHref)
  link.setAttribute('target', '_blank')
  link.setAttribute('rel', 'noopener noreferrer')
  link.textContent = EMBED_OPEN_LABEL

  box.append(
    span(doc, EMBED_TITLE_CLASS, title),
    span(doc, EMBED_NOTE_CLASS, embedNotice(service)),
    button,
    link,
  )
  return box
}

/**
 * Vyčištěné HTML s iframy nahrazenými zástupnými rámečky. Bez iframe vrací
 * přesně `sanitizeHtml(html)` (rychlá cesta bez dalšího parsování).
 */
export function renderLegacyHtml(html: string): string {
  const clean = sanitizeHtml(html)
  if (!clean.includes('<iframe')) return clean

  const doc = getDocument()
  const template = doc.createElement('template')
  template.innerHTML = clean
  for (const iframe of template.content.querySelectorAll('iframe')) {
    const placeholder = buildPlaceholder(doc, iframe)
    if (placeholder) iframe.replaceWith(placeholder)
    else iframe.remove()
  }
  return template.innerHTML
}
