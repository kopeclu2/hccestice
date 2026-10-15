import { describe, expect, it } from 'vitest'

import type { MatchTimelineEvent, MatchTimelinePeriod } from '@/landing/features/matches/types'
import { buildMatchSummary } from '@/landing/features/matches/view/matchSummary'

const ours = (
  time: string,
  scorer: string,
  assists: string[] = [],
  special: 'pp' | 'os' | 'sn' | null = null,
): MatchTimelineEvent => ({
  type: 'goal',
  ours: true,
  time,
  score: '1:0',
  scorer,
  assists,
  special,
})

const theirs = (time: string): MatchTimelineEvent => ({
  type: 'goal',
  ours: false,
  time,
  score: '1:1',
})

const penalty = (time: string, player: string, minutes: number | null): MatchTimelineEvent => ({
  type: 'penalty',
  time,
  player,
  minutes,
  kind: null,
  reason: null,
})

const period = (events: MatchTimelineEvent[], label = '1. třetina'): MatchTimelinePeriod => ({
  label,
  score: null,
  events,
})

describe('buildMatchSummary', () => {
  it('sčítá góly a asistence do kanadských bodů a řadí podle bodů, gólů a jména', () => {
    const summary = buildMatchSummary([
      period([
        ours('5:00', 'Sajdl', ['Vacek', 'Kopecký']),
        theirs('6:00'),
        ours('7:00', 'Vacek', ['Sajdl']),
      ]),
      period([ours('25:00', 'Čermák', ['Vacek'])], '2. třetina'),
    ])
    expect(summary.points).toEqual([
      { name: 'Vacek', goals: 1, assists: 2, points: 3 },
      { name: 'Sajdl', goals: 1, assists: 1, points: 2 },
      { name: 'Čermák', goals: 1, assists: 0, points: 1 },
      { name: 'Kopecký', goals: 0, assists: 1, points: 1 },
    ])
  })

  it('rozhodující nájezd do bodů nepočítá, PP a OS góly ano', () => {
    const summary = buildMatchSummary([
      period([ours('5:00', 'Sajdl', [], 'pp'), ours('9:00', 'Vacek', [], 'os')]),
      period([ours('60:00', 'Sajdl', [], 'sn')], 'Nájezdy'),
    ])
    expect(summary.points.find((row) => row.name === 'Sajdl')?.goals).toBe(1)
    expect(summary.ppGoals).toBe(1)
    expect(summary.shGoals).toBe(1)
  })

  it('tresty sčítá po hráčích, neznámá délka je 0 min, ale počítá se jako trest', () => {
    const summary = buildMatchSummary([
      period([
        penalty('4:00', 'Zelený', 2),
        penalty('8:00', 'Vašata', 2),
        penalty('42:00', 'Zelený', 20),
      ]),
      period([penalty('50:00', 'Vašata', null)], '3. třetina'),
    ])
    expect(summary.penalties).toEqual([
      { name: 'Zelený', minutes: 22, count: 2 },
      { name: 'Vašata', minutes: 2, count: 2 },
    ])
    expect(summary.penaltyMinutes).toBe(24)
  })

  it('osa jen s góly soupeře dá prázdný souhrn', () => {
    const summary = buildMatchSummary([period([theirs('1:00')])])
    expect(summary.points).toEqual([])
    expect(summary.penalties).toEqual([])
  })
})
