import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { TRAININGS } from '@/landing/content'
import { TrainingsTable } from '@/landing/features/trainings/components/TrainingsTable'
import { fetchTrainingSessions } from '@/landing/features/trainings/data'
import type { TrainingsContent } from '@/landing/features/trainings/types'
import type { TrainingSession } from '@/landing/features/trainings/view/trainingsTable'
import { CardTitle, SectionTitle } from '@/landing/ui/Heading'
import { Highlight, Kicker } from '@/landing/ui/Kicker'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell, type SectionShellProps } from '@/landing/ui/SectionShell'
import { Watermark } from '@/landing/ui/Watermark'
import { routes } from '@/lib/routes'
import type { LandingTrainingsBlock } from '@/payload-types'

/** Kolik nejbližších termínů ukáže homepage; celý rozpis je na `/treninky`. */
const HOME_SESSIONS = 6

/** Prázdný text z CMS (`''`) se má chovat jako nevyplněný, ne jako obsah. */
const text = (value: string | null | undefined): string | null => value?.trim() || null

/** Tečku na konci nadpisu kreslí design zeleným akcentem, ne správce. */
const stripTrailingDot = (value: string): string => value.replace(/\s*\.\s*$/, '')

/** Block data → texty sekce (fallbacky na content.ts). Termíny nese kolekce `trainings`. */
function mapTrainings(block: LandingTrainingsBlock): TrainingsContent {
  return {
    kicker: text(block.kicker) ?? TRAININGS.kicker,
    headline: block.headline ?? TRAININGS.headline,
    headlineHighlight: block.headlineHighlight ?? TRAININGS.headlineHighlight,
    headlineRest: stripTrailingDot(block.headlineRest ?? TRAININGS.headlineRest),
    perex: text(block.perex),
  }
}

export async function TrainingsBlockComponent({
  block,
  spacing,
}: {
  block: LandingTrainingsBlock
  /** Homepage sekce jede na výchozí `landing` rytmus, `/treninky` na `content` hned pod hlavičkou. */
  spacing?: SectionShellProps['spacing']
}) {
  const sessions = await fetchTrainingSessions()
  const withVenue = sessions.map((session) => ({
    ...session,
    venue: session.venue ?? TRAININGS.defaultVenue,
  }))

  return <TrainingsView content={mapTrainings(block)} sessions={withVenue} spacing={spacing} />
}

/**
 * Tréninky — štítek s nadpisem a pod ním tabulka nadcházejících termínů
 * (`TrainingsTable`). Termíny jsou dokumenty kolekce `trainings`, den
 * v týdnu se počítá z data.
 *
 * Rozpis **není** ve strukturovaných datech (JSON-LD): `Event` bez
 * `startDate` hlásí chybu a termíny jsou volný text s poznámkami.
 *
 * Na homepage jen `HOME_SESSIONS` nejbližších termínů a tlačítko na
 * `/treninky`, kde je rozpis celý (řazení a hranici od dneška řeší fetcher).
 *
 * Volitelný perex stojí **pod** nadpisem, ne vedle něj — vedle nadpisu se
 * lámal do úzkého sloupce a rozvaloval hlavičku sekce.
 */
function TrainingsView({
  content,
  sessions,
  spacing,
}: {
  content: TrainingsContent
  sessions: TrainingSession[]
  spacing?: SectionShellProps['spacing']
}) {
  // `/treninky` posílá `spacing="content"` (viz `TreninkyPage`) — na tý
  // stránce má hlavičku (`TrainingsHeader`) i vlastní watermark „LED" a
  // Kicker „Tréninky" nad blokem, takže je blok sám nevykresluje znova.
  const standalonePage = spacing === 'content'

  return (
    <SectionShell id="treninky" spacing={spacing}>
      {!standalonePage && (
        <Watermark className="bottom-0 left-40 text-watermark-lg tracking-display text-club/8">
          LED
        </Watermark>
      )}

      <Reveal className="mb-10">
        {!standalonePage && content.kicker && <Kicker>{content.kicker}</Kicker>}
        <SectionTitle className="mt-3.5 text-pretty" size="md">
          {content.headline}{' '}
          <Highlight dot={!content.headlineRest}>{content.headlineHighlight}</Highlight>{' '}
          {content.headlineRest}
          {content.headlineRest && <span className="text-club">.</span>}
        </SectionTitle>
        {content.perex && (
          <p className="mt-4 max-w-130 leading-relaxed text-pretty text-dim">{content.perex}</p>
        )}
      </Reveal>

      {standalonePage && (
        <Reveal className="mb-4 flex flex-wrap justify-end gap-4" delay={0.1}>
          <InfoCard title="Co si vzít">
            Na první trénink nepotřebuješ vlastní výstroj — na zkoušku ji půjčíme. Zbytek doučíme
            přímo na ledě.
          </InfoCard>
          <InfoCard title="Kde to je">
            Trénujeme na zimním stadionu v Rychnově nad Kněžnou — domácí zápasy hrajeme tam stejně
            jako tréninky.
          </InfoCard>
        </Reveal>
      )}
      <Reveal delay={0.1}>
        <TrainingsTable sessions={standalonePage ? sessions : sessions.slice(0, HOME_SESSIONS)} />
      </Reveal>

      {!standalonePage && sessions.length > 0 && (
        <Reveal className="mt-6 flex justify-center md:justify-end" delay={0.15}>
          <Button asChild size="md" variant="dark" withArrow>
            <Link href={routes.trainings}>Celý rozpis tréninků</Link>
          </Button>
        </Reveal>
      )}
    </SectionShell>
  )
}

/**
 * Praktická karta vedle rozpisu na `/treninky` — vyplňuje plochu, kterou
 * dřív zabíral dekorativní `Puck`, tentokrát rovnou užitečným obsahem.
 */
function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="w-full min-w-0 rounded-thumb border border-line-soft bg-surface px-5 py-5 xs:w-auto xs:max-w-75 xs:min-w-60 xs:px-6">
      <CardTitle as="h3" size="sm">
        {title}
      </CardTitle>
      <p className="mt-2 text-xs leading-relaxed text-dim">{children}</p>
    </article>
  )
}
