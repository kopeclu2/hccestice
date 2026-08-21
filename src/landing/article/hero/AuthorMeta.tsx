import React from 'react'

import { cn } from '@/utilities/ui'

import type { ArticleAuthor } from '../../types'

/** Barevné ladění meta řádku; `plain` = bez avataru (hero Zápas). */
export type AuthorMetaTone = 'photo' | 'panel' | 'light' | 'plain'

const rowClass: Record<AuthorMetaTone, string> = {
  photo: 'text-white/80',
  panel: 'text-white/75',
  light: 'text-faint',
  plain: 'text-white/65',
}

const dotClass: Record<AuthorMetaTone, string> = {
  photo: 'bg-white/40',
  panel: 'bg-white/35',
  light: 'bg-inactive',
  plain: 'bg-white/30',
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
        'flex flex-wrap items-center gap-x-4.5 gap-y-3 text-meta font-semibold',
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
              'grid size-7.5 flex-none place-items-center rounded-full text-eyebrow font-extrabold',
              tone === 'light' ? 'bg-contrast text-lime' : 'bg-lime text-ink',
            )}
          >
            {author.initials}
          </span>
          <span className={tone === 'light' ? 'text-ink' : 'text-white'}>{author.name}</span>
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
