import React from 'react'

import { cn } from '@/utilities/ui'

import { Badge } from '../components/Badge'
import { countLabel } from '../data/format'
import { Eyebrow } from '../components/Kicker'
import type { ArticleGoal, MatchGoalGroup } from '../types'

import { MatchPanel } from './MatchPanel'

/** Štítek speciální situace u branky; zkratka dostane celé slovo v `title` a `aria-label`. */
const SPECIAL: Record<NonNullable<ArticleGoal['special']>, { label: string; title: string }> = {
  pp: { label: 'PP', title: 'Přesilovka' },
  os: { label: 'OS', title: 'Oslabení' },
  sn: { label: 'SN', title: 'Rozhodující nájezd' },
}

/**
 * Souhrn branek po třetinách. Není to časová osa: mezititulky třetin jsou
 * jediné členění, každá branka je jeden řádek „čas · střelec (asistence) ·
 * stav". Naše branky jsou plným písmem s lime tečkou, soupeřovy tlumené
 * s prázdným kroužkem — barva k tomu nestačí, proto i slovo pro čtečku.
 *
 * Stav po brance je v pořadí domácí : hosté, tedy stejně jako skóre v hlavičce.
 */
export function GoalsSummary({ groups }: { groups: MatchGoalGroup[] }) {
  if (groups.length === 0) return null
  const count = groups.reduce((sum, group) => sum + group.goals.length, 0)

  return (
    <MatchPanel
      aside={
        <Badge size="sm" variant="chip">
          {countLabel(count, ['branka', 'branky', 'branek'])}
        </Badge>
      }
      id="zapas-branky"
      title="Branky"
    >
      <div className="mt-5 space-y-6 md:space-y-7">
        {groups.map((group) => (
          <div key={group.label}>
            <h3>
              <Eyebrow tone="club">{group.label}</Eyebrow>
            </h3>
            <ol className="divide-line-soft mt-1.5 divide-y">
              {group.goals.map((goal, index) => (
                <GoalRow goal={goal} key={`${goal.time}-${index}`} />
              ))}
            </ol>
          </div>
        ))}
      </div>
    </MatchPanel>
  )
}

function GoalRow({ goal }: { goal: ArticleGoal }) {
  const special = goal.special ? SPECIAL[goal.special] : null

  return (
    <li className="grid grid-cols-[2.75rem_1fr_auto] items-baseline gap-x-3 py-3 md:grid-cols-[3.25rem_1fr_auto] md:gap-x-4">
      <span className="text-faint text-caption font-bold tabular-nums">{goal.time}</span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            aria-hidden
            className={cn(
              'size-2 flex-none rounded-full',
              goal.ours ? 'bg-lime' : 'border-faint border',
            )}
          />
          <span className="sr-only">{goal.ours ? 'Gól Čestic: ' : 'Gól soupeře: '}</span>
          <span
            className={cn(
              'text-body font-extrabold [overflow-wrap:anywhere]',
              !goal.ours && 'text-faint font-bold',
            )}
          >
            {goal.scorer}
          </span>
          {special && (
            <Badge
              className="px-2 py-0.5"
              size="xs"
              title={special.title}
              variant={goal.special === 'sn' ? 'outline' : 'lime'}
            >
              {/* Zkratka je pro oko, celé slovo pro čtečku — `title` čtečky
                  většinou nečtou a na dotykovém displeji není vidět vůbec. */}
              <span aria-hidden>{special.label}</span>
              <span className="sr-only">{special.title}</span>
            </Badge>
          )}
        </div>
        {goal.assists.length > 0 && (
          <div className="text-faint mt-0.5 pl-4 text-caption font-semibold text-pretty [overflow-wrap:anywhere]">
            <span className="sr-only">Asistence: </span>
            {goal.assists.join(', ')}
          </div>
        )}
      </div>

      {goal.score && (
        <span className="text-meta font-extrabold tabular-nums">
          <span className="sr-only">Stav </span>
          {goal.score}
        </span>
      )}
    </li>
  )
}
