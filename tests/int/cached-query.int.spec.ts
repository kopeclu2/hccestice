import { beforeEach, describe, expect, it, vi } from 'vitest'

const { unstableCache } = vi.hoisted(() => ({ unstableCache: vi.fn() }))

vi.mock('next/cache', () => ({ unstable_cache: unstableCache }))
vi.mock('payload', () => ({ getPayload: vi.fn(async () => ({ stub: true })) }))
vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))

import { cachedQuery, getPayloadClient } from '@/landing/data/query'
import { CACHE_TAGS } from '@/landing/data/tags'

beforeEach(() => {
  unstableCache.mockReset()
  // `unstable_cache` v testu vrací vlastní funkci, ať jde ověřit předávání.
  unstableCache.mockImplementation((fn: (...args: unknown[]) => unknown) => fn)
})

describe('cachedQuery', () => {
  it('klíč [key, version] a tag + výchozí revalidate 3600', () => {
    const fn = async () => 1
    cachedQuery(fn, { key: 'match-detail', version: 'v3', tags: [CACHE_TAGS.matches] })

    expect(unstableCache).toHaveBeenCalledWith(fn, ['match-detail', 'v3'], {
      tags: ['matches-list'],
      revalidate: 3600,
    })
  })

  it('bez verze je klíč jen [key] (jako dnešní site-config)', () => {
    cachedQuery(async () => 1, { key: 'site-config', tags: [CACHE_TAGS.siteConfig] })

    expect(unstableCache.mock.calls[0][1]).toEqual(['site-config'])
    expect(unstableCache.mock.calls[0][2]).toEqual({ tags: ['site-config'], revalidate: 3600 })
  })

  it('víc tagů a vlastní revalidate', () => {
    cachedQuery(async () => 1, {
      key: 'x',
      version: 'v1',
      tags: [CACHE_TAGS.matches, CACHE_TAGS.posts],
      revalidate: 60,
    })

    expect(unstableCache.mock.calls[0][2]).toEqual({
      tags: ['matches-list', 'posts-list'],
      revalidate: 60,
    })
  })

  it('tagy se předají jako kopie (volající pole nezmutuje cache)', () => {
    const tags = [CACHE_TAGS.matches] as const
    cachedQuery(async () => 1, { key: 'x', tags })
    expect(unstableCache.mock.calls[0][2].tags).not.toBe(tags)
  })

  it('vrácená funkce předává argumenty i výsledek', async () => {
    const query = cachedQuery(async (a: number, b: string) => `${a}${b}`, {
      key: 'x',
      tags: [CACHE_TAGS.posts],
    })
    await expect(query(1, 'a')).resolves.toBe('1a')
  })
})

describe('getPayloadClient', () => {
  it('vrací instanci z getPayload', async () => {
    await expect(getPayloadClient()).resolves.toEqual({ stub: true })
  })
})
