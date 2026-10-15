import { describe, expect, it } from 'vitest'

import { buildListUrl } from '@/landing/lib/listUrl'

describe('buildListUrl', () => {
  it('holá základna bez parametrů', () => {
    expect(buildListUrl('/aktuality')).toBe('/aktuality')
  })

  it('první strana se do URL nepíše', () => {
    expect(buildListUrl('/aktuality', { page: 1 })).toBe('/aktuality')
  })

  it('filtr jde před stránku', () => {
    expect(buildListUrl('/aktuality', { filters: { typ: 'report' }, page: 3 })).toBe(
      '/aktuality?typ=report&page=3',
    )
  })

  it('prázdný filtr se vynechá', () => {
    expect(buildListUrl('/fotogalerie', { filters: { sezona: null }, page: 2 })).toBe(
      '/fotogalerie?page=2',
    )
    expect(buildListUrl('/fotogalerie', { filters: { sezona: '' } })).toBe('/fotogalerie')
  })

  it('název parametru stránkování jde změnit', () => {
    expect(
      buildListUrl('/zapasy', { filters: { sezona: '2025-2026' }, page: 2, pageKey: 'strana' }),
    ).toBe('/zapasy?sezona=2025-2026&strana=2')
  })

  it('kotva se přidá za query', () => {
    expect(buildListUrl('/aktuality', { hash: 'seznam' })).toBe('/aktuality#seznam')
    expect(
      buildListUrl('/aktuality', { filters: { typ: 'report' }, page: 2, hash: 'seznam' }),
    ).toBe('/aktuality?typ=report&page=2#seznam')
  })

  it('hodnoty filtru se kódují', () => {
    expect(buildListUrl('/fotogalerie', { filters: { sezona: 'a b&c' } })).toBe(
      '/fotogalerie?sezona=a+b%26c',
    )
  })
})
