import { describe, expect, it } from 'vitest'

import { isDue } from '../../src/jobs/vchlSync/isDue'

const settings = { idleIntervalHours: 6, matchdayIntervalMinutes: 15, matchdayWindowHours: 48 }
const at = (s: string) => new Date(s)
const MIN = 60_000

// zápas v neděli 4. 10. 2026 v 16:30 místního času = 14:30 UTC
const match = { date: '2026-10-04T14:30:00.000Z', status: 'scheduled', hasReport: false }

describe('vchl isDue', () => {
  it('bez předchozího běhu je due hned', () => {
    const r = isDue({ now: at('2026-10-01T10:00:00Z'), lastRunAt: null, settings, ourMatches: [] })
    expect(r).toMatchObject({ due: true, mode: 'idle' })
  })

  it('klidový režim: interval 6 h', () => {
    const last = at('2026-10-01T10:00:00Z')
    const early = isDue({
      now: at('2026-10-01T15:00:00Z'),
      lastRunAt: last,
      settings,
      ourMatches: [],
    })
    expect(early.due).toBe(false)
    expect(early.nextDueAt.toISOString()).toBe('2026-10-01T16:00:00.000Z')
    expect(
      isDue({ now: at('2026-10-01T16:00:00Z'), lastRunAt: last, settings, ourMatches: [] }).due,
    ).toBe(true)
  })

  it('zápasový režim začíná přesně v čase zápasu', () => {
    const before = isDue({
      now: new Date(Date.parse(match.date) - 1),
      lastRunAt: null,
      settings,
      ourMatches: [match],
    })
    expect(before.mode).toBe('idle')
    const start = isDue({
      now: new Date(match.date),
      lastRunAt: null,
      settings,
      ourMatches: [match],
    })
    expect(start.mode).toBe('matchday')
  })

  it('zápasový režim končí po okně (hranice včetně)', () => {
    const end = Date.parse(match.date) + 48 * 60 * MIN
    expect(isDue({ now: new Date(end), lastRunAt: null, settings, ourMatches: [match] }).mode).toBe(
      'matchday',
    )
    expect(
      isDue({ now: new Date(end + 1), lastRunAt: null, settings, ourMatches: [match] }).mode,
    ).toBe('idle')
  })

  it('odehraný zápas se zápisem zápasový režim nedrží, bez zápisu ano', () => {
    const now = at('2026-10-05T10:00:00Z')
    const played = { ...match, status: 'played', hasReport: true }
    expect(isDue({ now, lastRunAt: null, settings, ourMatches: [played] }).mode).toBe('idle')
    expect(
      isDue({ now, lastRunAt: null, settings, ourMatches: [{ ...played, hasReport: false }] }).mode,
    ).toBe('matchday')
    expect(
      isDue({ now, lastRunAt: null, settings, ourMatches: [{ ...played, hasReport: null }] }).mode,
    ).toBe('matchday')
  })

  it('zápasový režim: interval 15 min s tolerancí na jitter cronu', () => {
    const now = at('2026-10-04T15:00:00Z')
    const last = new Date(now.getTime() - 15 * MIN + 400) // běh trval 0,4 s
    expect(isDue({ now, lastRunAt: last, settings, ourMatches: [match] }).due).toBe(true)
    const recent = new Date(now.getTime() - 10 * MIN)
    expect(isDue({ now, lastRunAt: recent, settings, ourMatches: [match] }).due).toBe(false)
  })

  it('po chybě se zkouší znovu v rychlém intervalu i v klidovém režimu', () => {
    const now = at('2026-10-01T10:20:00Z')
    const last = at('2026-10-01T10:00:00Z')
    expect(isDue({ now, lastRunAt: last, settings, ourMatches: [] }).due).toBe(false)
    expect(
      isDue({ now, lastRunAt: last, settings, ourMatches: [], lastRunStatus: 'error' }).due,
    ).toBe(true)
  })

  it('zrušený zápas bez zápisu drží zápasový režim jen v okně', () => {
    const canceled = { ...match, status: 'canceled' }
    expect(
      isDue({ now: at('2026-10-04T20:00:00Z'), lastRunAt: null, settings, ourMatches: [canceled] })
        .mode,
    ).toBe('matchday')
    expect(
      isDue({ now: at('2026-10-07T20:00:00Z'), lastRunAt: null, settings, ourMatches: [canceled] })
        .mode,
    ).toBe('idle')
  })
})
