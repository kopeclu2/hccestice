'use client'

import { Megaphone, X } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
        tone === 'warning' ? 'bg-lime text-ink' : 'bg-club text-on-contrast',
      )}
      role="status"
    >
      <Megaphone className="size-5 flex-none" strokeWidth={2.25} />
      <p className="flex-1 text-sm font-semibold">
        {text}
        {linkLabel && linkHref && (
          <Link className="ml-2 underline underline-offset-2" href={linkHref}>
            {linkLabel}
          </Link>
        )}
      </p>
      {dismissible && (
        <Button
          aria-label="Zavřít oznámení"
          className="grid size-7 flex-none place-items-center gap-0 rounded-full hover:bg-scrim/10 hover:text-current [&_svg]:size-4"
          onClick={() => setDismissed(true)}
          size="clear"
          variant="ghost"
        >
          <X strokeWidth={2.5} />
        </Button>
      )}
    </div>
  )
}
