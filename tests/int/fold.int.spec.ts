import { describe, expect, it } from 'vitest'

import { fold } from '@/lib/fold'
import { slugifyCs } from '@/lib/slugifyCs'

/**
 * `fold` nahradil sedm opsaných řádek. Tady jsou jejich původní podoby
 * (`legacy*`) a ověřuje se, že nad stejnými vstupy dávají tytéž výstupy.
 */
const legacyOurTeam = (s: string) =>
  s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim()
const legacyNormalizeName = legacyOurTeam
const legacyPlain = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
const legacyPhase = legacyPlain
const legacyList = legacyPlain
const legacyContentWords = legacyPlain
const legacyFoldTeam = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
const legacySlug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const INPUTS = [
  '',
  '   ',
  'Čestice',
  'HC Čestice',
  '  HC   Žďár n. S. ',
  'Kolář, Aleš   JUN',
  'Sajdl, Lukáš',
  'SK Žamberk',
  'HC Aloha Lanškroun',
  'ZH Pardubice',
  'ŘEŘICHA Ďábel Ťuk',
  'Příliš žluťoučký kůň úpěl ďábelské ódy',
  'a b  c',
  'tab\tsep\nnl',
  'VČHL 2.ročník - ZČ',
  'Play-off čtvrtfinále',
  '28. září -  4. října',
  ' – ',
  '???',
  'x́y',
  'Ünïcödé Ñandú',
  '1:0 (0:0, 1:0)',
]

describe('fold', () => {
  it('bez voleb odstraní diakritiku a zmenší písmena (ahl/parse, plainText)', () => {
    for (const input of INPUTS) {
      expect(fold(input), JSON.stringify(input)).toBe(legacyPlain(input))
      expect(fold(input)).toBe(legacyPhase(input))
      expect(fold(input)).toBe(legacyList(input))
      expect(fold(input)).toBe(legacyContentWords(input))
    }
  })

  it('collapseSpaces = ahl/ourTeam a ahl/names', () => {
    for (const input of INPUTS) {
      expect(fold(input, { collapseSpaces: true }), JSON.stringify(input)).toBe(
        legacyOurTeam(input),
      )
      expect(fold(input, { collapseSpaces: true })).toBe(legacyNormalizeName(input))
    }
  })

  it('alnumOnly = foldTeam z synchronizace soupeřů', () => {
    for (const input of INPUTS) {
      expect(fold(input, { alnumOnly: true }), JSON.stringify(input)).toBe(legacyFoldTeam(input))
    }
  })

  it('konkrétní hodnoty', () => {
    expect(fold('Žďár')).toBe('zdar')
    expect(fold('  Hc   ČESTICE ', { collapseSpaces: true })).toBe('hc cestice')
    expect(fold('HC Žďár n. S.', { alnumOnly: true })).toBe('hc zdar n s')
    expect(fold('')).toBe('')
  })

  it('alnumOnly už mezery slučuje, collapseSpaces s ním nic navíc nedělá', () => {
    for (const input of INPUTS) {
      expect(fold(input, { alnumOnly: true, collapseSpaces: true })).toBe(
        fold(input, { alnumOnly: true }),
      )
    }
  })
})

describe('slugifyCs nad fold', () => {
  it('je bajtově shodný s původní implementací', () => {
    for (const input of INPUTS) {
      expect(slugifyCs(input), JSON.stringify(input)).toBe(legacySlug(input))
    }
  })

  it('Žamberk → zamberk, HC Žďár → hc-zdar', () => {
    expect(slugifyCs('Žamberk')).toBe('zamberk')
    expect(slugifyCs('HC Žďár')).toBe('hc-zdar')
    expect(slugifyCs('SK Žamberk')).toBe('sk-zamberk')
    expect(slugifyCs('  HC   Orli (B)  ')).toBe('hc-orli-b')
  })

  it('prázdný nebo čistě symbolický text dá prázdný slug', () => {
    expect(slugifyCs('')).toBe('')
    expect(slugifyCs(' – ')).toBe('')
    expect(slugifyCs('???')).toBe('')
  })
})
