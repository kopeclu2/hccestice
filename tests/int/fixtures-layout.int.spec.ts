import { describe, expect, it } from 'vitest'

import { pickLayout } from '@/landing/features/matches/view/fixturesLayout'

const fixtures = (n: number) => Array.from({ length: n }, (_, index) => ({ id: index + 1 }))

describe('pickLayout', () => {
  it.each(['cards', 'list'] as const)('bez zápasů je prázdná (%s)', (layout) => {
    expect(pickLayout([], layout)).toEqual({ kind: 'empty' })
  })

  it.each(['cards', 'list'] as const)('jediný zápas je samotný panel (%s)', (layout) => {
    expect(pickLayout(fixtures(1), layout)).toEqual({ kind: 'solo', fixture: { id: 1 } })
  })

  it('dva zápasy v režimu karet jdou do vodorovného pásu', () => {
    expect(pickLayout(fixtures(2), 'cards')).toEqual({ kind: 'rail', fixtures: fixtures(2) })
  })

  it('dva zápasy ve výpisu: nejbližší v panelu, druhý jako řádek', () => {
    expect(pickLayout(fixtures(2), 'list')).toEqual({
      kind: 'stacked',
      nearest: { id: 1 },
      rest: [{ id: 2 }],
      display: 'list',
    })
  })

  it('tři a víc: nejbližší v panelu, zbytek v mřížce karet nebo ve výpisu', () => {
    expect(pickLayout(fixtures(4), 'cards')).toEqual({
      kind: 'stacked',
      nearest: { id: 1 },
      rest: fixtures(4).slice(1),
      display: 'tiles',
    })
    expect(pickLayout(fixtures(3), 'list')).toMatchObject({ kind: 'stacked', display: 'list' })
  })
})
