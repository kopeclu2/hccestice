import React from 'react'

import type { ArticleAuthor } from '@/landing/features/posts/types'
import { cn } from '@/lib/utils'

/** Barevné ladění meta řádku; `plain` = bez avataru (hero Zápas). */
export type AuthorMetaTone = 'photo' | 'panel' | 'light' | 'plain'

const rowClass: Record<AuthorMetaTone, string> = {
  photo: 'text-on-contrast-soft',
  panel: 'text-on-contrast-soft',
  light: 'text-faint',
  plain: 'text-on-contrast-muted',
}

const dotClass: Record<AuthorMetaTone, string> = {
  photo: 'bg-on-contrast-ghost',
  panel: 'bg-on-contrast-line',
  light: 'bg-inactive',
  plain: 'bg-on-contrast-line',
}

function Dot({ tone }: { tone: AuthorMetaTone }) {
  return <span className={cn('size-1 flex-none rounded-full', dotClass[tone])} />
}

/** Řádek autor · datum · doba čtení pod titulkem hero. */
export function AuthorMeta({
  author,
  dateLabel,
  readingLabel,
  tone,
  className,
}: {
  author: ArticleAuthor
  dateLabel: string
  readingLabel: string
  tone: AuthorMetaTone
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4.5 gap-y-3 text-sm font-medium',
        rowClass[tone],
        className,
      )}
    >
      {tone === 'plain' ? (
        <span>{author.name}</span>
      ) : (
        <span className="flex items-center gap-2.25">
          <span
            className={cn(
              'grid size-7.5 flex-none place-items-center rounded-full text-eyebrow font-bold',
              tone === 'light' ? 'bg-contrast text-lime' : 'bg-lime text-ink',
            )}
          >
            {author.initials}
          </span>
          <span className={tone === 'light' ? 'text-ink' : 'text-on-contrast'}>{author.name}</span>
        </span>
      )}
      {dateLabel && (
        <>
          <Dot tone={tone} />
          <span>{dateLabel}</span>
        </>
      )}
      <Dot tone={tone} />
      <span>{readingLabel}</span>
    </div>
  )
}
