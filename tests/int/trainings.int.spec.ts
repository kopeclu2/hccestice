import type { CollectionBeforeValidateHook, PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { fillTraining } from '../../src/hooks/trainingHooks'
import { toTrainingSession } from '../../src/landing/features/trainings/view/trainingSession'
import {
  buildTrainingMonths,
  type TrainingSession,
} from '../../src/landing/features/trainings/view/trainingsTable'
import { seasonStartYear, startOfPragueDayIso, trainingTitle } from '../../src/lib/trainings'

describe('seasonStartYear', () => {
  it('hranice 31. 7. / 1. 8. v pražském čase', () => {
    expect(seasonStartYear('2026-07-31T12:00:00+02:00')).toBe(2025)
    expect(seasonStartYear('2026-08-01T00:30:00+02:00')).toBe(2026)
    // 30. 7. 22:30 UTC je už 1. 8. 0:30 v Praze
    expect(seasonStartYear('2026-07-31T22:30:00Z')).toBe(2026)
  })

  it('přechod roku patří sezóně, která začala v srpnu', () => {
    expect(seasonStartYear('2026-12-31T20:00:00Z')).toBe(2026)
    expect(seasonStartYear('2026-12-31T23:30:00Z')).toBe(2026)
    expect(seasonStartYear('2027-01-01T10:00:00Z')).toBe(2026)
    expect(seasonStartYear('2027-03-15T10:00:00Z')).toBe(2026)
  })

  it('neplatné datum dá null', () => {
    expect(seasonStartYear('nesmysl')).toBeNull()
  })
})

describe('trainingTitle', () => {
  it('den, datum a skupina', () => {
    expect(trainingTitle('2026-11-03T16:00:00+01:00', 'Muži + děti')).toBe(
      'út 3. 11. 2026 · Muži + děti',
    )
  })

  it('bez skupiny jen datum, prázdný vstup prázdný titulek', () => {
    expect(trainingTitle('2026-11-03T16:00:00+01:00', '  ')).toBe('út 3. 11. 2026')
    expect(trainingTitle(null, 'Muži')).toBe('')
    expect(trainingTitle('x', 'Muži')).toBe('')
  })
})

describe('startOfPragueDayIso', () => {
  it('začátek dne v Praze jako UTC (zima i léto)', () => {
    expect(startOfPragueDayIso(new Date('2026-11-03T10:00:00Z'))).toBe('2026-11-02T23:00:00.000Z')
    expect(startOfPragueDayIso(new Date('2026-07-03T10:00:00Z'))).toBe('2026-07-02T22:00:00.000Z')
    // 23:30 UTC je v Praze už další den
    expect(startOfPragueDayIso(new Date('2026-11-03T23:30:00Z'))).toBe('2026-11-03T23:00:00.000Z')
  })
})

describe('toTrainingSession', () => {
  it('mapuje pole, prázdné texty na null, joint na accent', () => {
    expect(
      toTrainingSession({
        id: 7,
        date: '2026-11-03T15:00:00.000Z',
        endsAt: '2026-11-03T16:15:00.000Z',
        group: ' Muži ',
        venue: '',
        note: null,
        joint: true,
      }),
    ).toEqual({
      id: '7',
      startsAt: '2026-11-03T15:00:00.000Z',
      endsAt: '2026-11-03T16:15:00.000Z',
      group: 'Muži',
      venue: null,
      note: null,
      accent: true,
    })
  })

  it('chybějící konec a joint', () => {
    const session = toTrainingSession({ id: 1, date: '2026-11-03T15:00:00.000Z' })
    expect(session.endsAt).toBeNull()
    expect(session.accent).toBe(false)
  })
})

describe('buildTrainingMonths', () => {
  const s = (id: string, startsAt: string, endsAt: string | null = null): TrainingSession => ({
    id,
    startsAt,
    endsAt,
    group: null,
    venue: null,
    note: null,
    accent: false,
  })

  it('řadí podle začátku, seskupuje do měsíců a počítá den v týdnu', () => {
    const months = buildTrainingMonths([
      s('dec', '2026-12-01T15:00:00Z'),
      s('b', '2026-11-05T16:45:00Z'),
      s('a', '2026-11-03T15:00:00Z'),
    ])
    expect(months.map((m) => m.key)).toEqual(['2026-11', '2026-12'])
    expect(months[0].label).toBe('listopad 2026')
    expect(months[0].rows.map((r) => r.id)).toEqual(['a', 'b'])
    expect(months[0].rows[0].weekday).toBe('út')
    expect(months[0].rows[1].weekday).toBe('čt')
    expect(months[0].rows[0].date).toBe('3. 11.')
  })

  it('čas s koncem i bez něj (Europe/Prague)', () => {
    const [month] = buildTrainingMonths([
      s('a', '2026-11-03T15:00:00Z', '2026-11-03T16:15:00Z'),
      s('b', '2026-11-05T16:45:00Z'),
    ])
    expect(month.rows[0].time).toBe('16:00–17:15')
    expect(month.rows[1].time).toBe('17:45')
  })

  it('měsíc se určuje v Praze, ne v UTC', () => {
    const months = buildTrainingMonths([s('a', '2026-11-30T23:30:00Z')])
    expect(months[0].key).toBe('2026-12')
  })

  it('neplatné datum se zahodí', () => {
    const months = buildTrainingMonths([s('x', 'nesmysl'), s('a', '2026-11-03T15:00:00Z')])
    expect(months).toHaveLength(1)
    expect(months[0].rows.map((r) => r.id)).toEqual(['a'])
    expect(buildTrainingMonths([])).toEqual([])
  })
})

describe('fillTraining (hook)', () => {
  const setup = (seasons: Record<string, { id: number }[]>) => {
    const find = vi.fn(async ({ where }: { where: Record<string, unknown> }) => ({
      docs: seasons['startYear' in where ? 'byYear' : 'current'] ?? [],
    }))
    const req = { payload: { find } } as unknown as PayloadRequest
    const run = (args: {
      data: Record<string, unknown>
      operation?: 'create' | 'update'
      originalDoc?: Record<string, unknown>
    }) =>
      fillTraining({
        operation: 'create',
        ...args,
        req,
      } as unknown as Parameters<CollectionBeforeValidateHook>[0])
    return { find, run }
  }

  it('create bez sezóny: sezóna podle data a titulek', async () => {
    const { run, find } = setup({ byYear: [{ id: 3 }] })
    const data = (await run({
      data: { date: '2026-11-03T15:00:00.000Z', group: 'Muži' },
    })) as Record<string, unknown>
    expect(data.season).toBe(3)
    expect(data.title).toBe('út 3. 11. 2026 · Muži')
    expect(find).toHaveBeenCalledTimes(1)
  })

  it('bez sezóny pro rok spadne na aktuální, jinak zůstane prázdná', async () => {
    const withCurrent = setup({ current: [{ id: 9 }] })
    expect(
      (
        (await withCurrent.run({ data: { date: '2026-11-03T15:00:00.000Z' } })) as {
          season?: number
        }
      ).season,
    ).toBe(9)
    const none = setup({})
    expect(
      ((await none.run({ data: { date: '2026-11-03T15:00:00.000Z' } })) as { season?: number })
        .season,
    ).toBeUndefined()
  })

  it('ruční sezóna se nepřepíše a update sezónu nehledá', async () => {
    const manual = setup({ byYear: [{ id: 3 }] })
    const data = (await manual.run({
      data: { date: '2026-11-03T15:00:00.000Z', season: 5 },
    })) as { season?: number }
    expect(data.season).toBe(5)
    expect(manual.find).not.toHaveBeenCalled()

    const update = setup({ byYear: [{ id: 3 }] })
    await update.run({
      operation: 'update',
      data: { group: 'Muži' },
      originalDoc: { date: '2026-11-03T15:00:00.000Z' },
    })
    expect(update.find).not.toHaveBeenCalled()
  })

  it('update jen se skupinou bere datum z uloženého dokumentu', async () => {
    const { run } = setup({})
    const data = (await run({
      operation: 'update',
      data: { group: 'Společný' },
      originalDoc: { date: '2026-11-03T15:00:00.000Z', group: 'Muži' },
    })) as { title?: string }
    expect(data.title).toBe('út 3. 11. 2026 · Společný')
  })
})
