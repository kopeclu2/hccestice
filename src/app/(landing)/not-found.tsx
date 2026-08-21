import type { Metadata } from 'next'

import React from 'react'

import { ErrorCode, ErrorMeta } from '@/landing/components/ErrorCode'
import { PageTitle } from '@/landing/components/Heading'
import { Highlight } from '@/landing/components/Kicker'
import { PillLink } from '@/landing/components/PillLink'
import { PuckTrailArc } from '@/landing/components/PuckTrail'
import { SectionShell } from '@/landing/components/SectionShell'
import { SubpageShell } from '@/landing/components/SubpageShell'

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
      <SectionShell className="pb-16" spacing="header">
        {/* Obal kvůli absolutně umístěné trajektorii — ta musí lícovat
            s dolní hranou kódu, ne s hranou sekce. */}
        <div className="relative">
          <ErrorCode>404</ErrorCode>
          <PuckTrailArc className="absolute right-0 bottom-2.5" />
        </div>

        <PageTitle className="mt-6.5 max-w-190" size="system">
          Puk zajel <Highlight>mimo hřiště</Highlight>
        </PageTitle>

        <p className="text-ink-soft mt-4.5 max-w-130 text-lead leading-[1.55] text-pretty">
          Stránka, kterou hledáte, neexistuje nebo byla přesunuta. Zkuste to z domovské stránky —
          tam se hraje.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          <PillLink href="/" size="lg" variant="dark" withArrow>
            Zpět na hlavní stránku
          </PillLink>
          <PillLink href="/aktuality" size="md" variant="outline">
            Aktuality
          </PillLink>
          <PillLink href="/zapasy" size="md" variant="outline">
            Rozlosování
          </PillLink>
        </div>

        <ErrorMeta className="mt-14">Chyba 404 · Stránka nenalezena</ErrorMeta>
      </SectionShell>
    </SubpageShell>
  )
}

export const metadata: Metadata = {
  title: 'Stránka nenalezena | HC Čestice',
  robots: { index: false, follow: true },
}
