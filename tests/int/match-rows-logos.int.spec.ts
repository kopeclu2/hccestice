import { describe, expect, it } from 'vitest'

import { CLUB_LOGO } from '../../src/landing/data/matchFormat'
import { teamLogos } from '../../src/landing/data/matchRows'
import type { Match } from '../../src/payload-types'

const logo = {
  id: 7,
  url: '/api/media/file/zdar.png',
  alt: 'HC Zdar',
  width: 200,
  height: 200,
  updatedAt: '2026-10-01T00:00:00.000Z',
}

const match = (home: boolean, opponentLogo: unknown): Match =>
  ({ id: 1, home, opponent: { id: 3, name: 'HC Zdar', logo: opponentLogo } }) as unknown as Match

describe('teamLogos', () => {
  it('doma: klub vlevo, soupeř vpravo', () => {
    const logos = teamLogos(match(true, logo))
    expect(logos.homeLogo).toBe(CLUB_LOGO)
    expect(logos.awayLogo?.url).toBe('/api/media/file/zdar.png')
  })

  it('venku: soupeř vlevo, klub vpravo', () => {
    const logos = teamLogos(match(false, logo))
    expect(logos.homeLogo?.url).toBe('/api/media/file/zdar.png')
    expect(logos.awayLogo).toBe(CLUB_LOGO)
  })

  it('nepopulované logo (jen id) je null — řádek ukáže monogram', () => {
    expect(teamLogos(match(true, 7)).awayLogo).toBeNull()
    expect(teamLogos(match(true, null)).awayLogo).toBeNull()
  })
})
