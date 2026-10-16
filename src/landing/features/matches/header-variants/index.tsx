import React from 'react'

import { MatchHeader } from '@/landing/features/matches/components/MatchHeader'
import type { MatchDetail } from '@/landing/features/matches/types'
import type { SiteConfig } from '@/payload-types'

import { HeaderApp } from './HeaderApp'
import { HeaderArena } from './HeaderArena'
import { HeaderEditorial } from './HeaderEditorial'
import { HeaderSplit } from './HeaderSplit'
import { isVariantMatch } from './shared'

/** Hodnota pole `siteConfig.matchHeaderVariant` (Nastavení webu v adminu). */
export type MatchHeaderVariant = NonNullable<SiteConfig['matchHeaderVariant']>

/**
 * Hlavička detailu zápasu podle volby v adminu. `classic` je původní
 * `MatchHeader`; ostatní jsou varianty z katalogu `/vzory/hlavicka-zapasu`.
 *
 * Zrušený zápas má vždy `MatchHeader` (`CanceledHeader`), varianty ho vůbec
 * neumí (viz `VariantMatch`). Neznámá hodnota (např. starší záznam po odebrání varianty) spadne na `classic`.
 */
export function MatchHeaderByVariant({
  match,
  variant,
}: {
  match: MatchDetail
  variant: MatchHeaderVariant | null | undefined
}) {
  if (!isVariantMatch(match)) return <MatchHeader match={match} />
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
