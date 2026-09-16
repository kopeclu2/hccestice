import type { LandingTrainingsBlock } from '@/payload-types'

import React from 'react'

import { cn } from '@/utilities/ui'

import { Badge } from '../../components/Badge'
import { CardTitle, SectionTitle } from '../../components/Heading'
import { Highlight, Kicker } from '../../components/Kicker'
import { Numeral } from '../../components/Numeral'
import { Reveal } from '../../components/Reveal'
import { SectionShell, type SectionShellProps } from '../../components/SectionShell'
import { Watermark } from '../../components/Watermark'
import { TRAININGS } from '../../content'
import type { TrainingSlot, TrainingsContent } from '../../types'

import { parseTrainingSchedule } from './openingHours'

/** Prázdný text z CMS (`''`) se má chovat jako nevyplněný, ne jako obsah. */
const text = (value: string | null | undefined): string | null => value?.trim() || null

/** Tečku na konci nadpisu kreslí design zeleným akcentem, ne správce. */
const stripTrailingDot = (value: string): string => value.replace(/\s*\.\s*$/, '')

/** Block data → view-model (fallbacky na content.ts). */
function mapTrainings(block: LandingTrainingsBlock): TrainingsContent {
  const defaultVenue = text(block.defaultVenue) ?? TRAININGS.defaultVenue
  /* Skryté hodiny se filtrují **až po** rozhodnutí, jestli blok rozpis vůbec
   * má: jinak by se po skrytí všech řádků vrátily ukázkové hodiny z fallbacku. */
  const rows = block.rows?.length ? block.rows.filter((row) => !row.hiddenOnWeb) : null

  return {
    kicker: text(block.kicker) ?? TRAININGS.kicker,
    headline: block.headline ?? TRAININGS.headline,
    headlineHighlight: block.headlineHighlight ?? TRAININGS.headlineHighlight,
    headlineRest: stripTrailingDot(block.headlineRest ?? TRAININGS.headlineRest),
    perex: text(block.perex),
    rows: rows
      ? rows.map((row) => ({
          day: row.day,
          time: row.time,
          group: text(row.group),
          venue: text(row.venue) ?? defaultVenue,
          note: text(row.note),
          accent: Boolean(row.joint),
        }))
      : TRAININGS.rows.map((row) => ({ ...row, venue: defaultVenue, note: null })),
  }
}

export function TrainingsBlockComponent({
  block,
  spacing,
}: {
  block: LandingTrainingsBlock
  /** Homepage sekce jede na výchozí `landing` rytmus, `/treninky` na `content` hned pod hlavičkou. */
  spacing?: SectionShellProps['spacing']
}) {
  return <TrainingsView content={mapTrainings(block)} spacing={spacing} />
}

/**
 * Tréninky — štítek s nadpisem vlevo a pod ním doprava zarovnané karty
 * ledových hodin (zvýrazněná hodina je tmavá s lime štítkem).
 *
 * Karty jsou zalamovaný flex řádek zarovnaný na pravou hranu, ne mřížka ani
 * scrollovaný pás: šířku si berou z obsahu (minimum 240px), takže rozpis může
 * růst podle přidělených hodin a přebytek se přelije na další řádek.
 *
 * Sekce má jen to, co kreslí handoff: štítek, nadpis a karty. Volitelný perex
 * stojí **pod** nadpisem, ne vedle něj — vedle nadpisu se lámal do úzkého
 * sloupce a rozvaloval hlavičku sekce.
 */
function TrainingsView({
  content,
  spacing,
}: {
  content: TrainingsContent
  spacing?: SectionShellProps['spacing']
}) {
  // `/treninky` posílá `spacing="content"` (viz `TreninkyPage`) — na tý
  // stránce má hlavičku (`TreninkyHeader`) i vlastní watermark „LED" a
  // Kicker „Tréninky" nad blokem, takže je blok sám nevykresluje znova.
  const standalonePage = spacing === 'content'

  return (
    <SectionShell id="treninky" spacing={spacing}>
      <TrainingsJsonLd rows={content.rows} />
      {!standalonePage && (
        <Watermark className="text-club/8 bottom-0 left-40 text-watermark-lg tracking-[-0.06em]">
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
          <p className="text-dim mt-4 max-w-130 leading-relaxed text-pretty">{content.perex}</p>
        )}
      </Reveal>

      <Reveal className="flex flex-wrap justify-end gap-4" delay={0.1}>
        {standalonePage && (
          <>
            <InfoCard title="Co si vzít">
              Na první trénink nepotřebuješ vlastní výstroj — na zkoušku ji půjčíme. Zbytek
              doučíme přímo na ledě.
            </InfoCard>
            <InfoCard title="Kde to je">
              Trénujeme na zimním stadionu v Rychnově nad Kněžnou — domácí zápasy hrajeme tam
              stejně jako tréninky.
            </InfoCard>
          </>
        )}
        {content.rows.map((row, index) => (
          <TrainingCard key={`${row.day}-${row.time}-${index}`} slot={row} />
        ))}
      </Reveal>
    </SectionShell>
  )
}

/**
 * Praktická karta vedle rozpisu na `/treninky` — vyplňuje plochu, kterou
 * dřív zabíral dekorativní `Puck`, tentokrát rovnou užitečným obsahem.
 */
function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="border-line-soft w-full min-w-0 rounded-thumb border bg-surface px-5 py-5 min-[33rem]:w-auto min-[33rem]:min-w-60 min-[33rem]:max-w-75 min-[33rem]:px-6">
      <CardTitle as="h3" size="sm">
        {title}
      </CardTitle>
      <p className="text-dim mt-2 text-caption leading-relaxed">{children}</p>
    </article>
  )
}

/**
 * `OpeningHoursSpecification` seskupené podle místa — jeden `SportsActivityLocation`
 * na venue s rozpoznanými hodinami. Řádky, které se nepodařilo naparsovat
 * (viz `parseTrainingSchedule`), do JSON-LD nejdou; když nezbyde nic
 * rozpoznaného, nic se nevykreslí.
 */
function TrainingsJsonLd({ rows }: { rows: TrainingSlot[] }) {
  const parsed = parseTrainingSchedule(rows)
  if (parsed.length === 0) return null

  const byVenue = new Map<string, typeof parsed>()
  for (const slot of parsed) {
    const key = slot.venue ?? 'HC Čestice'
    byVenue.set(key, [...(byVenue.get(key) ?? []), slot])
  }

  const jsonLd = Array.from(byVenue.entries()).map(([venue, slots]) => ({
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: venue,
    openingHoursSpecification: slots.map((slot) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: slot.dayOfWeek,
      opens: slot.opens,
      closes: slot.closes,
      ...(slot.group ? { description: slot.group } : {}),
    })),
  }))

  return (
    <>
      {jsonLd.map((entry, index) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
          key={index}
          type="application/ld+json"
        />
      ))}
    </>
  )
}

/** Karta jedné ledové hodiny — den se štítkem, čas a místo. */
function TrainingCard({ slot }: { slot: TrainingSlot }) {
  return (
    <article
      className={cn(
        /* Karta přes celou šířku, dokud se na řádek nevejdou dvě: s pevným
           `min-w-60` (240px) zůstane na telefonu jedna karta na řádku a
           `justify-end` ji odtlačí doprava, takže vlevo je 100+px prázdna a
           rozpis vypadá jako chyba sazby.
           Zlom je 33rem (528px) = 2 × 240px karta + 16px mezera + odsazení
           sekce, ne `sm` (640px) — na 600px se dvě karty vedle sebe vejdou
           v pohodě a stohovat je tam by byl krok zpátky.
           `min-w-0` je pojistka proti přetečení na 320px, kde je 240px + padding
           na hraně. */
        'w-full min-w-0 rounded-thumb px-5 py-5 min-[33rem]:w-auto min-[33rem]:min-w-60 min-[33rem]:px-6',
        slot.accent ? 'bg-contrast text-on-contrast' : 'border-line-soft border bg-surface',
      )}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <CardTitle as="h3" size="sm">
          {slot.day}
        </CardTitle>
        {slot.group && (
          <Badge size="xs" variant={slot.accent ? 'lime' : 'chip'}>
            {slot.group}
          </Badge>
        )}
      </div>

      <Numeral as="div" className="mt-3" size="sm">
        {slot.time}
      </Numeral>

      {slot.venue && (
        <div
          className={cn(
            'mt-1 text-caption font-semibold',
            slot.accent ? 'text-faint-dark' : 'text-faint',
          )}
        >
          {slot.venue}
        </div>
      )}
      {slot.note && (
        <div className={cn('mt-1 text-caption', slot.accent ? 'text-white/55' : 'text-dim')}>
          {slot.note}
        </div>
      )}
    </article>
  )
}
