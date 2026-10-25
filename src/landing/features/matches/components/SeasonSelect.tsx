'use client'

import Link from 'next/link'
import React, { useEffect, useId, useRef, useState } from 'react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { SeasonPill } from './SeasonFilters'

/**
 * Výběr sezóny jako rozbalovací nabídka. Položky jsou obyčejné odkazy
 * (`?sezona=`), takže stav zůstává v URL a crawler je vidí i v zavřené
 * nabídce (`hidden` je jen skryje). Radix `Select` se záměrně nepoužívá:
 * přidal by do hlavního balíčku každé stránky 13–18 kB (viz AGENTS.md),
 * tahle komponenta nese jen tlačítko, zavření na Esc a klik mimo.
 *
 * Změna sezóny vynechá `strana`, takže se výpis vrátí na první stranu.
 */
export function SeasonSelect({
  seasons,
  activeSlug,
  basePath,
  anchor = '',
}: {
  seasons: SeasonPill[]
  activeSlug: string | null
  basePath: string
  anchor?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (seasons.length === 0) return null

  const active = seasons.find((season) => season.slug === activeSlug) ?? seasons[0]

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'gap-2')}
        onClick={() => setOpen((value) => !value)}
        ref={triggerRef}
        type="button"
      >
        {active.label}
        <svg
          aria-hidden
          className={cn('size-3.5 transition-transform', open && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <ul
        className="absolute top-full left-0 z-30 mt-2 max-h-72 min-w-full overflow-y-auto rounded-field border border-line bg-surface p-1.5 shadow-lg"
        hidden={!open}
        id={menuId}
      >
        {seasons.map((season) => {
          const selected = season.slug === active.slug
          return (
            <li key={season.slug}>
              <Link
                aria-current={selected ? 'true' : undefined}
                className={cn(
                  'flex items-center justify-between gap-4 rounded-chip px-3 py-2 text-sm font-semibold whitespace-nowrap max-md:py-3',
                  selected ? 'bg-club-dark text-on-contrast' : 'text-ink hover:bg-tint',
                )}
                href={`${basePath}?sezona=${season.slug}${anchor}`}
                onClick={() => setOpen(false)}
              >
                {season.label}
                {selected && <span aria-hidden>✓</span>}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
