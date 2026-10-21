/**
 * Třídy zástupného rámečku cizího obsahu — jeden zdroj pro React
 * (`ClickToLoadEmbed`) i pro legacy HTML (`landing/lib/legacyEmbeds`), aby
 * oba vypadaly stejně. `<span>` místo `<p>`: uvnitř `article-prose` by
 * `p` dostal vlastní odsazení a barvy odkazů.
 */
export const EMBED_BOX_CLASS =
  'flex flex-col items-center justify-center gap-3 rounded-section border border-line-soft bg-paper px-4 py-8 text-center'
export const EMBED_TITLE_CLASS = 'block max-w-110 text-sm font-bold text-ink md:text-base'
export const EMBED_NOTE_CLASS = 'block max-w-110 text-xs leading-copy text-ink-soft'
export const EMBED_LINK_CLASS =
  'inline-block py-3 text-sm font-semibold text-club underline underline-offset-4 hover:text-club-dark md:py-0'
