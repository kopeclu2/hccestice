import { describe, expect, it } from 'vitest'

import { buildLlmsTxt, clubSummary, type LlmsInput } from '@/lib/llmsTxt'

const base: LlmsInput = {
  siteUrl: 'https://example.cz',
  email: 'klub@example.cz',
  pages: [],
  posts: [],
  galleries: [],
  results: [],
  fixtures: [],
}

const many = (count: number, prefix: string) =>
  Array.from({ length: count }, (_, index) => ({
    path: `/${prefix}/${index}`,
    title: `${prefix} ${index}`,
    note: 'popis',
  }))

describe('llms.txt', () => {
  it('začíná shrnutím klubu a kontaktem, ne seznamem odkazů', () => {
    const text = buildLlmsTxt(base)
    const lines = text.split('\n')

    expect(lines[0]).toBe('# HC Čestice')
    expect(lines[2]).toMatch(/^> HC Čestice je hokejový oddíl/)
    expect(lines[2]).toContain('1954')
    expect(lines[2]).toContain('Východočeská hokejová liga')
    expect(lines[2]).toContain('Javornická 1648')
    expect(text).toContain('- Kontakt: klub@example.cz')
    expect(text).toContain('IČO 48616061')
    // Shrnutí je před první sekcí odkazů.
    expect(text.indexOf('> ')).toBeLessThan(text.indexOf('## '))
  })

  it('shrnutí bere fakta z konstant klubu', () => {
    expect(clubSummary('a@b.cz').join('\n')).toContain('TJ Sokol Čestice, z.s.')
  })

  it('vždy vypíše sekce webu včetně tréninků a kontaktu', () => {
    const text = buildLlmsTxt(base)

    expect(text).toContain('[Tréninky](https://example.cz/treninky)')
    expect(text).toContain('[Kontakt](https://example.cz/kontakt)')
    expect(text).toContain('[Soupiska](https://example.cz/soupiska)')
  })

  it('prázdné sekce nevypisuje', () => {
    const text = buildLlmsTxt(base)

    for (const heading of ['Nejbližší zápasy', 'Poslední výsledky', 'Aktuality', 'Fotoalba']) {
      expect(text).not.toContain(`## ${heading}`)
    }
  })

  it('odkazy skládá z cesty a popis dává za dvojtečku', () => {
    const text = buildLlmsTxt({
      ...base,
      fixtures: [
        {
          path: '/zapasy/2027-01-10-hc-zdar',
          title: 'HC Čestice × HC Žďár',
          note: '10. 1. 2027 17:00',
        },
      ],
      results: [
        {
          path: '/zapasy/2026-10-04-sk-zamberk',
          title: 'SK Žamberk × HC Čestice',
          note: '4. 10. 2026, skóre 2:5',
        },
      ],
      posts: [{ path: '/aktuality/clanek', title: 'Článek', note: 'O čem to je' }],
    })

    expect(text).toContain(
      '- [HC Čestice × HC Žďár](https://example.cz/zapasy/2027-01-10-hc-zdar): 10. 1. 2027 17:00',
    )
    expect(text).toContain('skóre 2:5')
    expect(text).toContain('Skóre je z pohledu HC Čestice')
    expect(text).toContain('- [Článek](https://example.cz/aktuality/clanek): O čem to je')
  })

  it('položka bez poznámky nemá visící dvojtečku', () => {
    const text = buildLlmsTxt({ ...base, pages: [{ path: '/a', title: 'A', note: null }] })

    expect(text).toContain('- [A](https://example.cz/a)\n')
  })

  it('soubor zůstává pod 120 řádky i při plných limitech', () => {
    const text = buildLlmsTxt({
      ...base,
      pages: many(5, 'p'),
      posts: many(30, 'a'),
      galleries: many(10, 'g'),
      results: many(5, 'r'),
      fixtures: many(5, 'f'),
    })

    expect(text.split('\n').length).toBeLessThan(120)
  })
})
