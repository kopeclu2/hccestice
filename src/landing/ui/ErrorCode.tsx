import React from 'react'

import { cn } from '@/lib/utils'

/**
 * Obří obrysový kód chyby („404", „500") s jedním plným lime znakem uvnitř.
 *
 * Nepatří do `Numeral.tsx` — to je škála pro *data* (skóre, číslo dresu,
 * letopočet). Tohle je grafika o velikosti půl obrazovky, která žádnou
 * hodnotu nenese; význam sdělují nadpis a `ErrorMeta` pod ním. Proto taky
 * `aria-hidden`: čtečka by jinak přečetla „čtyři nula čtyři" navíc.
 *
 * Fluidní velikost je jediná možná — 340 px se na mobil nevejde a fixní
 * `--text-watermark-*` token by 22vw z handoffu neuměl vyjádřit.
 */
export function ErrorCode({
  children,
  tone = 'light',
}: {
  /** Kód po znacích; prostřední znak se vyplní lime. */
  children: string
  /** `dark` = na tmavém podkladu (500), obrys v lime místo klubové zelené. */
  tone?: 'light' | 'dark'
}) {
  const chars = [...children]
  /* Handoff plní prostřední nulu. U delšího/kratšího kódu padne zvýraznění
   * na prostřední znak, ať komponenta nezůstane vázaná na tři znaky. */
  const accentIndex = Math.floor((chars.length - 1) / 2)

  return (
    <div
      aria-hidden
      className={cn(
        'text-error-code leading-display font-extrabold tracking-display select-none text-stroke',
        tone === 'dark' ? 'text-lime/28' : 'text-club/22',
      )}
    >
      {chars.map((char, index) =>
        index === accentIndex ? (
          <span className="text-lime text-stroke-none" key={index}>
            {char}
          </span>
        ) : (
          char
        ),
      )}
    </div>
  )
}

/**
 * Popisný řádek pod obsahem systémové stránky („Chyba 404 · Stránka
 * nenalezena"). Nese skutečné znění chyby, protože obří `ErrorCode` je pro
 * čtečky skrytý — proto to není `Eyebrow` (ten je uppercase mikro-label,
 * handoff tu má normální 12px semibold větu).
 */
export function ErrorMeta({
  children,
  className,
  tone = 'light',
}: {
  children: React.ReactNode
  className?: string
  tone?: 'light' | 'dark'
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className={cn('h-0.5 w-5.5 flex-none', tone === 'dark' ? 'bg-lime' : 'bg-club')} />
      <span
        className={cn(
          'text-xs font-medium',
          tone === 'dark' ? 'text-on-contrast-faint' : 'text-faint',
        )}
      >
        {children}
      </span>
    </div>
  )
}
