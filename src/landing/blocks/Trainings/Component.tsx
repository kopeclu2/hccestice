import type { LandingTrainingsBlock } from '@/payload-types'

import React from 'react'

import { cn } from '@/utilities/ui'

import { Badge } from '../../components/Badge'
import { Puck } from '../../components/Decorations'
import { CardTitle, SectionTitle } from '../../components/Heading'
import { Highlight, Kicker } from '../../components/Kicker'
import { Numeral } from '../../components/Numeral'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { TRAININGS } from '../../content'
import type { TrainingSlot, TrainingsContent } from '../../types'

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

export function TrainingsBlockComponent({ block }: { block: LandingTrainingsBlock }) {
  return <TrainingsView content={mapTrainings(block)} />
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
function TrainingsView({ content }: { content: TrainingsContent }) {
  return (
    <SectionShell id="treninky">
      <Puck className="-left-11 top-107 -rotate-8" />

      <Reveal className="mb-10">
        {content.kicker && <Kicker>{content.kicker}</Kicker>}
        <SectionTitle className="mt-3.5 text-pretty" size="md">
          {content.headline} <Highlight>{content.headlineHighlight}</Highlight>{' '}
          {content.headlineRest}
          <span className="text-club">.</span>
        </SectionTitle>
        {content.perex && (
          <p className="text-dim mt-4 max-w-130 leading-relaxed text-pretty">{content.perex}</p>
        )}
      </Reveal>

      <Reveal className="flex flex-wrap justify-end gap-4" delay={0.1}>
        {content.rows.map((row, index) => (
          <TrainingCard key={`${row.day}-${row.time}-${index}`} slot={row} />
        ))}
      </Reveal>
    </SectionShell>
  )
}

/** Karta jedné ledové hodiny — den se štítkem, čas a místo. */
function TrainingCard({ slot }: { slot: TrainingSlot }) {
  return (
    <article
      className={cn(
        'min-w-60 rounded-thumb px-6 py-5',
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
