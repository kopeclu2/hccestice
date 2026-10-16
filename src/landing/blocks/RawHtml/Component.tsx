import React from 'react'

import { sanitizeHtml } from '@/hooks/sanitizeHtml'
import type { RawHtmlBlock as RawHtmlBlockProps } from '@/payload-types'

export const RawHtmlBlock: React.FC<RawHtmlBlockProps> = ({ html }) => {
  if (!html) return null

  /*
   * Container a typografie jsou tytéž jako u těla článku (`ArticleBody`):
   * šířka `51.25rem` a `px-gutter` z landing systému,
   * ne shadcn `.container`. Ten má jiné odsazení, takže legacy obsah
   * (`/kontakty`, `/nabor`) nesedí na levou hranu `<h1>` hlavičky.
   * Typografii drží `article-prose`, ne Tailwind `prose` — ten má vlastní
   * škálu i barvy a bez `dark:prose-invert` navíc nedrží tmavý režim.
   */
  return (
    <div className="relative z-1 mx-auto max-w-article px-gutter">
      {/* Legacy obsah importovaný z eStránky — rendrováno jako HTML. Sanitizace i tady, ne jen v hooku: data mohla vzniknout mimo něj. */}
      <div className="article-prose" dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
    </div>
  )
}
