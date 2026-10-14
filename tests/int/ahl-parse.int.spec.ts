import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  AhlParseError,
  displayName,
  isOurTeam,
  normalizeName,
  parseCompetitionInfo,
  parseMatchDetail,
  parseMatchList,
  parsePlayerStats,
  parseStandings,
} from '../../src/ahl'

const fx = (name: string) =>
  readFileSync(path.resolve(import.meta.dirname, '../fixtures/ahl', name), 'utf8')

describe('ahl: detail zápasu', () => {
  const d = parseMatchDetail(fx('zapas-46616.html'), 46616)

  it('hlavička', () => {
    expect(d.score).toEqual({ home: 5, away: 6, suffix: 'sn' })
    expect(d.periods).toEqual([
      { home: 0, away: 0 },
      { home: 3, away: 1 },
      { home: 2, away: 4 },
    ])
    expect(d.dateISO).toBe('2026-10-04T16:30:00')
    expect(d.venue).toBe('Rychnov nad Kněžnou')
    expect(d.competition).toBe('VČHL 2.ročník - ZČ')
    expect(d.phase).toBe('regular')
    expect(d.home.name).toBe('HC Čestice')
    expect(d.away.name).toBe('Závodní hokejová Pardubice')
    expect(d.hasReport).toBe(true)
  })

  it('branky', () => {
    expect(d.goals).toHaveLength(11)
    const g = d.goals[0]
    expect(g.time).toBe('30:41')
    expect(g.side).toBe('home')
    expect(g.scorer).toEqual({ name: 'Lukáš Sajdl', playerId: 38010 })
    expect(g.assists.map((a) => a.name)).toEqual(['Vojtěch Kapucián', 'Radim Sajdl'])
    expect(g.strength).toBe('5/4')
    expect(g.scoreAfter).toBe('1:0')
    expect(d.goals[1].side).toBe('away')
    expect(d.goals[2].assists).toEqual([])
  })

  it('sestavy', () => {
    expect(d.lineups.home).toHaveLength(18)
    const sajdl = d.lineups.home.find((r) => r.playerId === 38010)!
    expect(sajdl).toMatchObject({ goals: 2, assists: 2, points: 4, pim: 2, goalie: false })
    const hanak = d.lineups.home.find((r) => r.name === 'Miroslav Hanák')!
    expect(hanak.goalie).toBe(true)
    expect(d.lineups.home.filter((r) => r.goalie)).toHaveLength(1)
    expect(d.lineups.away.length).toBeGreaterThan(10)
  })
})

describe('ahl: detail zápasu - okrajové případy', () => {
  it('zápas, který má ve výpisu neni_zapis, ale stránka nese data', () => {
    const d = parseMatchDetail(fx('zapas-46992.html'), 46992)
    expect(d.score).toEqual({ home: 5, away: 4, suffix: 'sn' })
    expect(d.goals.length).toBeGreaterThan(0)
    expect(d.hasReport).toBe(true)
  })

  it('neodehraný zápas nemá skóre ani zápis', () => {
    const d = parseMatchDetail(fx('zapas-46998-scheduled.html'), 46998)
    expect(d.score).toBeNull()
    expect(d.periods).toEqual([])
    expect(d.hasReport).toBe(false)
    expect(d.goals).toEqual([])
    expect(d.lineups).toEqual({ home: [], away: [] })
    expect(d.dateISO).toBe('2026-10-17T17:00:00')
    expect(d.venue).toBe('Lanškroun')
  })

  it('chybová stránka ahl.cz a prázdný vstup hází AhlParseError', () => {
    const errorPage = `<html><head><title>požadavku nelze vyhovět | AHL.cz</title></head><body>${'<p>x</p>'.repeat(60)}</body></html>`
    expect(() => parseMatchDetail(errorPage, 1)).toThrow(AhlParseError)
    expect(() => parseMatchDetail('', 1)).toThrow(AhlParseError)
  })

  it('stránka jiného zápasu je chyba', () => {
    expect(() => parseMatchDetail(fx('zapas-46616.html'), 46617)).toThrow(AhlParseError)
  })
})

describe('ahl: tabulka', () => {
  const rows = parseStandings(fx('tabulky-1185.html'))
  it('10 týmů, Čestice šesté', () => {
    expect(rows).toHaveLength(10)
    const ces = rows.find((r) => r.participantId === 10181)!
    expect(ces).toMatchObject({
      pos: 6,
      team: 'HC Čestice',
      games: 2,
      wins: 0,
      otWins: 0,
      otLosses: 2,
      losses: 0,
      goalsFor: 12,
      goalsAgainst: 14,
      points: 2,
    })
  })
  it('chyby', () => {
    expect(() => parseStandings('')).toThrow(AhlParseError)
    expect(() => parseStandings(fx('vysledky-1185.html'))).toThrow(AhlParseError)
  })
  it('tabulka jiné fáze než základní část se nepoužije (žádný fallback na první tabulku)', () => {
    const playoff = fx('tabulky-1185.html').replace('Základní část', 'Play-off')
    expect(() => parseStandings(playoff)).toThrow(/základní části/)
  })
})

describe('ahl: výsledky', () => {
  const list = parseMatchList(fx('vysledky-1185.html'), { seasonStartYear: 2026 })
  it('obsahuje 46616 se zápisem a 46992 bez', () => {
    expect(list.find((m) => m.matchId === 46616)).toMatchObject({
      hasReport: true,
      dateISO: '2026-10-04T00:00:00',
      timeKnown: false,
      score: { home: 5, away: 6, suffix: 'sn' },
      competition: 'VČHL 2.ročník - ZČ',
      phase: 'regular',
    })
    const m = list.find((x) => x.matchId === 46992)!
    expect(m.hasReport).toBe(false)
    expect(m.score).toEqual({ home: 5, away: 4, suffix: 'sn' })
  })
  it('datum z nadpisu týdne, tým a místo', () => {
    const m = list.find((x) => x.matchId === 46996)!
    expect(m.dateISO).toBe('2026-10-11T00:00:00')
    expect(m.home).toEqual({ name: 'Divočáci', participantId: 10187 })
    expect(m.venue).toBe('Žamberk')
  })
  it('chyby', () => {
    expect(() => parseMatchList('', { seasonStartYear: 2026 })).toThrow(AhlParseError)
    expect(() => parseMatchList(fx('tabulky-1185.html'), { seasonStartYear: 2026 })).toThrow(AhlParseError)
  })
  it('špatný rok sezóny odhalí kontrola dne v týdnu', () => {
    expect(() => parseMatchList(fx('vysledky-1185.html'), { seasonStartYear: 2025 })).toThrow(AhlParseError)
  })
})

describe('ahl: rozpis', () => {
  const list = parseMatchList(fx('rozpis-1185.html'), { seasonStartYear: 2026 })
  it('Čestice - Divočáci 18. 10. 2026 16:30', () => {
    const m = list.find((x) => x.matchId === 46734)!
    expect(m).toMatchObject({
      dateISO: '2026-10-18T16:30:00',
      timeKnown: true,
      venue: 'Rychnov nad Kněžnou',
      score: null,
      hasReport: false,
    })
    expect(m.home).toEqual({ name: 'Čestice', participantId: 10181 })
    expect(m.away.name).toBe('Divočáci')
  })
  it('týden přes přelom měsíce a roku', () => {
    const dates = list.map((m) => m.dateISO)
    expect(dates.some((d) => d.startsWith('2026-11-01'))).toBe(true)
    expect(dates.some((d) => d.startsWith('2027-01-0'))).toBe(true)
    expect(list.every((m) => m.timeKnown)).toBe(true)
    expect(list).toHaveLength(55)
  })
})

describe('ahl: statistiky a ročník', () => {
  it('Sajdl 6 G, 5 A', () => {
    const stats = parsePlayerStats(fx('statistiky-10181.html'))
    const s = stats.find((p) => p.playerId === 38010)!
    expect(s).toMatchObject({ name: 'Lukáš Sajdl', games: 2, goals: 6, assists: 5, points: 11, pim: 2, goalie: false })
    expect(stats.filter((p) => p.goalie)).toHaveLength(3)
    expect(stats).toHaveLength(27)
    expect(() => parsePlayerStats('')).toThrow(AhlParseError)
  })

  it('autodetekce ID ze statistik, tabulky a výsledků (rozpis výběr ročníku nemá)', () => {
    for (const f of ['statistiky-10181.html', 'tabulky-1185.html', 'vysledky-1185.html']) {
      const info = parseCompetitionInfo(fx(f))
      expect(info.competitionYearId).toBe(1185)
      expect(info.label).toBe('VČHL 2.ročník')
      expect(info.participants.find((p) => /Čestice/.test(p.name))?.participantId).toBe(10181)
    }
    expect(parseCompetitionInfo(fx('statistiky-10181.html')).participants).toHaveLength(10)
    expect(() => parseCompetitionInfo(fx('zapas-46616.html'))).toThrow(AhlParseError)
  })
})

describe('ahl: jména', () => {
  it('normalizeName', () => {
    expect(normalizeName('Sajdl, Lukáš')).toBe('lukas sajdl')
    expect(normalizeName('Kolář, Aleš   JUN')).toBe('ales kolar')
    expect(normalizeName('Kapucián Vojtěch   S', 'last-first')).toBe('vojtech kapucian')
    expect(normalizeName('Dialog Vojtěch  SDor', 'last-first')).toBe('vojtech dialog')
    expect(normalizeName('Lukáš Sajdl', 'first-last')).toBe('lukas sajdl')
    // čárka má přednost před hintem
    expect(normalizeName('Sajdl, Lukáš', 'first-last')).toBe('lukas sajdl')
  })
  it('displayName', () => {
    expect(displayName('Sajdl, Lukáš')).toBe('Lukáš Sajdl')
    expect(displayName('Kapucián, Vojtěch   S')).toBe('Vojtěch Kapucián')
    expect(displayName('Sajdl Lukáš')).toBe('Lukáš Sajdl')
  })
  it('isOurTeam', () => {
    for (const n of ['Čestice', 'HC Čestice', 'CES', 'cestice', 'hc  CESTICE']) expect(isOurTeam(n)).toBe(true)
    for (const n of ['Pardubice', 'Litomyšl B', '']) expect(isOurTeam(n)).toBe(false)
  })
})
