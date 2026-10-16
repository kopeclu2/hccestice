import { describe, expect, it } from 'vitest'

import { CLUB_PREFIXES } from '@/lib/club'
import { initials, monogram, stripClubPrefix, teamCode } from '@/lib/teamName'

/* Původní podoby z `MatchScoreboard.tsx` (6 předpon) a `header-variants/shared.tsx` (8). */
const SCOREBOARD_PREFIXES = new Set(['HC', 'HK', 'SK', 'TJ', 'HHK', 'ZH'])
const legacyScoreboardMonogram = (name: string): string => {
  const words = name.split(/\s+/).filter(Boolean)
  const word = words.find((item) => !SCOREBOARD_PREFIXES.has(item.toUpperCase())) ?? words[0] ?? '?'
  return word.charAt(0).toUpperCase()
}
const SHARED_PREFIXES = new Set(['HC', 'HK', 'SK', 'TJ', 'HHK', 'ZH', 'HCM', 'SKP'])
const sharedKeyWord = (name: string): string => {
  const words = name.split(/\s+/).filter(Boolean)
  return words.find((word) => !SHARED_PREFIXES.has(word.toUpperCase())) ?? words[0] ?? '?'
}
const legacySharedMonogram = (name: string) => sharedKeyWord(name).charAt(0).toUpperCase()
const legacySharedTeamCode = (name: string) =>
  sharedKeyWord(name).slice(0, 3).toLocaleUpperCase('cs-CZ')

/* Původní iniciály: PartnerCard, PlayerTile, posts.ts. */
const legacyPartner = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
const legacyPlayer = (name: string): string =>
  name
    .split(' ')
    .filter((word) => word && !word.endsWith('.'))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
const legacyPostInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')

const TEAMS = [
  'HC Zdar',
  'hc zdar',
  'SK Žamberk',
  'TJ Sokol Voděrady',
  'HHK Velké Meziříčí',
  'ZH Pardubice',
  'HK Orli',
  'Polička B',
  'HC Aloha Lanškroun',
  'Čestice',
  'HC',
  'HC HC',
  '  HC   Polička  ',
  'Žďár',
  '',
  '   ',
]

describe('CLUB_PREFIXES', () => {
  it('je nadmnožina všech tří původních sad', () => {
    for (const prefix of [
      ...SHARED_PREFIXES,
      ...SCOREBOARD_PREFIXES,
      'HC',
      'SK',
      'ZH',
      'TJ',
      'HK',
    ]) {
      expect(CLUB_PREFIXES).toContain(prefix)
    }
  })
})

describe('monogram / teamCode', () => {
  it('shoduje se s variantou z header-variants/shared.tsx', () => {
    for (const name of [...TEAMS, 'HCM Orli', 'SKP Lány']) {
      expect(monogram(name), JSON.stringify(name)).toBe(legacySharedMonogram(name))
      expect(teamCode(name), JSON.stringify(name)).toBe(legacySharedTeamCode(name))
    }
  })

  it('shoduje se s monogramem z MatchScoreboard pro názvy bez HCM/SKP', () => {
    for (const name of TEAMS) {
      expect(monogram(name), JSON.stringify(name)).toBe(legacyScoreboardMonogram(name))
    }
  })

  it('konkrétní hodnoty', () => {
    expect(monogram('HC Zdar')).toBe('Z')
    expect(monogram('SK Žamberk')).toBe('Ž')
    expect(monogram('')).toBe('?')
    expect(monogram('HC')).toBe('H')
    expect(teamCode('HC Polička B')).toBe('POL')
    expect(teamCode('HC Čestice')).toBe('ČES')
    expect(teamCode('SK Ba')).toBe('BA')
  })

  it('nové předpony HCM a SKP monogram přeskočí (dřív jen v hlavičkách detailu)', () => {
    expect(monogram('HCM Orli')).toBe('O')
    expect(legacyScoreboardMonogram('HCM Orli')).toBe('H')
  })
})

describe('stripClubPrefix', () => {
  it('odstraní jednu úvodní předponu bez ohledu na velikost', () => {
    expect(stripClubPrefix('HC Polička B')).toBe('Polička B')
    expect(stripClubPrefix('hc policka b')).toBe('policka b')
    expect(stripClubPrefix('SK Žamberk')).toBe('Žamberk')
    expect(stripClubPrefix('HC HC Orli')).toBe('HC Orli')
  })

  it('nic neodstraní, když předpona není celé slovo nebo za ní nic nezbude', () => {
    expect(stripClubPrefix('HC')).toBe('HC')
    expect(stripClubPrefix('Hcxyz Orli')).toBe('Hcxyz Orli')
    expect(stripClubPrefix('Čestice')).toBe('Čestice')
    expect(stripClubPrefix('')).toBe('')
  })

  it('shoduje se s regexem z opponents.ts nad složeným klíčem pro původních pět předpon', () => {
    const legacy = (folded: string) => folded.replace(/^(hc|sk|zh|tj|hk)\s+/, '')
    for (const folded of [
      'hc policka b',
      'sk zamberk',
      'zh pardubice',
      'tj voderady',
      'hk orli',
      'cestice',
      'hc',
    ]) {
      expect(stripClubPrefix(folded), folded).toBe(legacy(folded))
    }
  })

  it('výchozí sada odstraní i HHK, HCM a SKP', () => {
    expect(stripClubPrefix('hhk velke mezirici')).toBe('velke mezirici')
  })

  it('předaná sada předpon přebije výchozí', () => {
    const five = ['HC', 'SK', 'ZH', 'TJ', 'HK']
    expect(stripClubPrefix('hhk velke mezirici', five)).toBe('hhk velke mezirici')
    expect(stripClubPrefix('hcm foo', five)).toBe('hcm foo')
    expect(stripClubPrefix('hc foo', five)).toBe('foo')
  })
})

describe('initials', () => {
  const NAMES = [
    'Lukáš Sajdl',
    'lukáš sajdl',
    'Jan Novák st.',
    'CIMIEL s.r.o.',
    'Madonna',
    'Jan Karel Novák',
    '',
  ]

  it('výchozí = iniciály prvních dvou slov velkými písmeny (posts.ts initialsOf)', () => {
    for (const name of [...NAMES, 'Jan  Novák', '  Jan Novák ']) {
      expect(initials(name), JSON.stringify(name)).toBe(legacyPostInitials(name))
    }
  })

  it('upper: false zachová velikost (PartnerCard)', () => {
    for (const name of NAMES) {
      expect(initials(name, { upper: false }), JSON.stringify(name)).toBe(legacyPartner(name))
    }
    expect(initials('CIMIEL s.r.o.', { upper: false })).toBe('Cs')
  })

  it('skipAbbreviations přeskočí slova s tečkou na konci (PlayerTile)', () => {
    for (const name of NAMES) {
      expect(initials(name, { skipAbbreviations: true, upper: false }), JSON.stringify(name)).toBe(
        legacyPlayer(name),
      )
    }
    expect(initials('Jan Novák st.', { skipAbbreviations: true })).toBe('JN')
    expect(initials('st. Jan Novák', { skipAbbreviations: true })).toBe('JN')
  })

  it('počet slov se dá změnit', () => {
    expect(initials('Jan Karel Novák', { words: 3 })).toBe('JKN')
    expect(initials('Jan Karel Novák', { words: 1 })).toBe('J')
  })

  it('víc mezer mezi slovy nevyrobí prázdné iniciály (PartnerCard je dřív bral jako slovo)', () => {
    expect(initials('Jan  Novák')).toBe('JN')
    expect(legacyPartner('Jan  Novák')).toBe('J')
  })
})
