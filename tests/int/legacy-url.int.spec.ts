import { describe, expect, it } from 'vitest'

import {
  legacyClankyCandidates,
  legacyClankyFallback,
  legacyFotoalbumFallback,
} from '@/lib/legacyUrl'

describe('legacyClankyCandidates', () => {
  it('zanořenou adresu zkouší celou a pak plochou', () => {
    expect(
      legacyClankyCandidates([
        'archivy',
        '2015---2016',
        'muzi',
        'zapasy',
        'ksm-2.cast---sk-trebechovice-x-hc-cestice---9.3.2016.html',
      ]),
    ).toEqual([
      '/clanky/archivy/2015---2016/muzi/zapasy/ksm-2.cast---sk-trebechovice-x-hc-cestice---9.3.2016.html',
      '/clanky/ksm-2.cast---sk-trebechovice-x-hc-cestice---9.3.2016.html',
    ])
  })

  it('plochá adresa má jediného kandidáta', () => {
    expect(legacyClankyCandidates(['historie-klubu.html'])).toEqual(['/clanky/historie-klubu.html'])
  })

  it('prázdná cesta nemá kandidáty', () => {
    expect(legacyClankyCandidates([])).toEqual([])
  })
})

describe('legacyClankyFallback', () => {
  it('indexy archivu a sekcí jdou na výpis aktualit', () => {
    expect(legacyClankyFallback(['archivy'])).toBe('/aktuality')
    expect(legacyClankyFallback(['archivy', '2015---2016'])).toBe('/aktuality')
    expect(legacyClankyFallback(['muzi'])).toBe('/aktuality')
    expect(legacyClankyFallback(['hokej-vchl'])).toBe('/aktuality')
  })

  it('výsledky a tabulky jdou na zápasy, soupisky na soupisku', () => {
    expect(legacyClankyFallback(['archivy', '2016---2017', 'muzi', 'celkove-vysledky'])).toBe(
      '/zapasy',
    )
    expect(legacyClankyFallback(['muzi', 'tabulka-2026---2027'])).toBe('/zapasy')
    expect(legacyClankyFallback(['muzi', 'o-zapasech-2026---2027'])).toBe('/zapasy')
    expect(legacyClankyFallback(['muzi', 'soupiska-2026--2027'])).toBe('/soupiska')
  })

  it('konkrétní článek (.html) bez přesměrování zůstává 404', () => {
    expect(legacyClankyFallback(['archivy', '2015---2016', 'chybi.html'])).toBeNull()
    expect(legacyClankyFallback(['chybi.HTM'])).toBeNull()
  })
})

describe('legacyFotoalbumFallback', () => {
  it('index sezóny nebo kategorie jde na výpis galerií', () => {
    expect(legacyFotoalbumFallback(['2006---2007'])).toBe('/fotogalerie')
    expect(legacyFotoalbumFallback(['2014-2015', 'muzi'])).toBe('/fotogalerie')
  })

  it('detail fotky a interní úložiště editoru bez přesměrování zůstávají 404', () => {
    expect(legacyFotoalbumFallback(['2012-2013', 'album', 'img_4500.html'])).toBeNull()
    expect(legacyFotoalbumFallback(['__admin__', 'weby-souperu'])).toBeNull()
  })
})
