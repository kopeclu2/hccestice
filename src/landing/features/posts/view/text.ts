/** Text z těla článku: doba čtení a prostý text z lexical stromu. */

/** Počet slov v lexical stromu (rekurzivní sběr `text` polí). */
export const lexicalWordCount = (node: unknown): number => {
  if (!node || typeof node !== 'object') return 0
  const record = node as { text?: unknown; children?: unknown; root?: unknown }
  let count = 0
  if (typeof record.text === 'string') {
    count += record.text.split(/\s+/).filter(Boolean).length
  }
  if (record.root) count += lexicalWordCount(record.root)
  if (Array.isArray(record.children)) {
    for (const child of record.children) count += lexicalWordCount(child)
  }
  return count
}

/** Počet slov v HTML (po odstranění tagů). */
export const htmlWordCount = (html: string): number =>
  html
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

/** „4 min čtení" — 200 slov/min, minimálně 1 minuta. */
export const readingLabel = (words: number): string =>
  `${Math.max(1, Math.round(words / 200))} min čtení`

/** Prostý text z lexical stromu (rekurzivní sběr `text` polí). */
export const lexicalPlainText = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''
  const record = node as { text?: unknown; children?: unknown; root?: unknown }
  const parts: string[] = []
  if (typeof record.text === 'string') parts.push(record.text)
  if (record.root) parts.push(lexicalPlainText(record.root))
  if (Array.isArray(record.children)) {
    for (const child of record.children) parts.push(lexicalPlainText(child))
  }
  return parts.filter(Boolean).join(' ')
}
