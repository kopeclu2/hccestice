import createDOMPurify from 'dompurify'
import type { DOMPurify, WindowLike } from 'dompurify'
import { JSDOM } from 'jsdom'
import type { FieldHook } from 'payload'

import { EMBED_SANDBOX, embedHostOf, normalizeEmbedUrl } from '@/lib/embedHosts'

/**
 * Sanitizace surového HTML (legacy články `posts.legacyHtml` a blok RawHtml).
 *
 * Obsah se renderuje přes `dangerouslySetInnerHTML`, takže bez čištění by
 * editor nebo kdokoli, kdo se do adminu dostane, vložil `<script>` /
 * `onerror=` a spustil ho každému návštěvníkovi. Čistí se dvakrát: při
 * uložení (`sanitizeHtmlFieldHook`, aby byla zdrojová data čistá) a při
 * renderu (`ArticleBody`, `RawHtml` — pojistka pro data zapsaná mimo hook,
 * např. přímo do databáze nebo importem).
 *
 * Běhové prostředí je Node. Pod Bunem jsdom při opakovaném parsování velkých
 * dokumentů roste do desítek GB paměti, proto skripty spouštěj přes `tsx`.
 *
 * Bez `server-only` záměrně: modul je dosažitelný z `payload.config.ts`
 * (hook na poli) a ze seed skriptů. Do klientského bundlu se nesmí dostat
 * (táhne jsdom); importují ho jen Server Components.
 *
 * Politika vychází z analýzy dat v produkční databázi (260 legacy článků,
 * 10 bloků RawHtml):
 * - tagy: běžný obsah vč. tabulek a starých `font`/`center`/`strike`;
 *   `script`, `style`, `form`, `input`, `textarea`, `object`, `embed`,
 *   `param`, `svg` (jen vložené ikony Material UI), `base`, `meta`, `link` pryč;
 * - `iframe` jen z hostů v `lib/embedHosts` (YouTube, Google Tabulky,
 *   výsledkové servery…), vždy se `sandbox`, `src` přepsaný na `https`
 *   (YouTube na `youtube-nocookie.com`); před kliknutím ho z legacy HTML
 *   dělá zástupný rámeček `landing/lib/legacyEmbeds`;
 * - schémata odkazů jen `http(s)`, `mailto`, `tel` a relativní; `data:` se
 *   nepoužívá nikde, takže pryč i u obrázků;
 * - `on*` (17× `onclick`/`onmouseover` z vložené tabulky lidovky.cz) pryč,
 *   `data-*` pryč;
 * - `class` a `id` pryč: žádné CSS na ně nesahá (legacy `text-picture`,
 *   `MuiBox-*` jsou bez stylů), ale `class="fixed inset-0 z-50"` by dovolil
 *   přebít stránku vlastním obsahem;
 * - `style` zůstává, protože na něm stojí vzhled legacy tabulek
 *   (~39 000 výskytů, barvy, písmo, okraje), ale jen vybrané vlastnosti
 *   (`SAFE_CSS_PROPERTY`) — bez `position`, `top`, `z-index`, `url()` a
 *   `expression()`. `position: absolute` měly 20 iframů z lidovky.cz a bez
 *   něj se prostě zařadí do toku stránky.
 */

const ALLOWED_TAGS = [
  'a',
  'abbr',
  'b',
  'blockquote',
  'br',
  'caption',
  'center',
  'cite',
  'code',
  'col',
  'colgroup',
  'dd',
  'del',
  'div',
  'dl',
  'dt',
  'em',
  'figcaption',
  'figure',
  'font',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'iframe',
  'img',
  'ins',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  'q',
  's',
  'small',
  'span',
  'strike',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
]

const ALLOWED_ATTR = [
  'align',
  'allowfullscreen',
  'alt',
  'bgcolor',
  'border',
  'cellpadding',
  'cellspacing',
  'color',
  'cols',
  'colspan',
  'dir',
  'face',
  'frame',
  'frameborder',
  'height',
  'href',
  'lang',
  'rowspan',
  'rules',
  'scope',
  'scrolling',
  'size',
  'span',
  'src',
  'start',
  'style',
  'target',
  'title',
  'type',
  'valign',
  'width',
]

/** Výchozí regex DOMPurify zúžený na schémata, která obsah reálně používá. */
const ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i

/**
 * Vlastnosti `style`, které se ponechají. Kromě typografie a boxu jsou tu
 * flex vlastnosti, protože vložený obsah z Material UI (výsledky) je
 * používá pro rozložení řádků.
 */
const SAFE_CSS_PROPERTY =
  /^(?:color|background(?:-color)?|font(?:-[a-z]+)?|text-(?:align|indent|decoration(?:-[a-z]+)?|transform|shadow)|line-height|letter-spacing|word-spacing|white-space|margin(?:-[a-z]+)?|padding(?:-[a-z]+)?|border(?:-[a-z]+)*|(?:min-|max-)?(?:width|height)|float|clear|display|vertical-align|table-layout|list-style(?:-[a-z]+)?|box-sizing|overflow(?:-[xy])?|flex(?:-[a-z]+)?|align-items|justify-content|-webkit-box-(?:flex|pack|align))$/

/** Hodnota, která se nikdy nepustí: `url()`, `expression()`, escapy, komentáře. */
const UNSAFE_CSS_VALUE =
  /url\s*\(|expression|javascript:|vbscript:|@import|behavior|binding|[\\<>]|\/\*/i

export type SanitizeReport = {
  /** Odstraněné elementy podle jména tagu. */
  tags: Record<string, number>
  /** Odstraněné atributy podle jména (`on*`, `class`, …). */
  attrs: Record<string, number>
  /** Vyhozené iframy podle hosta. */
  iframeHosts: Record<string, number>
  /** Vyhozené CSS vlastnosti z `style`. */
  styleProps: Record<string, number>
}

function emptyReport(): SanitizeReport {
  return { tags: {}, attrs: {}, iframeHosts: {}, styleProps: {} }
}

function bump(counter: Record<string, number>, key: string): void {
  counter[key] = (counter[key] ?? 0) + 1
}

/** Rozdělí obsah `style` na deklarace; středník v závorce či uvozovkách nedělí. */
function splitDeclarations(style: string): string[] {
  const declarations: string[] = []
  let depth = 0
  let quote = ''
  let current = ''
  for (const char of style) {
    if (quote) {
      if (char === quote) quote = ''
    } else if (char === '"' || char === "'") {
      quote = char
    } else if (char === '(') {
      depth++
    } else if (char === ')') {
      depth = Math.max(0, depth - 1)
    } else if (char === ';' && depth === 0) {
      declarations.push(current)
      current = ''
      continue
    }
    current += char
  }
  declarations.push(current)
  return declarations
}

/** Ponechá jen povolené vlastnosti s neškodnou hodnotou; vrací nový `style`. */
function filterStyle(style: string, report: SanitizeReport | null): string {
  const kept: string[] = []
  for (const declaration of splitDeclarations(style)) {
    const colon = declaration.indexOf(':')
    if (colon === -1) continue
    const property = declaration.slice(0, colon).trim().toLowerCase()
    const value = declaration.slice(colon + 1).trim()
    if (!property || !value) continue

    if (SAFE_CSS_PROPERTY.test(property) && !UNSAFE_CSS_VALUE.test(value)) {
      kept.push(`${property}: ${value}`)
    } else if (report) {
      bump(report.styleProps, property)
    }
  }
  return kept.join('; ')
}

let purifier: DOMPurify | null = null
/** Report běžícího volání; sanitizace je synchronní, takže stačí proměnná modulu. */
let activeReport: SanitizeReport | null = null

function getPurifier(): DOMPurify {
  if (purifier) return purifier

  // `JSDOM#window` je `DOMWindow`, DOMPurify chce `WindowLike` — struktura
  // sedí, jen typy jsou z různých balíčků.
  const instance = createDOMPurify(new JSDOM('').window as unknown as WindowLike)

  instance.addHook('uponSanitizeAttribute', (_node, data) => {
    if (data.attrName === 'style') {
      const filtered = filterStyle(data.attrValue, activeReport)
      if (filtered) {
        data.attrValue = filtered
      } else {
        data.keepAttr = false
      }
      return
    }
    // DOMPurify jinak pouští `data:` v `src` obrázků; data ho nepoužívají.
    if (
      (data.attrName === 'src' || data.attrName === 'href') &&
      /^[\s\u0000-\u001f]*data:/i.test(data.attrValue)
    ) {
      data.keepAttr = false
    }
  })

  instance.addHook('afterSanitizeAttributes', (node) => {
    if (node.nodeName === 'A') {
      // `rel` v allowlistu není, takže si ho tu každý odkaz do nového okna
      // nese jen od nás; `window.opener` tak cílová stránka nedostane.
      const target = node.getAttribute('target')
      if (target === '_blank') {
        node.setAttribute('rel', 'noopener noreferrer')
      } else if (target !== null && target !== '_self') {
        node.removeAttribute('target')
      }
      return
    }

    if (node.nodeName === 'IFRAME') {
      const src = node.getAttribute('src')
      // `https` a `youtube-nocookie.com` se dopisuje už tady, takže i uložená
      // data jsou čistá a výstup zůstává pevný bod.
      const normalized = normalizeEmbedUrl(src)
      if (!normalized) {
        if (activeReport) bump(activeReport.iframeHosts, embedHostOf(src))
        node.remove()
        return
      }
      node.setAttribute('src', normalized)
      // Záložní text „Your browser does not support inline frames" je
      // u iframe surový text a nemá v tokenu co dělat.
      node.textContent = ''
      node.setAttribute('sandbox', EMBED_SANDBOX)
      node.setAttribute('loading', 'lazy')
    }
  })

  purifier = instance
  return instance
}

function runSanitize(html: string, report: SanitizeReport | null): string {
  const instance = getPurifier()
  activeReport = report
  try {
    const clean = instance.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_ARIA_ATTR: true,
      ALLOW_DATA_ATTR: false,
      ALLOWED_URI_REGEXP,
      // Bez toho by úvodní <script>/<style> skončil v <head> a report by o něm nevěděl.
      FORCE_BODY: true,
    })

    if (report) {
      for (const entry of instance.removed) {
        if ('element' in entry && entry.element) {
          const name = entry.element.nodeName.toLowerCase()
          // `remove` a `body` jsou kostra, kterou si při FORCE_BODY staví sám DOMPurify.
          if (!name.startsWith('#') && name !== 'remove' && name !== 'body') bump(report.tags, name)
        } else if ('attribute' in entry && entry.attribute) {
          bump(report.attrs, entry.attribute.name.toLowerCase())
        }
      }
    }
    return clean
  } finally {
    activeReport = null
  }
}

/** Vyčistí HTML. Prázdný vstup vrací beze změny. Výstup je pevný bod (`f(f(x)) === f(x)`). */
export function sanitizeHtml(html: string): string {
  if (!html) return html
  return runSanitize(html, null)
}

/** Totéž co `sanitizeHtml`, ale s počty odstraněného — pro seed skript a testy. */
export function sanitizeHtmlWithReport(html: string): { html: string; report: SanitizeReport } {
  const report = emptyReport()
  if (!html) return { html, report }
  return { html: runSanitize(html, report), report }
}

/** `beforeChange` hook pole s HTML (`posts.legacyHtml`, `rawHtml.html`). */
export const sanitizeHtmlFieldHook: FieldHook = ({ value }) =>
  typeof value === 'string' ? sanitizeHtml(value) : value
