'use client'

import { Megaphone, X } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Pruh s oznámením („Trénink v pátek zrušen…").
 * Zavření se pamatuje jen v rámci návštěvy (stav komponenty).
 */
export function AnnouncementBar({
  text,
  tone,
  linkLabel,
  linkHref,
  dismissible,
}: {
  text: string
  tone: 'info' | 'warning'
  linkLabel: string | null
  linkHref: string | null
  dismissible: boolean
}) {
  const [dismissed, setDismissed] = React.useState(false)
  if (dismissed) return null

  return (
    <div
      className={cn(
        'flex items-center gap-3.5 rounded-tile px-5.5 py-3.5',
        tone === 'warning' ? 'bg-lime text-ink' : 'bg-club text-white',
      )}
      role="status"
    >
      <Megaphone className="size-5 flex-none" strokeWidth={2.25} />
      <p className="flex-1 text-meta font-bold">
        {text}
        {linkLabel && linkHref && (
          <Link className="ml-2 underline underline-offset-2" href={linkHref}>
            {linkLabel}
          </Link>
        )}
      </p>
      {dismissible && (
        <button
          aria-label="Zavřít oznámení"
          className="grid size-7 flex-none cursor-pointer place-items-center rounded-full transition-colors hover:bg-black/10 [&_svg]:size-4"
          onClick={() => setDismissed(true)}
          type="button"
        >
          <X strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}
