import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { PillLink } from '../components/PillLink'
import type { ArticleAuthor } from '../types'

/**
 * Vizitka autora pod článkem — portrét z kolekce People (nebo
 * iniciály), jméno, role a mailto CTA (jen když je e-mail).
 */
export function AuthorCard({ author }: { author: ArticleAuthor }) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-4.5 rounded-block border border-line-mid bg-surface px-6.5 py-5.5">
      {author.photo ? (
        <Image
          alt={author.name}
          className="size-13 flex-none rounded-full object-cover"
          height={52}
          src={getMediaUrl(author.photo.url)}
          width={52}
        />
      ) : (
        <span className="bg-contrast text-lime grid size-13 flex-none place-items-center rounded-full text-body font-extrabold">
          {author.initials}
        </span>
      )}
      {/* `min-w-50` je desktopová rezerva, aby jméno nesdílelo řádek s CTA.
          Na 320px kvůli ní jméno spadlo pod avatar a vizitka měla tři řádky. */}
      <div className="min-w-0 md:min-w-50">
        <div className="text-body font-extrabold tracking-tight">{author.name}</div>
        {(author.role || author.note) && (
          <div className="text-faint text-meta font-semibold">
            {[author.role, author.note].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>
      <div className="flex-1" />
      {author.email && (
        <PillLink href={`mailto:${author.email}`} size="md" variant="dark" withArrow>
          Napsat autorovi
        </PillLink>
      )}
    </div>
  )
}
