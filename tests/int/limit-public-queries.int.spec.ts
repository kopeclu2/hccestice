import type { CollectionConfig, Config, PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  clampPublicQuery,
  limitPublicQueries,
  PUBLIC_MAX_DEPTH,
  PUBLIC_MAX_LIMIT,
} from '@/plugins/limitPublicQueries'

describe('clampPublicQuery', () => {
  it('limit nad stropem srazí na strop a zapne stránkování', () => {
    expect(clampPublicQuery({ limit: 100000 })).toEqual({
      limit: PUBLIC_MAX_LIMIT,
      pagination: true,
    })
  })

  it('limit 0 (vše) je taky strop', () => {
    expect(clampPublicQuery({ limit: 0 }).limit).toBe(PUBLIC_MAX_LIMIT)
  })

  it('pagination:false bez limitu je strop, ne neomezený výpis', () => {
    expect(clampPublicQuery({ pagination: false })).toEqual({
      limit: PUBLIC_MAX_LIMIT,
      pagination: true,
    })
  })

  it('pagination:false s limitem ho přepne na true a limit nechá', () => {
    expect(clampPublicQuery({ pagination: false, limit: 20 })).toEqual({
      limit: 20,
      pagination: true,
    })
  })

  it('rozumný limit nechá být', () => {
    expect(clampPublicQuery({ limit: 12 })).toMatchObject({ limit: 12 })
    expect(clampPublicQuery({ limit: PUBLIC_MAX_LIMIT }).limit).toBe(PUBLIC_MAX_LIMIT)
  })

  it('záporný limit je strop', () => {
    expect(clampPublicQuery({ limit: -1 }).limit).toBe(PUBLIC_MAX_LIMIT)
  })

  it('depth nad stropem srazí, nižší a nezadaný nechá', () => {
    expect(clampPublicQuery({ depth: 10 }).depth).toBe(PUBLIC_MAX_DEPTH)
    expect(clampPublicQuery({ depth: 1 }).depth).toBe(1)
    expect(clampPublicQuery({ depth: 0 }).depth).toBe(0)
    expect(clampPublicQuery<{ depth?: number }>({}).depth).toBeUndefined()
  })

  it('dotaz bez limitu (findByID, výchozí find) nedostane vnucený limit ani pagination', () => {
    expect(clampPublicQuery({ depth: 1 })).toEqual({ depth: 1 })
  })

  it('nemutuje vstup a zachová cizí klíče', () => {
    const input = { limit: 500, id: 7 }
    const output = clampPublicQuery(input)
    expect(input).toEqual({ limit: 500, id: 7 })
    expect(output).toMatchObject({ id: 7 })
  })
})

describe('limitPublicQueries', () => {
  const run = (collections: CollectionConfig[]) =>
    (limitPublicQueries()({ collections } as unknown as Config) as Config).collections!

  const invoke = (
    collection: CollectionConfig,
    operation: string,
    req: Partial<PayloadRequest>,
    args: Record<string, unknown>,
  ) => {
    const hook = collection.hooks!.beforeOperation!.at(-1)!
    return (hook as unknown as (a: unknown) => unknown)({ args, operation, req })
  }

  it('přidá hook ke každé kolekci a nezahodí existující', () => {
    const existing = () => undefined
    const [a, b] = run([
      { slug: 'a', fields: [], hooks: { beforeOperation: [existing] } },
      { slug: 'b', fields: [] },
    ] as CollectionConfig[])
    expect(a!.hooks!.beforeOperation).toHaveLength(2)
    expect(a!.hooks!.beforeOperation![0]).toBe(existing)
    expect(b!.hooks!.beforeOperation).toHaveLength(1)
  })

  it('anonymní REST dotaz se srazí na stropy', () => {
    const [c] = run([{ slug: 'a', fields: [] }] as CollectionConfig[])
    const result = invoke(
      c!,
      'read',
      { payloadAPI: 'REST', user: null },
      { limit: 0, depth: 9, where: {} },
    )
    expect(result).toEqual({ limit: PUBLIC_MAX_LIMIT, pagination: true, depth: 2, where: {} })
  })

  it('GraphQL se omezuje stejně', () => {
    const [c] = run([{ slug: 'a', fields: [] }] as CollectionConfig[])
    expect(invoke(c!, 'read', { payloadAPI: 'GraphQL' }, { limit: 1000 })).toMatchObject({
      limit: PUBLIC_MAX_LIMIT,
    })
  })

  it('Local API a přihlášený uživatel projdou beze změny (hook nic nevrací)', () => {
    const [c] = run([{ slug: 'a', fields: [] }] as CollectionConfig[])
    expect(invoke(c!, 'read', { payloadAPI: 'local' }, { limit: 0 })).toBeUndefined()
    expect(
      invoke(c!, 'read', { payloadAPI: 'REST', user: { id: 1 } as never }, { limit: 0 }),
    ).toBeUndefined()
  })

  it('jiné operace než čtení se nedotýká', () => {
    const [c] = run([{ slug: 'a', fields: [] }] as CollectionConfig[])
    expect(invoke(c!, 'create', { payloadAPI: 'REST' }, { depth: 9 })).toBeUndefined()
  })
})
