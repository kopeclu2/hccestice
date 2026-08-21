import Image from 'next/image'
import React from 'react'

import type { MaintenanceState } from '../data/maintenance'
import type { SiteLinks } from '../types'

import { Badge } from './Badge'
import { ErrorMeta } from './ErrorCode'
import { PageTitle } from './Heading'
import { PillLink } from './PillLink'
import { PuckTrailLine } from './PuckTrail'

/**
 * Údržbová stránka podle handoffu „HC Cestice Systemove Stranky".
 *
 * Vědomě **bez navigace a patičky**: když je web v údržbě, nemá smysl na něj
 * nabízet odkazy. Cesty dál vedou mimo web — na sítě a na e-mail.
 *
 * Vykresluje ji root layout místo obsahu (pro nepřihlášené) a routa `/udrzba`,
 * aby si ji správce mohl otevřít i bez zapnutí režimu.
 */
export function MaintenanceScreen({
  maintenance,
  site,
}: {
  maintenance: MaintenanceState
  site: SiteLinks
}) {
  return (
    <main className="text-ink relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-5 py-12">
      <div
        aria-hidden
        className="hatch pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_70%_at_50%_45%,transparent_30%,#000)]"
      />
      {/* Monogram klubu přes celou obrazovku. Nejde o `Watermark` — ten je
          `absolute` v rámci sekce, tady se centruje k viewportu. */}
      <div
        aria-hidden
        className="text-stroke pointer-events-none absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-club/9 text-[clamp(15rem,34vw,32.5rem)] leading-none font-extrabold tracking-[-0.06em] whitespace-nowrap select-none md:block"
      >
        HCČ
      </div>

      <div className="relative z-1 flex max-w-155 flex-col items-center text-center">
        <Image alt="HC Čestice" height={76} src="/logo-cestice.png" width={76} />

        <Badge caps className="mt-6.5" size="md" variant="lime">
          Plánovaná údržba
        </Badge>

        <PageTitle className="mt-5" size="system">
          <HeadlineWithAccent>{maintenance.headline}</HeadlineWithAccent>
        </PageTitle>

        <p className="text-ink-soft mt-4.5 max-w-115 text-lead leading-[1.55] text-pretty">
          {maintenance.perex}
        </p>

        <PuckTrailLine className="mt-8.5" />

        <div className="mt-7.5 flex flex-wrap items-center justify-center gap-2.5">
          {site.facebook && (
            <PillLink href={site.facebook} size="sm" variant="outline">
              Facebook
            </PillLink>
          )}
          {site.instagram && (
            <PillLink href={site.instagram} size="sm" variant="outline">
              Instagram
            </PillLink>
          )}
          <PillLink href={`mailto:${site.email}`} size="sm" variant="dark">
            {site.email}
          </PillLink>
        </div>

        <ErrorMeta className="mt-12">HC Čestice · TJ Sokol · VČHL</ErrorMeta>
      </div>
    </main>
  )
}

/**
 * Poslední dvě slova nadpisu v klubové zelené (handoff: „Rolba právě
 * **upravuje led**"). Nadpis je editovatelný v adminu, takže se zvýraznění
 * nedá zapsat jako JSX — stejný trik používá `SectionHead` a blok Sponzoři.
 */
function HeadlineWithAccent({ children }: { children: string }) {
  const words = children.trim().split(/\s+/)
  if (words.length < 3) return <>{children}</>

  const head = words.slice(0, -2).join(' ')
  const accent = words.slice(-2).join(' ')

  return (
    <>
      {head} <span className="text-club">{accent}</span>
    </>
  )
}
