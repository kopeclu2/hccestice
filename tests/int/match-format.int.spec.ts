import type { Match } from '../../src/payload-types'

import { describe, expect, it } from 'vitest'

import { formatCompetition, phaseLabel } from '../../src/landing/data/matchFormat'

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
