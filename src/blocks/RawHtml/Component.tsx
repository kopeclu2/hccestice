import React from 'react'

import type { RawHtmlBlock as RawHtmlBlockProps } from '@/payload-types'

export const RawHtmlBlock: React.FC<RawHtmlBlockProps> = ({ html }) => {
  if (!html) return null

  /*
   * Container a typografie jsou tytéž jako u těla článku (`ArticleBody`):
   * šířka `51.25rem` a `px-[clamp(0.875rem,3vw,2.5rem)]` z landing systému,
   * ne shadcn `.container`. Ten má jiné odsazení, takže legacy obsah
   * (`/kontakty`, `/nabor`) nesedí na levou hranu `<h1>` hlavičky.
   * Typografii drží `article-prose`, ne Tailwind `prose` — ten má vlastní
   * škálu i barvy a bez `dark:prose-invert` navíc nedrží tmavý režim.
   */
  return (
    <div className="relative z-1 mx-auto max-w-[51.25rem] px-[clamp(0.875rem,3vw,2.5rem)]">
      {/* Legacy obsah importovaný z eStránky — rendrováno jako HTML */}
      <div className="article-prose" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
