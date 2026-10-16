import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { CLUB_LOGO, CLUB_NAME } from '@/lib/club'
import { cn } from '@/lib/utils'

import { Eyebrow } from './Kicker'

/**
 * Bílá „známka" s logem a názvem klubu — v navigaci landing page
 * (přes hero fotku) i ve světlé navigaci detailu článku.
 */
export function LogoStamp({
  href = '/',
  bordered = false,
  tone = 'light',
}: {
  href?: string
  /** Světlá varianta má jemný rámeček, hover do klubové zelené. */
  bordered?: boolean
  /**
   * `glass` = průsvitná známka na tmavém podkladu (stránka 500). Rámeček si
   * nese sama — `bordered` na ni nemá vliv, bez okraje by na tmavém splynula.
   */
  tone?: 'light' | 'glass'
}) {
  const glass = tone === 'glass'

  return (
    <Link
      className={cn(
        'flex flex-none items-center gap-2.75 rounded-full py-1.75 pr-4.5 pl-2',
        glass
          ? 'border border-on-contrast-glass bg-on-contrast-wash text-on-contrast transition-colors hover:border-lime'
          : 'bg-surface',
        !glass && bordered && 'border border-line-mid transition-colors hover:border-club',
      )}
      href={href}
    >
      <Image alt={CLUB_NAME} height={34} src={CLUB_LOGO} width={34} />
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-tight">HC ČESTICE</span>
        <Eyebrow className="block" tone={glass ? 'white' : 'faint'}>
          TJ Sokol · VČHL
        </Eyebrow>
      </span>
    </Link>
  )
}
