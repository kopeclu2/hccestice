import { describe, expect, it } from 'vitest'

import {
  competitionLabel,
  formatCompetition,
  formatPair,
  matchScore,
  matchTitle,
  orient,
  outcomeNote,
  phaseLabel,
  scoreSuffix,
  sideLabel,
} from '@/landing/features/matches/view/matchFormat'

import type { Match } from '../../src/payload-types'

const withCompetition = (competition: string | null): Match =>
  ({ id: 1, competition, date: '', updatedAt: '', createdAt: '' }) as unknown as Match

describe('phaseLabel', () => {
  it.each([
    // Formát synchronizace VČHL (ahl.cz): ročník - zkratka fáze
    ['VČHL 2.ročník - ZČ', 'Základní část'],
    ['VČHL 1.ročník - 2. ČF', 'Čtvrtfinále'],
    ['VČHL 1.ročník - 2. SF', 'Semifinále'],
    ['VČHL 1.ročník - F', 'Finále'],
    ['VČHL 1.ročník - O 3.', 'O 3. místo'],
    // Ruční texty z CMS (archiv) — beze změny proti dřívějšku
    ['VČHL 18. kolo', '18. kolo'],
    ['2. kolo OLLH play-off', '2. kolo'],
    ['14. kolo OLLH', '14. kolo'],
    ['VČHL', 'VČHL'],
    [null, 'VČHL'],
    ['Přátelské utkání', 'Přátelské'],
  ])('%s → %s', (competition, label) => {
    expect(phaseLabel(withCompetition(competition))).toBe(label)
  })

  it('neznámou zkratku za pomlčkou nehádá, jen dorovná mezeru u číslovky', () => {
    expect(phaseLabel(withCompetition('VČHL 2.ročník - XY'))).toBe('2. ročník - XY')
  })
})

describe('formatCompetition', () => {
  it.each([
    ['VČHL 2.ročník - ZČ', 'VČHL 2. ročník · Základní část'],
    ['VČHL 1.ročník - 2. SF', 'VČHL 1. ročník · Semifinále'],
    ['VČHL 1.ročník - O 3.', 'VČHL 1. ročník · O 3. místo'],
    ['VČHL 2.ročník', 'VČHL 2. ročník'],
    ['14. kolo OLLH', '14. kolo OLLH'],
    ['VČHL', 'VČHL'],
  ])('%s → %s', (raw, formatted) => {
    expect(formatCompetition(raw)).toBe(formatted)
  })

  it('prázdná hodnota je null — výchozí text volí volající', () => {
    expect(formatCompetition(null)).toBeNull()
    expect(formatCompetition('   ')).toBeNull()
  })
})

const played = (over: Partial<Match>): Match =>
  ({
    id: 1,
    date: '2026-01-10T17:00:00.000Z',
    updatedAt: '',
    createdAt: '',
    status: 'played',
    home: true,
    scoreOurs: 5,
    scoreOpp: 3,
    opponent: { id: 2, name: 'HC Zdar' },
    ...over,
  }) as unknown as Match

describe('orient', () => {
  it('doma: Čestice vlevo, skóre i třetiny beze změny', () => {
    const match = played({ thirds: [{ ours: 2, opp: 0 }] as Match['thirds'] })
    expect(orient(match)).toEqual({
      weAreHome: true,
      homeName: 'HC Čestice',
      awayName: 'HC Zdar',
      homeScore: 5,
      awayScore: 3,
      thirds: [{ home: 2, away: 0 }],
    })
  })

  it('venku: jména, skóre i třetiny se prohodí na domácí : hosté', () => {
    const match = played({ home: false, thirds: [{ ours: 2, opp: 0 }] as Match['thirds'] })
    expect(orient(match)).toMatchObject({
      weAreHome: false,
      homeName: 'HC Zdar',
      awayName: 'HC Čestice',
      homeScore: 3,
      awayScore: 5,
      thirds: [{ home: 0, away: 2 }],
    })
  })

  it('zápas bez skóre a bez soupeře: skóre null, soupeř „Soupeř"', () => {
    const match = played({ scoreOurs: null, scoreOpp: null, opponent: 7 })
    expect(orient(match)).toMatchObject({ awayName: 'Soupeř', homeScore: null, awayScore: null })
  })

  it('titulek a skóre řádku vycházejí ze stejného pořadí', () => {
    const away = played({ home: false })
    expect(matchTitle(away)).toBe('HC Zdar × HC Čestice')
    expect(matchScore(away)).toBe('3:5')
  })
})

describe('přípona skóre', () => {
  it('nájezdy mají přednost před prodloužením', () => {
    expect(scoreSuffix({ shootout: true, overtime: true })).toBe('sn')
    expect(scoreSuffix({ shootout: false, overtime: true })).toBe('pp')
    expect(scoreSuffix({ shootout: false, overtime: false })).toBe('')
  })

  it('poznámka k výsledku: přípona, jinak pojistka pro prohru po prodloužení', () => {
    expect(outcomeNote('win', 'sn')).toBe('po nájezdech')
    expect(outcomeNote('loss', 'pp')).toBe('po prodloužení')
    expect(outcomeNote('otLoss', '')).toBe('po prodloužení nebo nájezdech')
    expect(outcomeNote('win', '')).toBeNull()
    expect(outcomeNote(null, '')).toBeNull()
  })
})

describe('drobné popisky', () => {
  it('formatPair, sideLabel a competitionLabel', () => {
    expect(formatPair({ home: 3, away: 1 })).toBe('3:1')
    expect(sideLabel(true)).toBe('Doma')
    expect(sideLabel(false)).toBe('Venku')
    expect(competitionLabel({ competition: 'VČHL 2.ročník - ZČ' })).toBe(
      'VČHL 2. ročník · Základní část',
    )
    expect(competitionLabel({ competition: null })).toBe('VČHL')
  })
})
