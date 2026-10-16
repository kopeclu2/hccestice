import Image from 'next/image'
import React from 'react'

import type { Photo } from '@/landing/types'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { monogram } from '@/lib/teamName'
import { cn } from '@/lib/utils'

/**
 * Znak týmu — dekorativní (`alt=""`), jméno stojí vždy vedle jako text.
 * Soupeř bez znaku dostane kroužek s monogramem, aby kompozice zůstala
 * souměrná. Velikost řídí volající přes `className`, barevné podání přes
 * `tone`. Vnitřní okraj loga je pevný (`p-*`), ne v procentech —
 * procentní padding se počítá ze šířky rodiče, takže v buňce tabulky
 * logo zmizelo.
 *
 * Tóny: `dark` = na tmavé ploše (bílý podklad loga), `light` = na světlé
 * (rámeček), `club` = na klubové zelené, `board` = výsledková tabule
 * (`MatchScoreboard`; o fous průhlednější než `dark` a tučnější monogram).
 */
export type TeamCrestTone = 'dark' | 'light' | 'club' | 'board'

const MONOGRAM_TONE: Record<TeamCrestTone, string> = {
  dark: 'border-on-contrast-line text-on-contrast-soft',
  light: 'border-line bg-chip text-ink-soft',
  club: 'border-on-contrast-ghost bg-on-contrast-wash text-on-contrast',
  board: 'border-on-contrast-line font-extrabold text-on-contrast-muted',
}

const LOGO_TONE: Record<TeamCrestTone, string> = {
  dark: 'bg-on-contrast-strong p-1',
  light: 'border border-line-soft bg-surface p-0.5',
  club: 'bg-on-contrast-strong p-1',
  board: 'bg-on-contrast-strong p-1',
}

export function TeamCrest({
  logo,
  name,
  className,
  tone = 'dark',
  sizes,
  pixels = 128,
  monogramClassName,
}: {
  logo: Photo | null
  name: string
  className?: string
  tone?: TeamCrestTone
  /** Atribut `sizes` pro `next/image`; bez něj se loga servíruje v 1× a 2× šířce `pixels`. */
  sizes?: string
  /** Vlastní rozměr obrázku (šířka i výška) — nejmenší, co se na stránce zobrazí ostře. */
  pixels?: number
  monogramClassName?: string
}) {
  if (!logo) {
    return (
      <span
        aria-hidden
        className={cn(
          'grid flex-none place-items-center rounded-full border font-bold',
          MONOGRAM_TONE[tone],
          className,
          monogramClassName,
        )}
      >
        {monogram(name)}
      </span>
    )
  }
  return (
    <Image
      alt=""
      aria-hidden
      className={cn('flex-none rounded-full object-contain', LOGO_TONE[tone], className)}
      height={pixels}
      sizes={sizes}
      src={getMediaUrl(logo.url, logo.updatedAt)}
      width={pixels}
    />
  )
}
