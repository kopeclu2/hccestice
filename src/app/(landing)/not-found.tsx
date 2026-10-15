import type { Metadata } from 'next'
import React from 'react'

import { SubpageShell } from '@/landing/layout/SubpageShell'
import { ErrorCode, ErrorMeta } from '@/landing/ui/ErrorCode'
import { PageTitle } from '@/landing/ui/Heading'
import { Highlight } from '@/landing/ui/Kicker'
import { PillLink } from '@/landing/ui/PillLink'
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

        <p className="mt-4.5 max-w-130 text-lg leading-[1.55] text-pretty text-ink-soft">
          Stránka, kterou hledáte, neexistuje nebo byla přesunuta. Zkuste to z domovské stránky —
          tam se hraje.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          <PillLink href="/" size="lg" variant="dark" withArrow>
            Zpět na hlavní stránku
          </PillLink>
          <PillLink href={routes.list.posts} size="md" variant="outline">
            Aktuality
          </PillLink>
          <PillLink href={routes.list.matches} size="md" variant="outline">
            Rozlosování
          </PillLink>
        </div>

        <ErrorMeta className="mt-14">Chyba 404 · Stránka nenalezena</ErrorMeta>
      </SectionShell>
    </SubpageShell>
  )
}

export const metadata: Metadata = {
  title: brandTitle('Stránka nenalezena'),
  robots: { index: false, follow: true },
}
