import type { FieldHook, PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import type { MatchTimelinePeriod } from '@/landing/features/matches/types'
import { buildLineup } from '@/landing/features/matches/view/matchLineup'
import { matchLinkTitle } from '@/landing/features/matches/view/matchLink'
import { buildScorers } from '@/landing/features/matches/view/matchScorers'

import { matchDisplayTitleAfterRead, withMatchDate } from '../../src/hooks/matchDisplayTitle'

describe('buildLineup', () => {
  it('prázdná nebo chybějící sestava dá null', () => {
    expect(buildLineup(undefined)).toBeNull()
    expect(buildLineup(null)).toBeNull()
    expect(buildLineup([])).toBeNull()
  })

  it('řádek bez jména se zahodí; sestava jen z takových řádků dá null', () => {
    expect(buildLineup([{ number: 9, goals: 1 }])).toBeNull()
    const lineup = buildLineup([
      { number: 9, goals: 1 },
      { number: 7, name: 'Sajdl' },
    ])
    expect(lineup?.skaters.map((row) => row.name)).toEqual(['Sajdl'])
  })

  it('řadí podle čísla, pak jména; hráč bez čísla je na konci', () => {
    const lineup = buildLineup([
      { name: 'Žák', number: null },
      { name: 'Vacek', number: 12 },
      { name: 'Kopecký', number: 7 },
      { name: 'Adam', number: 12 },
    ])
    expect(lineup?.skaters.map((row) => row.name)).toEqual(['Kopecký', 'Adam', 'Vacek', 'Žák'])
  })

  it('brankáři jsou zvlášť a nepřijdou do hráčů v poli', () => {
    const lineup = buildLineup([
      { name: 'Novák', number: 30, goalie: true },
      { name: 'Sajdl', number: 9 },
      { name: 'Dvořák', number: 1, goalie: true },
    ])
    expect(lineup?.skaters.map((row) => row.name)).toEqual(['Sajdl'])
    expect(lineup?.goalies.map((row) => row.name)).toEqual(['Dvořák', 'Novák'])
  })

  it('body = góly + asistence, chybějící čísla jsou 0; jméno z relace jako záloha', () => {
    const lineup = buildLineup([
      { number: 9, name: 'Sajdl', goals: 2, assists: 1, pim: 4 },
      { number: 5, player: { id: 1, name: 'Vacek' } as never },
    ])
    expect(lineup?.skaters).toEqual([
      { number: 5, name: 'Vacek', goals: 0, assists: 0, points: 0, pim: 0 },
      { number: 9, name: 'Sajdl', goals: 2, assists: 1, points: 3, pim: 4 },
    ])
  })

  it('soupiska jen z brankářů nemá hráče v poli', () => {
    const lineup = buildLineup([{ name: 'Novák', number: 30, goalie: true }])
    expect(lineup?.skaters).toEqual([])
    expect(lineup?.goalies).toHaveLength(1)
  })
})

describe('buildScorers', () => {
  const periods: MatchTimelinePeriod[] = [
    {
      label: '1. třetina',
      score: null,
      events: [
        {
          type: 'goal',
          ours: true,
          time: '5:00',
          score: '1:0',
          scorer: 'Sajdl',
          assists: ['Vacek'],
          special: 'pp',
        },
        { type: 'goal', ours: false, time: '8:00', score: '1:1' },
        { type: 'penalty', time: '9:00', player: 'Vacek', minutes: 2, kind: null, reason: null },
      ],
    },
    {
      label: 'Nájezdy',
      score: null,
      events: [
        {
          type: 'goal',
          ours: true,
          time: '60:00',
          score: '3:2',
          scorer: 'Kopecký',
          assists: [],
          special: 'sn',
        },
      ],
    },
  ]

  it('vrací jen naše branky v pořadí osy, včetně rozhodujícího nájezdu', () => {
    expect(buildScorers(periods)).toEqual([
      { time: '5:00', score: '1:0', scorer: 'Sajdl', assists: ['Vacek'], special: 'pp' },
      { time: '60:00', score: '3:2', scorer: 'Kopecký', assists: [], special: 'sn' },
    ])
  })

  it('osa bez našich branek dá prázdný seznam', () => {
    expect(buildScorers([])).toEqual([])
  })
})

describe('matchLinkTitle', () => {
  it('domácí zápas má Čestice vlevo, venkovní vpravo', () => {
    expect(matchLinkTitle({ home: true, opponentName: 'HC Zdar' })).toBe('HC Čestice × HC Zdar')
    expect(matchLinkTitle({ home: false, opponentName: 'HC Zdar' })).toBe('HC Zdar × HC Čestice')
  })
})

describe('titulek zápasu s datem v adminu', () => {
  it('withMatchDate přidá datum (Europe/Prague) na začátek', () => {
    // 23:30 UTC je v Praze (CET) už další den.
    expect(withMatchDate('HC Čestice x HC Zdar', '2026-03-14T23:30:00.000Z')).toBe(
      '15. 3. 2026 · HC Čestice x HC Zdar',
    )
  })

  it('je idempotentní a bez platného data nic nemění', () => {
    const once = withMatchDate('HC Čestice x HC Zdar', '2026-03-14T12:00:00.000Z')
    expect(withMatchDate(once, '2026-03-14T12:00:00.000Z')).toBe(once)
    expect(withMatchDate('HC Čestice x HC Zdar', null)).toBe('HC Čestice x HC Zdar')
    expect(withMatchDate('HC Čestice x HC Zdar', 'nesmysl')).toBe('HC Čestice x HC Zdar')
  })

  const run = (
    args: { value?: unknown; data?: Record<string, unknown> },
    findByID = vi.fn(async () => ({ date: '2026-03-14T12:00:00.000Z' })),
  ) => {
    const req = { payload: { findByID } } as unknown as PayloadRequest
    const result = matchDisplayTitleAfterRead({
      ...args,
      req,
    } as unknown as Parameters<FieldHook>[0])
    return { result: Promise.resolve(result), findByID }
  }

  it('afterRead bere datum z dokumentu a nedotazuje se', async () => {
    const { result, findByID } = run({
      value: 'HC Čestice x HC Zdar',
      data: { id: 1, date: '2026-03-14T12:00:00.000Z' },
    })
    expect(await result).toBe('14. 3. 2026 · HC Čestice x HC Zdar')
    expect(findByID).not.toHaveBeenCalled()
  })

  it('picker vybírá jen displayTitle — datum se dočte dotazem na dokument', async () => {
    const { result, findByID } = run({ value: 'HC Čestice x HC Zdar', data: { id: 7 } })
    expect(await result).toBe('14. 3. 2026 · HC Čestice x HC Zdar')
    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'matches', id: 7, select: { date: true } }),
    )
  })

  it('selhání dotazu nebo prázdná hodnota titulek nerozbijí', async () => {
    const broken = run(
      { value: 'HC Čestice x HC Zdar', data: { id: 7 } },
      vi.fn(async () => Promise.reject(new Error('db'))),
    )
    expect(await broken.result).toBe('HC Čestice x HC Zdar')
    expect(await run({ value: undefined, data: { id: 7 } }).result).toBeUndefined()
  })
})
