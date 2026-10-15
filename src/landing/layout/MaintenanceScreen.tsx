import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import type { MaintenanceState } from '@/landing/data/maintenance'
import type { SiteLinks } from '@/landing/types'
import { Badge } from '@/landing/ui/Badge'
import { ErrorMeta } from '@/landing/ui/ErrorCode'
import { PageTitle } from '@/landing/ui/Heading'
import { Highlight } from '@/landing/ui/Kicker'
import { PuckTrailLine } from '@/landing/ui/PuckTrail'
import { CLUB_LOGO, CLUB_NAME } from '@/lib/club'

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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-5 py-12 text-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hatch [mask-image:radial-gradient(70%_70%_at_50%_45%,transparent_30%,#000)]"
      />
      {/* Monogram klubu přes celou obrazovku. Nejde o `Watermark` — ten je
          `absolute` v rámci sekce, tady se centruje k viewportu.

          Zapíná se až od `lg`, ne od `md` — ze stejného důvodu, kvůli kterému
          hranici posunul `Watermark`: na 768px displeji má `34vw` 261px, takže
          monogram prořezával perex i trajektorii puku. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-watermark-maintenance leading-none font-extrabold tracking-display whitespace-nowrap text-club/9 select-none text-stroke lg:block"
      >
        HCČ
      </div>

      <div className="relative z-1 flex max-w-155 flex-col items-center text-center">
        {/* `rounded-full`: `/logo-cestice.png` má neprůhledné bílé pozadí, takže
            by na paper podkladu vykreslilo bílý blok 76×76 kolem kruhového
            loga. Kruh čtverec vyplňuje celý, odřezání rohů tedy nic neubere. */}
        <Image alt={CLUB_NAME} className="rounded-full" height={76} src={CLUB_LOGO} width={76} />

        <Badge caps className="mt-6.5" size="md" variant="lime">
          Plánovaná údržba
        </Badge>

        <PageTitle className="mt-5" size="system">
          <HeadlineWithAccent>{maintenance.headline}</HeadlineWithAccent>
        </PageTitle>

        <p className="mt-4.5 max-w-115 text-lg leading-copy text-pretty text-ink-soft">
          {maintenance.perex}
        </p>

        <PuckTrailLine className="mt-8.5" />

        <div className="mt-7.5 flex flex-wrap items-center justify-center gap-2.5">
          {site.facebook && (
            <Button asChild size="sm" variant="outline">
              <Link href={site.facebook}>Facebook</Link>
            </Button>
          )}
          {site.instagram && (
            <Button asChild size="sm" variant="outline">
              <Link href={site.instagram}>Instagram</Link>
            </Button>
          )}
          <Button asChild size="sm" variant="dark">
            <Link href={`mailto:${site.email}`}>{site.email}</Link>
          </Button>
        </div>

        <ErrorMeta className="mt-12">{CLUB_NAME} · TJ Sokol · VČHL</ErrorMeta>
      </div>
    </main>
  )
}

/**
 * Poslední dvě slova nadpisu zvýrazněná lime pruhem (handoff: „Rolba právě
 * **upravuje led**"). Nadpis je editovatelný v adminu, takže se zvýraznění
 * nedá zapsat jako JSX — stejný trik používá `SectionHead` a blok Sponzoři.
 *
 * `Highlight`, ne `text-club`: světlé systémové stránky (404 a údržba) mají
 * mít jeden způsob zvýraznění. `text-lime` na 500 je jiný jen proto, že tam
 * je nadpis na tmavém podkladu, kde lime pruh nefunguje.
 */
function HeadlineWithAccent({ children }: { children: string }) {
  const words = children.trim().split(/\s+/)
  if (words.length < 3) return <>{children}</>

  const head = words.slice(0, -2).join(' ')
  const accent = words.slice(-2).join(' ')

  return (
    <>
      {head} <Highlight>{accent}</Highlight>
    </>
  )
}
