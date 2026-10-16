import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import type { Post } from '@/payload-types'

/** Text z těla článku: doba čtení a prostý text z lexical stromu. */

type LexicalContent = Post['content'] | undefined

/**
 * Prostý text z lexical stromu. Odstavce odděluje prázdným řádkem a navazující
 * textové úseky (tučné slovo uprostřed věty) spojuje bez mezery — vlastní
 * rekurzivní sběr je dřív rozděloval a nadhodnocoval počet slov.
 */
export const lexicalPlainText = (content: LexicalContent): string =>
  content ? convertLexicalToPlaintext({ data: content }) : ''

/** Počet slov v lexical stromu. */
export const lexicalWordCount = (content: LexicalContent): number =>
  lexicalPlainText(content).split(/\s+/).filter(Boolean).length

/** Počet slov v HTML (po odstranění tagů). */
export const htmlWordCount = (html: string): number =>
  html
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

/** „4 min čtení" — 200 slov/min, minimálně 1 minuta. */
export const readingLabel = (words: number): string =>
  `${Math.max(1, Math.round(words / 200))} min čtení`
