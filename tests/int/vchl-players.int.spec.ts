import { describe, expect, it } from 'vitest'

import { matchPlayer, type PlayerCandidate, type PlayerLike } from '../../src/jobs/vchlSync/sync/players'

const cand = (over: Partial<PlayerCandidate>): PlayerCandidate => ({
  ahlPlayerId: null,
  name: 'Lukáš Sajdl',
  number: 25,
  goalie: false,
  ...over,
})

const db: PlayerLike[] = [
  { id: 1, name: 'Lukáš Sajdl', ahlPlayerId: null },
  { id: 2, name: 'Radim Sajdl', ahlPlayerId: 111 },
  { id: 3, name: 'Šimon Zelený', ahlPlayerId: null },
]

describe('vchl párování hráčů', () => {
  it('podle ahlPlayerId má přednost před jménem', () => {
    const r = matchPlayer(cand({ ahlPlayerId: 111, name: 'Úplně Jiné Jméno' }), db)
    expect(r).toMatchObject({ kind: 'matched', player: { id: 2 } })
  })

  it('podle jména bez diakritiky a velikosti písmen', () => {
    const r = matchPlayer(cand({ ahlPlayerId: 38010, name: 'lukas SAJDL' }), db)
    expect(r).toMatchObject({ kind: 'matched', player: { id: 1 } })
  })

  it('jméno z AHL „Příjmení, Jméno" se normalizuje na „Jméno Příjmení"', () => {
    const r = matchPlayer(cand({ ahlPlayerId: 5, name: 'Zelený, Šimon' }), db)
    expect(r).toMatchObject({ kind: 'matched', player: { id: 3 } })
  })

  it('hráč s jiným ahlPlayerId je jiný člověk (homonym)', () => {
    const r = matchPlayer(cand({ ahlPlayerId: 999, name: 'Radim Sajdl' }), db)
    expect(r.kind).toBe('none')
  })

  it('víc shod = nejednoznačné, nepáruje se', () => {
    const dup: PlayerLike[] = [...db, { id: 9, name: 'Lukáš Sajdl', ahlPlayerId: null }]
    const r = matchPlayer(cand({ ahlPlayerId: 38010 }), dup)
    expect(r.kind).toBe('ambiguous')
  })

  it('neznámý hráč', () => {
    expect(matchPlayer(cand({ ahlPlayerId: 44080, name: 'Jakub Všetečka' }), db).kind).toBe('none')
  })

  it('bez ID z AHL se hledá mezi všemi hráči', () => {
    const r = matchPlayer(cand({ ahlPlayerId: null, name: 'Radim Sajdl' }), db)
    expect(r).toMatchObject({ kind: 'matched', player: { id: 2 } })
  })
})
