import React from 'react'

import type { SiteConfig } from '@/payload-types'

import type { MatchDetail } from '../../types'
import { MatchHeader } from '../MatchHeader'

import { HeaderApp } from './HeaderApp'
import { HeaderArena } from './HeaderArena'
import { HeaderEditorial } from './HeaderEditorial'
import { HeaderSplit } from './HeaderSplit'

/** Hodnota pole `siteConfig.matchHeaderVariant` (Nastavení webu v adminu). */
export type MatchHeaderVariant = NonNullable<SiteConfig['matchHeaderVariant']>

/**
 * Hlavička detailu zápasu podle volby v adminu. `classic` je původní
 * `MatchHeader`; ostatní jsou varianty z katalogu `/vzory/hlavicka-zapasu`.
 *
 * Zrušený zápas má vždy `MatchHeader`: varianty umí zrušení jen štítkem,
 * kdežto původní hlavička ho má propracované (`CanceledHeader`). Neznámá
 * hodnota (např. starší záznam po odebrání varianty) spadne na `classic`.
 */
export function MatchHeaderByVariant({
  match,
  variant,
}: {
  match: MatchDetail
  variant: MatchHeaderVariant | null | undefined
}) {
  if (match.status === 'canceled') return <MatchHeader match={match} />
  switch (variant) {
    case 'arena':
      return <HeaderArena match={match} />
    case 'editorial':
      return <HeaderEditorial match={match} />
    case 'split':
      return <HeaderSplit match={match} />
    case 'app':
      return <HeaderApp match={match} />
    default:
      return <MatchHeader match={match} />
  }
}
