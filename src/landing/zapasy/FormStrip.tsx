import React from 'react'

import { cn } from '@/utilities/ui'

import { CardTitle } from '../components/Heading'
import { Eyebrow } from '../components/Kicker'
import { SectionShell } from '../components/SectionShell'
import type { Outcome, TeamForm } from '../types'

/** Barvy čtverečku podle výsledku (handoff: V lime tint, P cihlová, R šedá). */
const SQUARE_CLASS: Record<Outcome, string> = {
  win: 'bg-win text-win-ink',
  draw: 'bg-draw text-draw-ink',
  loss: 'bg-loss text-loss-ink',
}

/**
 * Forma HC Čestice — bílá karta s bilancí posledních pěti zápasů
 * a čtverečky V/R/P zleva od nejstaršího. Hover nad čtverečkem
 * odkryje tmavý tooltip (skóre, fáze, soupeř, datum); poslední dva
 * jsou kotvené doprava, aby nepřetekly z karty.
 *
 * Na mobilu jsou čtverečky a odsazení karty o stupeň menší: pět
 * čtverečků po 44 px s mezerou 8 px potřebuje 252 px, což se na 320px
 * displeji do karty nevejde a poslední čtvereček z ní vylezl.
 */
export function FormStrip({ form }: { form: TeamForm }) {
  return (
    <SectionShell spacing="content">
      <div className="border-line-soft flex flex-wrap items-center gap-x-[clamp(1.125rem,3vw,2.5rem)] gap-y-3 rounded-tile border bg-surface px-5 py-4.5 md:px-7 md:py-5">
        <div className="min-w-42.5">
          <Eyebrow>Forma HC Čestice</Eyebrow>
          <CardTitle className="mt-0.75" size="xs">
            Posledních {form.squares.length}{' '}
            {form.squares.length === 1 ? 'zápas' : form.squares.length <= 4 ? 'zápasy' : 'zápasů'}
          </CardTitle>
          <div className="text-faint mt-0.75 text-caption font-semibold">{form.summary}</div>
        </div>

        <div className="flex-1" />

        <div className="flex gap-1.5 md:gap-2">
          {form.squares.map((square, index) => {
            const alignRight = index >= form.squares.length - 2
            return (
              <div className="group relative" key={square.id}>
                <div
                  className={cn(
                    'grid size-10 place-items-center rounded-field text-lead font-extrabold md:size-11',
                    SQUARE_CLASS[square.outcome],
                  )}
                >
                  {square.letter}
                </div>

                <div
                  className={cn(
                    'bg-contrast pointer-events-none absolute bottom-[calc(100%+0.5rem)] z-5 translate-y-1 rounded-xl px-3.5 py-2 text-center whitespace-nowrap text-on-contrast opacity-0 shadow-tooltip transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100',
                    alignRight ? 'right-0' : 'left-1/2 -translate-x-1/2',
                  )}
                >
                  <div className="text-caption font-extrabold tabular-nums">
                    {square.score}
                    {square.suffix && ` ${square.suffix}`}{' '}
                    <span className="text-lime">· {square.stage}</span>
                  </div>
                  <div className="mt-0.5 text-eyebrow font-semibold text-white/60">
                    {square.title} · {square.dateLabel}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SectionShell>
  )
}
