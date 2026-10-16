import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { utcToPragueLocal } from '@/lib/datetime'
import { matchSlug, uniqueSlug, withSlugSuffix } from '@/lib/matchSlug'
import { slugifyCs } from '@/lib/slugifyCs'

import { generateMatchSlug } from '../../src/hooks/matchSlug'
import { draftSlug } from '../../src/jobs/vchlSync/sync/draftPost'

describe('slugifyCs', () => {
  it('odstraní diakritiku a spojí ne-alfanumerické znaky do jedné pomlčky', () => {
    expect(slugifyCs('HC Žďár nad Sázavou')).toBe('hc-zdar-nad-sazavou')
    expect(slugifyCs('SK Žamberk')).toBe('sk-zamberk')
    expect(slugifyCs('  HC   Orli (B)  ')).toBe('hc-orli-b')
  })

  it('prázdný nebo čistě symbolický text dá prázdný slug', () => {
    expect(slugifyCs('')).toBe('')
    expect(slugifyCs(' – ')).toBe('')
  })

  it('draftSlug se po vytažení helperu nezměnil', () => {
    expect(draftSlug('2026-10-04', 'Pardubice')).toBe('2026-10-04-pardubice')
    expect(draftSlug('2026-10-04', 'Žďár n. S.')).toBe('2026-10-04-zdar-n-s')
    expect(draftSlug('2026-10-04', '')).toBe('2026-10-04')
  })
})

describe('matchSlug', () => {
  it('den + slug soupeře', () => {
    expect(matchSlug('2025-10-12', 'hc-zdar')).toBe('2025-10-12-hc-zdar')
  })

  it('bez soupeře jen den', () => {
    expect(matchSlug('2025-10-12', null)).toBe('2025-10-12')
    expect(matchSlug('2025-10-12', undefined)).toBe('2025-10-12')
    expect(matchSlug('2025-10-12', '')).toBe('2025-10-12')
  })

  it('slug soupeře ze slugifyCs odpovídá slugům v DB', () => {
    expect(matchSlug('2025-10-12', slugifyCs('HC Žďár nad Sázavou'))).toBe(
      '2025-10-12-hc-zdar-nad-sazavou',
    )
  })

  it('den se bere v Europe/Prague, ne v UTC', () => {
    // Letní čas (UTC+2): 22:30 UTC je v Praze už půl hodiny po půlnoci.
    expect(utcToPragueLocal('2025-10-11T22:30:00Z').day).toBe('2025-10-12')
    expect(matchSlug(utcToPragueLocal('2025-10-11T22:30:00Z').day, 'hc-zdar')).toBe(
      '2025-10-12-hc-zdar',
    )
    // Zimní čas (UTC+1): totéž ve 23:30 UTC.
    expect(utcToPragueLocal('2026-01-14T23:30:00Z').day).toBe('2026-01-15')
    expect(utcToPragueLocal('2026-01-14T22:30:00Z').day).toBe('2026-01-14')
  })
})

describe('kolizní přípony', () => {
  it('první výskyt bez přípony, další -2, -3…', () => {
    expect(withSlugSuffix('a', 1)).toBe('a')
    expect(withSlugSuffix('a', 2)).toBe('a-2')
    expect(withSlugSuffix('a', 3)).toBe('a-3')
  })

  it('uniqueSlug vrátí první volný slug', async () => {
    const taken = new Set(['a', 'a-2'])
    const isTaken = async (s: string) => taken.has(s)
    expect(await uniqueSlug('a', isTaken)).toBe('a-3')
    expect(await uniqueSlug('b', isTaken)).toBe('b')
  })

  it('uniqueSlug se při trvale obsazeném slugu nezacyklí', async () => {
    await expect(uniqueSlug('a', async () => true)).rejects.toThrow()
  })
})

describe('hook generateMatchSlug', () => {
  const setup = (
    opts: { opponent?: { slug?: string | null } | 'missing'; taken?: string[] } = {},
  ) => {
    const taken = new Set(opts.taken ?? [])
    const findByID = vi.fn(async () => {
      if (opts.opponent === 'missing') throw new Error('Not found')
      return opts.opponent ?? { slug: 'hc-zdar' }
    })
    const count = vi.fn(
      async ({ where }: { where: { and: Array<{ slug?: { equals: string } }> } }) => ({
        totalDocs: taken.has(where.and[0].slug!.equals) ? 1 : 0,
      }),
    )
    const req = { payload: { findByID, count } } as unknown as PayloadRequest
    const run = (args: {
      data: Record<string, unknown>
      originalDoc?: Record<string, unknown>
      operation: 'create' | 'update'
    }) => generateMatchSlug({ ...args, req } as never) as Promise<Record<string, unknown>>
    return { run, findByID, count }
  }

  it('při založení vygeneruje slug z dne v Praze a slugu soupeře', async () => {
    const { run } = setup()
    const out = await run({
      data: { date: '2025-10-11T22:30:00.000Z', opponent: 4 },
      operation: 'create',
    })
    expect(out.slug).toBe('2025-10-12-hc-zdar')
  })

  it('kolize dostane příponu', async () => {
    const { run } = setup({ taken: ['2025-10-12-hc-zdar', '2025-10-12-hc-zdar-2'] })
    const out = await run({
      data: { date: '2025-10-12T14:00:00.000Z', opponent: 4 },
      operation: 'create',
    })
    expect(out.slug).toBe('2025-10-12-hc-zdar-3')
  })

  it('při update vyloučí z kontroly kolize vlastní dokument', async () => {
    const { run, count } = setup()
    await run({
      data: { opponent: 4 },
      originalDoc: { id: 7, date: '2025-10-12T14:00:00.000Z' },
      operation: 'update',
    })
    expect(JSON.stringify(count.mock.calls[0][0].where)).toContain('"not_equals":7')
  })

  it('existující slug nemění (přeložení zápasu, update jen části polí)', async () => {
    const { run, findByID, count } = setup()
    const out = await run({
      data: { date: '2025-12-01T14:00:00.000Z' },
      originalDoc: { id: 7, slug: '2025-10-12-hc-zdar', date: '2025-10-12T14:00:00.000Z' },
      operation: 'update',
    })
    expect(out.slug).toBeUndefined()
    expect(findByID).not.toHaveBeenCalled()
    expect(count).not.toHaveBeenCalled()
  })

  it('update dokumentu bez slugu ho doplní z uloženého data a soupeře', async () => {
    const { run } = setup({ opponent: { slug: 'sk-zamberk' } })
    const out = await run({
      data: {},
      originalDoc: { id: 7, date: '2025-10-12T14:00:00.000Z', opponent: { id: 2 } },
      operation: 'update',
    })
    expect(out.slug).toBe('2025-10-12-sk-zamberk')
  })

  it('soupeř bez slugu nebo neexistující → jen den', async () => {
    const a = await setup({ opponent: { slug: null } }).run({
      data: { date: '2025-10-12T14:00:00Z', opponent: 4 },
      operation: 'create',
    })
    expect(a.slug).toBe('2025-10-12')
    const b = await setup({ opponent: 'missing' }).run({
      data: { date: '2025-10-12T14:00:00Z', opponent: 4 },
      operation: 'create',
    })
    expect(b.slug).toBe('2025-10-12')
  })

  it('ručně zadaný slug se jen očistí', async () => {
    const { run } = setup()
    const out = await run({
      data: { slug: 'Můj Zápas', date: '2025-10-12T14:00:00Z' },
      operation: 'create',
    })
    expect(out.slug).toBe('muj-zapas')
  })

  it('duplikát: slug z beforeDuplicate je null, originalDoc je bez id → nový slug s příponou', async () => {
    // `duplicateOperation` volá hook s `data: {}` a `originalDoc` = kopie originálu
    // bez `id` a (po `beforeDuplicate: () => null`) bez adresy.
    const { run, count } = setup({ taken: ['2025-10-12-hc-zdar'] })
    const out = await run({
      data: {},
      originalDoc: { slug: null, date: '2025-10-12T14:00:00.000Z', opponent: 4 },
      operation: 'create',
    })
    expect(out.slug).toBe('2025-10-12-hc-zdar-2')
    // Bez `id` se z kontroly kolize nic nevylučuje.
    expect(JSON.stringify(count.mock.calls[0][0].where)).not.toContain('not_equals')
  })

  it('ruční slug, který se po očištění vyprázdní, se generuje jako prázdný', async () => {
    const { run } = setup()
    const out = await run({
      data: { slug: ' ??? – ', date: '2025-10-12T14:00:00Z', opponent: 4 },
      operation: 'create',
    })
    expect(out.slug).toBe('2025-10-12-hc-zdar')
  })

  it('slug soupeře se pro jistotu čistí taky', async () => {
    const { run } = setup({ opponent: { slug: 'HC Žďár' } })
    const out = await run({
      data: { date: '2025-10-12T14:00:00Z', opponent: 4 },
      operation: 'create',
    })
    expect(out.slug).toBe('2025-10-12-hc-zdar')
  })

  it('slug soupeře z `slugifyCs(name)` odpovídá uloženým slugům', () => {
    const names: Array<[string, string]> = [
      ['HC Skuteč', 'hc-skutec'],
      ['SK Žamberk', 'sk-zamberk'],
      ['HC Moravská Třebová', 'hc-moravska-trebova'],
      ['HC Loko Česká Třebová', 'hc-loko-ceska-trebova'],
      ['SK Divočáci Žamberk', 'sk-divocaci-zamberk'],
      ['HC Orli B', 'hc-orli-b'],
    ]
    for (const [name, slug] of names) expect(slugifyCs(name)).toBe(slug)
  })

  it('bez data nic nevymýšlí', async () => {
    const { run } = setup()
    const out = await run({ data: { opponent: 4 }, operation: 'create' })
    expect(out.slug).toBeUndefined()
  })
})
