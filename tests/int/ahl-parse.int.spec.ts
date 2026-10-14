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

const sumMinutes = (ps: { minutes: number | null }[]) => ps.reduce((n, p) => n + (p.minutes ?? 0), 0)
const sumPim = (rows: { pim: number }[]) => rows.reduce((n, r) => n + r.pim, 0)

describe('ahl: tresty a statistika zápasu', () => {
  it('46616: tresty obou stran a statistika', () => {
    const d = parseMatchDetail(fx('zapas-46616.html'), 46616)
    const home = d.penalties!.filter((p) => p.side === 'home')
    const away = d.penalties!.filter((p) => p.side === 'away')
    expect(d.penalties).toHaveLength(13)
    expect(home).toHaveLength(6)
    expect(away).toHaveLength(7)
    expect(d.penalties![1]).toEqual({
      time: '8:18',
      side: 'home',
      teamCode: 'CES',
      player: { name: 'Jakub Všetečka', playerId: 44079 },
      playerText: null,
      code: '2',
      minutes: 2,
      kind: 'Menší trest',
      reason: 'Vysoká hůl',
    })
    expect(d.penalties![0]).toMatchObject({ side: 'away', teamCode: 'ZH', minutes: 2 })
    expect(d.stats).toEqual({
      penalties: { home: 6, away: 7 },
      majors: { home: 0, away: 0 },
      ppGoals: { home: 2, away: 2 },
      ppTime: { home: '7:39', away: '6:21' },
    })
    expect(sumMinutes(home)).toBe(sumPim(d.lineups.home))
    expect(sumMinutes(away)).toBe(sumPim(d.lineups.away))
    expect(sumMinutes(home)).toBe(12)
    expect(sumMinutes(away)).toBe(14)
  })

  it('46992: prázdný důvod je null, přípona JUN se z jména ořízne', () => {
    const d = parseMatchDetail(fx('zapas-46992.html'), 46992)
    const home = d.penalties!.filter((p) => p.side === 'home')
    const away = d.penalties!.filter((p) => p.side === 'away')
    expect(d.penalties).toHaveLength(19)
    expect(home).toHaveLength(8)
    expect(away).toHaveLength(11)
    expect(d.stats.penalties).toEqual({ home: 8, away: 11 })
    const vrba = d.penalties!.find((p) => p.time === '15:00' && p.player?.playerId === 37952)!
    expect(vrba.reason).toBeNull()
    expect(vrba.player?.name).toBe('Dominik Vrba')
    expect(vrba.side).toBe('away')
    expect(sumMinutes(home)).toBe(sumPim(d.lineups.home))
    expect(sumMinutes(away)).toBe(sumPim(d.lineups.away))
    expect(sumMinutes(home)).toBe(16)
    expect(sumMinutes(away)).toBe(22)
  })

  it('neodehraný zápas: žádné tresty, statistika samé null', () => {
    const d = parseMatchDetail(fx('zapas-46998-scheduled.html'), 46998)
    expect(d.penalties).toEqual([])
    expect(d.stats).toEqual({ penalties: null, majors: null, ppGoals: null, ppTime: null })
  })

  describe('syntetické řádky', () => {
    const base = fx('zapas-46616.html')
    const detail = parseMatchDetail(base, 46616)
    const awayPlayerId = detail.lineups.away.find((r) => r.playerId !== null)!.playerId!

    const row = (code: string, time: string, player: string, kind: string, reason = '') => `
<tr class="tabulka_radek_lichy">
	<td class="tabulka_team">${code}</td>
	<td class="tabulka_cas">${time}</td>
	<td class="tabulka_jmeno">${player}</td>
	<td class="tabulka_jmeno">${kind}&nbsp;</td>
	<td class="tabulka_jmeno">${reason}</td>
</tr>`
    const link = (id: number, name: string) =>
      `<a href="soutez/x/hrac/?hracid=${id}" class="local_nadpis_link">${name}</a>`
    // Řádky se vloží hned za <tbody> tabulky Tresty, takže jsou v poli první.
    const withRows = (rows: string) => {
      const cap = base.indexOf('Tresty</caption>')
      const at = base.indexOf('<tbody>', cap) + '<tbody>'.length
      return base.slice(0, at) + rows + base.slice(at)
    }

    it('větší trest a neznámý formát', () => {
      const d = parseMatchDetail(
        withRows(
          row('CES', '1:00', link(44079, 'Všetečka, Jakub'), '5 - Větší trest', 'Napadení') +
            row('CES', '2:00', link(44079, 'Všetečka, Jakub'), 'Osobní'),
        ),
        46616,
      )
      expect(d.penalties).toHaveLength(15)
      expect(d.penalties![0]).toMatchObject({ minutes: 5, kind: 'Větší trest', reason: 'Napadení', side: 'home' })
      expect(d.penalties![1]).toMatchObject({ code: null, minutes: null, kind: 'Osobní', reason: null, side: 'home' })
    })

    it('písmenný kód OK je trest do konce utkání za 20 minut, neznámý kód délku nemá', () => {
      const d = parseMatchDetail(
        withRows(
          row('CES', '1:00', link(44079, 'Všetečka, Jakub'), 'OK - Trest do konce utkání') +
            row('CES', '2:00', link(44079, 'Všetečka, Jakub'), 'XX - Něco'),
        ),
        46616,
      )
      expect(d.penalties![0]).toMatchObject({ code: 'OK', minutes: 20, kind: 'Trest do konce utkání', side: 'home' })
      expect(d.penalties![1]).toMatchObject({ code: 'XX', minutes: null, kind: 'Něco', side: 'home' })
    })

    it('řádek bez hráče dostane stranu z mapy kódů', () => {
      const d = parseMatchDetail(withRows(row('CES', '3:00', '', '2 - Menší trest', 'Střídání')), 46616)
      expect(d.penalties![0]).toMatchObject({ player: null, side: 'home', teamCode: 'CES' })
    })

    it('kód, který zná jen sestava, se naučí a platí i pro trest lavice', () => {
      const d = parseMatchDetail(
        withRows(
          row('QQQ', '3:00', '', '2 - Menší trest') +
            row('QQQ', '4:00', link(awayPlayerId, 'Někdo, Jiný'), '2 - Menší trest'),
        ),
        46616,
      )
      expect(d.penalties![0]).toMatchObject({ player: null, side: 'away', teamCode: 'QQQ' })
      expect(d.penalties![1].side).toBe('away')
    })

    // Chyba v trestech nesmí zahodit branky a sestavy.
    const expectPenaltiesDropped = (html: string, error: RegExp) => {
      const d = parseMatchDetail(html, 46616)
      expect(d.penalties).toBeNull()
      expect(d.penaltiesError).toMatch(error)
      expect(d.goals).toHaveLength(11)
      expect(d.lineups.home).toHaveLength(18)
      expect(d.stats.penalties).toEqual({ home: 6, away: 7 })
    }

    it('neznámý kód bez hráče zahodí jen tresty', () => {
      expectPenaltiesDropped(withRows(row('XYZ', '5:00', '', '2 - Menší trest')), /nelze určit stranu \(XYZ\)/)
    })

    it('nečitelný čas zahodí jen tresty', () => {
      expectPenaltiesDropped(withRows(row('CES', 'x', '', '2 - Menší trest')), /nečitelný řádek trestu/)
    })

    it('změněné záhlaví zahodí jen tresty', () => {
      const cap = base.indexOf('Tresty</caption>')
      const at = base.indexOf('Důvod', cap)
      const broken = base.slice(0, at) + 'Poznámka' + base.slice(at + 'Důvod'.length)
      expectPenaltiesDropped(broken, /neočekávané záhlaví/)
    })

    it('úspěšné parsování má penaltiesError null', () => {
      expect(detail.penaltiesError).toBeNull()
    })

    it('řádek bez odkazu nese jméno v playerText, prázdná buňka ne', () => {
      const d = parseMatchDetail(
        withRows(row('CES', '3:00', 'Novák, Petr', '2 - Menší trest') + row('CES', '4:00', '', '2 - Menší trest')),
        46616,
      )
      expect(d.penalties![0]).toMatchObject({ player: null, playerText: 'Petr Novák', side: 'home' })
      expect(d.penalties![1]).toMatchObject({ player: null, playerText: null })
      // s odkazem jméno nese `player`
      expect(detail.penalties![1]).toMatchObject({ playerText: null })
    })

    it('sestava si protiřečí s kódem z branek: tresty se zahodí', () => {
      // 44079 je v sestavě domácích, ZH je podle branek strana hostů
      expectPenaltiesDropped(
        withRows(row('ZH', '3:00', link(44079, 'Všetečka, Jakub'), '2 - Menší trest')),
        /patří straně away/,
      )
    })

    it('z branek je znám kód jen jedné strany: trest lavice s jiným kódem je druhá strana', () => {
      // Branky zredukované na první (domácí) a tresty jen na lavici soupeře.
      const gcap = base.indexOf('Branky</caption>')
      const gbody = base.indexOf('<tbody>', gcap) + '<tbody>'.length
      const firstRowEnd = base.indexOf('</tr>', gbody) + '</tr>'.length
      const goalsEnd = base.indexOf('</tbody>', gbody)
      const oneGoal = base.slice(0, firstRowEnd) + base.slice(goalsEnd)
      const tcap = oneGoal.indexOf('Tresty</caption>')
      const tbody = oneGoal.indexOf('<tbody>', tcap) + '<tbody>'.length
      const tend = oneGoal.indexOf('</tbody>', tbody)
      const html = oneGoal.slice(0, tbody) + row('ZH', '6:00', '', '2 - Menší trest') + oneGoal.slice(tend)
      const d = parseMatchDetail(html, 46616)
      expect(d.goals).toHaveLength(1)
      expect(d.penalties).toHaveLength(1)
      expect(d.penalties![0]).toMatchObject({ teamCode: 'ZH', side: 'away', player: null })
    })

    it('chybějící tabulka Tresty je prázdné pole', () => {
      const broken = base.replace('Tresty</caption>', 'Jiné</caption>')
      expect(parseMatchDetail(broken, 46616).penalties).toEqual([])
    })

    it('nečitelná hodnota statistiky je null, ostatní zůstávají', () => {
      const broken = base.replace(/(<td>Využití<\/td>\s*<td class="tabulka_komentar">)2:2/, '$1-')
      const d = parseMatchDetail(broken, 46616)
      expect(d.stats.ppGoals).toBeNull()
      expect(d.stats.penalties).toEqual({ home: 6, away: 7 })
    })
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
