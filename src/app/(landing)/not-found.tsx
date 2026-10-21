import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { ErrorCode, ErrorMeta } from '@/landing/ui/ErrorCode'
import { PageTitle } from '@/landing/ui/Heading'
import { Highlight } from '@/landing/ui/Kicker'
import { PuckTrailArc } from '@/landing/ui/PuckTrail'
import { SectionShell } from '@/landing/ui/SectionShell'
import { brandTitle } from '@/lib/brandTitle'
import { routes } from '@/lib/routes'

/**
 * 404 podle handoffu „HC Cestice Systemove Stranky" — obří obrysový kód
 * s lime nulou, trajektorie puku mimo hřiště, tři cesty dál.
 *
 * Kotví se na `SubpageShell`, takže má stejnou navigaci i patičku jako zbytek
 * webu; návštěvník tak z 404 pokračuje dál, místo aby skončil ve slepé uličce.
 * To je důležité kvůli starým odkazům z eStránek, které se nepodaří přesměrovat.
 * Handoff patičku nekreslí, ale ani ji nezakazuje — nav v jeho 404 obrazovce
 * je totožná s `ArticleNav`.
 *
 * Drobečky tu záměrně nejsou: cesta k neexistující stránce nemá co ukázat.
 */
export default function NotFound() {
  return (
    <SubpageShell>
      <SectionShell className="pb-8 md:pb-12 lg:pb-16" spacing="header">
        {/* Obal kvůli absolutně umístěné trajektorii — ta musí lícovat
            s dolní hranou kódu, ne s hranou sekce. */}
        <div className="relative">
          <ErrorCode>404</ErrorCode>
          <PuckTrailArc className="absolute right-0 bottom-2.5" />
        </div>

        <PageTitle className="mt-6.5 max-w-190" size="system">
          Puk zajel <Highlight>mimo hřiště</Highlight>
        </PageTitle>

        <p className="mt-4.5 max-w-130 text-lg leading-copy text-pretty text-ink-soft">
          Stránka, kterou hledáte, neexistuje nebo byla přesunuta. Zkuste to z domovské stránky —
          tam se hraje.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          <Button asChild size="lg" variant="dark" withArrow>
            <Link href="/">Zpět na hlavní stránku</Link>
          </Button>
          <Button asChild size="md" variant="outline">
            <Link href={routes.list.posts}>Aktuality</Link>
          </Button>
          <Button asChild size="md" variant="outline">
            <Link href={routes.list.matches}>Rozlosování</Link>
          </Button>
        </div>

        <ErrorMeta className="mt-14">Chyba 404 · Stránka nenalezena</ErrorMeta>
      </SectionShell>
    </SubpageShell>
  )
}

/**
 * `robots` tu záměrně **není**: u odpovědi 404 Next sám vloží
 * `<meta name="robots" content="noindex">` (viz `not-found.md`), takže vlastní
 * `robots: { index: false, follow: true }` dávalo druhý tag `noindex, follow`.
 * Dva robots meta tagy crawler vyhodnotí jako nejpřísnější kombinaci a
 * v auditu to byl nález; odkazy z 404 se sledují i bez `follow`, je to výchozí.
 */
export const metadata: Metadata = {
  title: brandTitle('Stránka nenalezena'),
  description:
    'Stránka, kterou hledáte, neexistuje nebo byla přesunuta. Pokračujte na hlavní stránku HC Čestice, do aktualit nebo na rozlosování.',
}
