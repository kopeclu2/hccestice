import type { Page, Post } from '@/payload-types'

/**
 * Převod legacy HTML z eStránky na prostý text.
 *
 * Používá to výpis aktualit (úryvky na kartách) i `generateMeta` — část
 * naimportovaných polí `meta.description` obsahuje celý HTML odstavec
 * (`<p><span style="…">…</span></p>`) nebo diakritiku zapsanou entitami
 * (`brig&aacute;da`), takže se bez tohohle čištění markup propíše do stránky.
 */

/**
 * Pojmenované entity, které se v legacy obsahu reálně vyskytují
 * (interpunkce + česká diakritika zapsaná entitami).
 */
const ENTITY: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  ldquo: '“',
  rdquo: '”',
  bdquo: '„',
  lsquo: '‘',
  rsquo: '’',
  sbquo: '‚',
  laquo: '«',
  raquo: '»',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  times: '×',
  middot: '·',
  bull: '•',
  deg: '°',
  euro: '€',
  copy: '©',
  reg: '®',
  rarr: '→',
  rArr: '⇒',
  aacute: 'á',
  eacute: 'é',
  iacute: 'í',
  oacute: 'ó',
  uacute: 'ú',
  yacute: 'ý',
  uring: 'ů',
  ccaron: 'č',
  dcaron: 'ď',
  ecaron: 'ě',
  ncaron: 'ň',
  rcaron: 'ř',
  scaron: 'š',
  tcaron: 'ť',
  zcaron: 'ž',
  Aacute: 'Á',
  Eacute: 'É',
  Iacute: 'Í',
  Oacute: 'Ó',
  Uacute: 'Ú',
  Yacute: 'Ý',
  Uring: 'Ů',
  Ccaron: 'Č',
  Dcaron: 'Ď',
  Ecaron: 'Ě',
  Ncaron: 'Ň',
  Rcaron: 'Ř',
  Scaron: 'Š',
  Tcaron: 'Ť',
  Zcaron: 'Ž',
}

/** Entity → znaky. Nejdřív přesná shoda (`&Aacute;` ≠ `&aacute;`). */
export const decodeEntities = (value: string): string =>
  value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(
      /&([a-zA-Z]+);/g,
      (match, name: string) => ENTITY[name] ?? ENTITY[name.toLowerCase()] ?? match,
    )

/**
 * HTML → prostý text. Entity se dekódují ještě před stripováním tagů, protože
 * část legacy obsahu je escapovaná dvakrát (`&lt;span style=…&gt;`) — jinak by
 * se markup propsal do výsledku. Běží proto ve dvou průchodech.
 */
export const htmlPlainText = (html: string): string => {
  let text = decodeEntities(html)
  for (let pass = 0; pass < 2 && /<[a-z/!]/i.test(text); pass++) {
    text = text
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]*>/g, ' ')
    text = decodeEntities(text)
  }
  return (
    text
      // oddělovací linky z editoru („-----", „_____") nejsou text
      .replace(/[-_=]{3,}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  )
}

/**
 * Vypadá text jako próza, ne jako tabulka?
 *
 * Část legacy článků má v obsahu rozpis nebo tabulku, ze které po odstranění
 * tagů vypadne „9:00 10:00 11:00 Po 6.2.12" nebo prostrkaný nadpis
 * „L E D O V Á P L O C H A". Jako úryvek na kartě je to horší než nic.
 */
export const looksLikeProse = (text: string): boolean => {
  const tokens = text.split(/\s+/).filter(Boolean)
  if (tokens.length < 5) return false

  // Prostrkaný nadpis („L E D O V Á P L O C H A") nemá delší slova.
  // Pozor: jednoznaková slova samotná šum neznamenají, čeština má
  // jednoslabičné předložky („v Česticích", „s mládeží", „a žáci").
  const words = tokens.filter((token) => /\p{L}{3,}/u.test(token))
  if (words.length < 4) return false

  // Rozpisy a tabulky poznáme podle podílu tokenů bez jediného písmene
  // („17:30", „19.1.2024", „5:2", „—").
  const noise = tokens.filter((token) => !/\p{L}/u.test(token))
  return noise.length / tokens.length < 0.3
}

const contentWords = (value: string): string[] =>
  value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .match(/[a-z0-9]{4,}/g) ?? []

/**
 * Zahodí úvodní věty, které jen převyprávějí titulek.
 *
 * Legacy reportáže začínají hlavičkou zápasu („1. kolo oblastní ligy ledního
 * hokeje HC Čestice x TJ Voděrady 16.2.2019 16:30 zimní stadion…"), což je
 * přesně to, co už stojí v titulku karty. Práh je vysoký záměrně — věta, která
 * názvy týmů jen zmiňuje („V pátek se odehrál přátelský zápas Čestic se…"),
 * informaci nese a zůstává.
 */
/**
 * Je text jen převyprávěný titulek? Kontrola na hotový úryvek — hranice věty
 * v legacy obsahu často chybí, takže nadpis a navazující tabulka splynou
 * do jednoho bloku a `dropTitleEcho` je od sebe neoddělí.
 */
export const echoesTitle = (text: string, title: string, threshold = 0.8): boolean => {
  const titleWords = new Set(contentWords(title))
  const words = contentWords(text)
  if (!titleWords.size || !words.length) return false
  return words.filter((word) => titleWords.has(word)).length / words.length >= threshold
}

export const dropTitleEcho = (text: string, title: string): string => {
  const titleWords = new Set(contentWords(title))
  if (!titleWords.size) return text

  // Hranice věty = tečka + mezera + velké písmeno. Dělit na každé tečce nejde,
  // legacy titulky začínají číslovkou („1. kolo okresního přeboru…").
  const sentences = text.split(/(?<=[.!?])\s+(?=\p{Lu})/u)
  // Projde i poslední větu — článek, jehož obsahem je jen nadpis shodný
  // s titulkem, má zůstat bez úryvku (karta pak nese jen titulek).
  let index = 0
  while (index < sentences.length) {
    const words = contentWords(sentences[index])
    const shared = words.length
      ? words.filter((word) => titleWords.has(word)).length / words.length
      : 1
    if (shared < 0.8) break
    index++
  }
  return sentences.slice(index).join(' ').trim()
}

/**
 * Úryvek — celé věty, dokud se vejdou do limitu; když se nevejde ani první,
 * ořeže se na hranici slova. Tři tečky jen když se text nevešel celý.
 */
export const snippet = (text: string, maxChars = 180): string => {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxChars) return clean

  const sentences = clean.slice(0, maxChars + 60).match(/[^.!?]+[.!?]+/g) ?? []
  let out = ''
  for (const sentence of sentences) {
    if ((out + sentence).trim().length > maxChars) break
    out += sentence
  }
  if (out.trim()) return out.trim()

  const cut = clean.slice(0, maxChars)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()}…`
}

/**
 * Emoji pryč. Do meta popisku nepatří: Google je ve snippetu stejně
 * zahazuje a na kartách sítí rozbíjejí zalomení. Zachovává se ©, ® a ™
 * (jsou to `Extended_Pictographic`, ale běžná typografie), šipky a
 * interpunkce. Vynechané mezery po emoji se slijí.
 */
export const stripEmoji = (text: string): string =>
  text
    .replace(
      /(?![©®™])\p{Extended_Pictographic}|[\p{Regional_Indicator}\u200D\uFE0F\u20E3\u{1F3FB}-\u{1F3FF}]/gu,
      '',
    )
    .replace(/\s+/g, ' ')
    .trim()

type LexicalNode = { type?: unknown; text?: unknown; children?: unknown }

/** Inline uzly lexicalu — za nimi se mezera nevkládá, text pokračuje větou. */
const INLINE_NODES = new Set(['text', 'link', 'autolink'])

const lexicalNodeText = (node: LexicalNode): string => {
  if (typeof node.text === 'string') return node.text
  if (node.type === 'linebreak') return ' '
  if (!Array.isArray(node.children)) return ''
  const inner = node.children.map((child) => lexicalNodeText(child as LexicalNode)).join('')
  // Odstavec, nadpis a položka seznamu se oddělují mezerou, jinak by věty
  // sousedních odstavců splynuly („…zápas.Další…") a `snippet` by je nerozdělil.
  return INLINE_NODES.has(String(node.type)) ? inner : `${inner} `
}

/**
 * Prostý text z lexical stromu bez závislosti na Payloadu (`lib/` je
 * izomorfní). Bloky bez textu (upload, relace) nic nepřidají.
 */
export const lexicalRootText = (content: { root: unknown } | null | undefined): string =>
  content?.root ? lexicalNodeText(content.root as LexicalNode).trim() : ''

/** Zdroj těla dokumentu pro `descriptionFromBody` — `Post` nebo `Page`. */
export type BodySource = {
  title?: string | null
  /** `Post`: lexical tělo. */
  content?: Post['content']
  /** `Post`: původní HTML z eStránky (import). */
  legacyHtml?: string | null
  contentType?: Post['contentType']
  /** `Page`: bloky. */
  layout?: Page['layout'] | null
}

/**
 * Text těla dokumentu ve čtecím pořadí. Post: dle `contentType` buď
 * `legacyHtml`, nebo lexical; když zvolený zdroj nic nedá, zkusí druhý
 * (import občas nechal `contentType` nevyplněný). Page: jen bloky, které
 * nesou souvislý text (`textSection`, `rawHtml`) — landing bloky mají
 * krátké popisky a štítky, ne úvodní odstavec.
 */
const bodyText = (doc: BodySource): string => {
  if (doc.layout) {
    const parts: string[] = []
    for (const block of doc.layout) {
      if (block.blockType === 'textSection') parts.push(lexicalRootText(block.content))
      else if (block.blockType === 'rawHtml') parts.push(htmlPlainText(block.html))
      if (parts.join(' ').length > 1200) break
    }
    return parts.join(' ')
  }

  const lexical = lexicalRootText(doc.content)
  const html = doc.legacyHtml ? htmlPlainText(doc.legacyHtml) : ''
  const [first, second] = doc.contentType === 'html' ? [html, lexical] : [lexical, html]
  return first.trim() ? first : second
}

/**
 * Záložní `meta description` z těla dokumentu, když redaktor SEO záložku
 * nevyplnil (naimportované články). Čistý text bez emoji, úvodní věty,
 * které jen opakují titulek (hlavička zápasu), se přeskočí a výsledek
 * se ořízne na hranici věty (`snippet`). Prázdný řetězec = tělo nic
 * použitelného nenese (tabulka, rozpis, jen obrázky) — to je lepší než
 * popisek „9:00 10:00 11:00 Po", Google si pak vezme úryvek sám.
 */
export const descriptionFromBody = (doc: BodySource, maxChars = 160): string => {
  const text = stripEmoji(htmlPlainText(bodyText(doc)))
  const body = doc.title ? dropTitleEcho(text, htmlPlainText(doc.title)) : text
  const out = snippet(body, maxChars)
  return looksLikeProse(out) ? out : ''
}
