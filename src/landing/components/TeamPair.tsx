import React from 'react'

import { cn } from '@/utilities/ui'

/** Oddělovač ve `matchTitle` („HC Čestice × HC Zdar"). */
const SEPARATOR = ' × '

/**
 * Rozdělí titulek zápasu na domácí a hosty. Titulky skládá jediný helper
 * (`matchTitle`), takže oddělovač je spolehlivý; titulek bez něj (ruční
 * text, „Soupeř") vrací null a volající ho vykreslí tak, jak je.
 */
export const splitMatchTitle = (title: string): { home: string; away: string } | null => {
  const index = title.indexOf(SEPARATOR)
  if (index <= 0) return null
  return { home: title.slice(0, index), away: title.slice(index + SEPARATOR.length) }
}

/**
 * Inline-block drží název týmu jako celek: řádek se zlomí v místě „×",
 * ne uvnitř „SK Divočáci | Žamberk" nebo za osiřelým „HC". Když je jediný
 * název širší než řádek (320 px, „Závodní hokejová Pardubice"), inline-block
 * se zúží na šířku řádku a zalomí se uvnitř — nepřeteče.
 *
 * `text-decoration` se do inline-blocku nedědí, takže podtržení odkazu na
 * hover (`NextMatchPanel`) by se bez `inherit` u názvů ztratilo.
 */
const TEAM = 'inline-block max-w-full [text-decoration:inherit]'

/**
 * Dvojice týmů „domácí × hosté" s lámáním v místě oddělovače.
 *
 * - `inline` — na jednom řádku, zalomí se za „×" (nadpisy panelů).
 * - `stack` — každý tým na vlastním řádku bez „×" (řádky výpisů, jako ve
 *   sportovních aplikacích). Na všech šířkách, ne jen na mobilu (rozhodnutí
 *   uživatele 15. 10. 2026): názvy mají různou délku, takže dvojice za sebou
 *   nelícovala a znak hostů pokaždé stál jinde. Oddělovač zůstává pro čtečku
 *   (`sr-only`), takže název odkazu se nemění: „HC Čestice × HC Zdar".
 */
export function TeamPair({
  home,
  away,
  layout = 'inline',
}: {
  home: React.ReactNode
  away: React.ReactNode
  layout?: 'inline' | 'stack'
}) {
  const stack = layout === 'stack'
  return (
    <>
      {/* „×“ je uvnitř bloku domácích: kolem inline-blocku smí prohlížeč
          zalomit vždy (NBSP ho nepřilepí), takže by řádek s hosty jinak
          začínal mezerou a oddělovačem. */}
      <span className={cn(TEAM, stack && 'block')}>
        {home}
        <span className={cn(stack && 'sr-only')}>{'\u00a0×'}</span>
      </span>{' '}
      <span className={cn(TEAM, stack && 'block')}>{away}</span>
    </>
  )
}
