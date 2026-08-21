import React from 'react'

import type { Page } from '@/payload-types'

import RichText from '@/components/RichText'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richText?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richText }) => {
  /*
   * Bez obsahu se nevykreslí nic. Prázdný `richText` (stránka `/produkty-merch`
   * má hero `lowImpact` bez textu) jinak nechal pod navigací kontejner nulové
   * výšky s `mt-16`, tedy 64px mrtvého pásu — na tabletu spolu s odsazením
   * prvního bloku ~180px prázdna nad první kartou.
   */
  if (!children && !richText) return null

  return (
    <div className="container mt-16">
      <div className="max-w-[48rem]">
        {children || (richText && <RichText data={richText} enableGutter={false} />)}
      </div>
    </div>
  )
}
