import { describe, expect, it, vi } from 'vitest'

import { hideMissingOnAhl, MAX_HIDDEN_PER_RUN } from '../../src/jobs/vchlSync/sync/matches'
import type { Match } from '../../src/payload-types'

type Ctx = Parameters<typeof hideMissingOnAhl>[0]

const doc = (id: number, matchId: number | null, extra: Partial<Match> = {}): Match =>
  ({
    id,
    date: '2026-11-07T17:00:00.000Z',
    home: true,
    opponent: 5,
    hiddenOnWeb: false,
    ahl: matchId == null ? undefined : { matchId, syncedAt: '2026-10-01T00:00:00.000Z' },
    ...extra,
  }) as unknown as Match

const makeCtx = () => {
  const update = vi.fn(async () => ({}))
  const warn = vi.fn()
  const ctx = {
    update,
    warn,
    recordDiff: vi.fn(),
    changes: { matchesUpdated: 0 },
  } as unknown as Ctx
  return { ctx, update, warn }
}

const lists = (ids: number[]) => ({
  rozpis: ids.map((matchId) => ({ matchId }) as never),
  vysledky: [] as never[],
})

describe('hideMissingOnAhl', () => {
  it('skryje zápas, který z AHL zmizel, a označí ho jako skrytý synchronizací', async () => {
    const { ctx, update } = makeCtx()
    const final = new Map<number, Match>()
    await hideMissingOnAhl(ctx, [doc(1, 100), doc(2, 200)], new Set([100]), lists([100]), final)
    expect(update).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith(
      'matches',
      2,
      expect.objectContaining({
        hiddenOnWeb: true,
        ahl: expect.objectContaining({ matchId: 200, hiddenBySync: true }),
        opponent: 5,
        home: true,
      }),
    )
    expect(final.get(2)?.hiddenOnWeb).toBe(true)
  })

  it('nesahá na ruční zápasy bez ID z AHL ani na už skryté', async () => {
    const { ctx, update } = makeCtx()
    await hideMissingOnAhl(
      ctx,
      [doc(1, null), doc(2, 200, { hiddenOnWeb: true })],
      new Set([100]),
      lists([100]),
      new Map(),
    )
    expect(update).not.toHaveBeenCalled()
  })

  it('při vypnuté části (null) nebo prázdných výpisech neskrývá nic', async () => {
    const { ctx, update } = makeCtx()
    const docs = [doc(1, 100)]
    await hideMissingOnAhl(ctx, docs, new Set([1]), { rozpis: null, vysledky: [] }, new Map())
    await hideMissingOnAhl(ctx, docs, new Set(), { rozpis: [], vysledky: [] }, new Map())
    expect(update).not.toHaveBeenCalled()
  })

  it('při hromadném zmizení nic neskryje a zapíše varování', async () => {
    const { ctx, update, warn } = makeCtx()
    const docs = Array.from({ length: MAX_HIDDEN_PER_RUN + 1 }, (_, i) => doc(i + 1, 100 + i))
    await hideMissingOnAhl(ctx, docs, new Set([999]), lists([999]), new Map())
    expect(update).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(expect.objectContaining({ ref: 'bulk' }))
  })
})
