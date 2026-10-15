import React from 'react'

import { cn } from '@/utilities/ui'

import { Eyebrow } from './Kicker'

/**
 * Eyebrow s lime tečkou na tmavém panelu („Nejbližší zápas · Doma",
 * soutěž v hlavičce detailu zápasu).
 *
 * Tečka sedí ve výšce prvního řádku (`h-[1lh]`), takže se při zalomení
 * nevycentruje mezi dva řádky ani nezůstane sama nad textem (to dělal
 * `flex-wrap`). Části oddělené „ · " jsou nedělitelné — řádek se láme jen
 * za tečkou: „VČHL 2. ročník ·" | „Základní část".
 */
export function DotEyebrow({
  children,
  className,
  tone = 'lime',
}: {
  children: React.ReactNode
  className?: string
  tone?: 'lime' | 'white'
}) {
  const parts = typeof children === 'string' ? children.split(' · ') : null
  return (
    <Eyebrow as="div" className={cn('flex gap-2.5', className)} tone={tone}>
      <span aria-hidden className="flex h-[1lh] flex-none items-center">
        <span className="size-2 rounded-full bg-lime shadow-ring-lime" />
      </span>
      <span className="min-w-0">
        {parts
          ? parts.map((part, index) => (
              <React.Fragment key={`${index}-${part}`}>
                <span className="inline-block">
                  {part}
                  {index < parts.length - 1 && '\u00a0·'}
                </span>
                {index < parts.length - 1 && ' '}
              </React.Fragment>
            ))
          : children}
      </span>
    </Eyebrow>
  )
}
