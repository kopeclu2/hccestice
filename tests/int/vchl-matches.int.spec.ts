import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { parseMatchDetail, parseMatchList } from '../../src/ahl'
import { buildPatch } from '../../src/jobs/vchlSync/diff'
import {
  buildGoals,
  buildLineup,
  buildMatchStats,
  buildPenalties,
  buildThirds,
  DETAIL_VERSION,
  ourCandidates,
  ourSide,
  penaltyMinutesMismatch,
} from '../../src/jobs/vchlSync/sync/matchDetail'
import {
  ahlNeedsWrite,
  desiredStatus,
  isDetailOutdated,
  nextDetailVersion,
  isReschedule,
  mergeLists,
  pairLegacy,
  resolveMatchDate,
  shouldFetchDetail,
} from '../../src/jobs/vchlSync/sync/matches'
import { foldTeam, opponentKeys } from '../../src/jobs/vchlSync/sync/opponents'
import { stripClubPrefix } from '../../src/lib/teamName'

const fx = (name: string) =>
  readFileSync(path.resolve(import.meta.dirname, '../fixtures/ahl', name), 'utf8')
const detail = parseMatchDetail(fx('zapas-46616.html'), 46616)
const players = { idFor: (id: number | null) => (id === 38010 ? 24 : null) }
const detail2 = parseMatchDetail(fx('zapas-46992.html'), 46992)
const idPlayers = { idFor: (id: number | null) => id }

describe('vchl zápasy: sestavení z detailu', () => {
  it('třetiny jen z prvních tří period, z pohledu Čestic', () => {
    expect(buildThirds(detail, 'home')).toEqual([
      { ours: 0, opp: 0 },
      { ours: 3, opp: 1 },
      { ours: 2, opp: 4 },
    ])
    expect(buildThirds(detail, 'away')[1]).toEqual({ ours: 1, opp: 3 })
  })

  it('branky: strana, vazby jen u našich, skóre ve tvaru naše:soupeř', () => {
    const goals = buildGoals(detail, 'home', players)
    expect(goals).toHaveLength(11)
    expect(goals[0]).toMatchObject({
      side: 'ours',
      scorer: 24,
      scorerName: 'Lukáš Sajdl',
      scoreAfter: '1:0',
    })
    expect(goals[1]).toMatchObject({ side: 'opp', scorer: null, scorerName: 'Roman Fuks' })
    const away = buildGoals(detail, 'away', players)
    expect(away[0]).toMatchObject({ side: 'opp', scoreAfter: '0:1' })
  })

  it('rozhodující nájezd (60:00 u sn) má strength SN', () => {
    const last = buildGoals(detail, 'home', players).at(-1)!
    expect(last).toMatchObject({ time: '60:00', strength: 'SN' })
    // branky ze hry ve stejném zápase si svůj stav ponechají
    expect(buildGoals(detail, 'home', players)[0].strength).toBe('5/4')
  })

  it('sestava jen našeho týmu', () => {
    const lineup = buildLineup(detail, 'home', players)
    expect(lineup).toHaveLength(18)
    expect(lineup.filter((r) => r.goalie)).toHaveLength(1)
  })

  it('kandidáti na hráče zahrnují sestavu i střelce a asistenty', () => {
    const c = ourCandidates(detail, 'home')
    expect(c.some((x) => x.ahlPlayerId === 38010 && x.number != null)).toBe(true)
    expect(c.some((x) => x.name === 'Roman Fuks')).toBe(false)
  })

  it('idempotence: stejný detail dvakrát = žádný patch', () => {
    const build = () => ({
      thirds: buildThirds(detail, 'home'),
      goals: buildGoals(detail, 'home', players),
      lineup: buildLineup(detail, 'home', players),
    })
    // „DB" po zápisu: relace jako id, řádky s vlastním id, null místo chybějících hodnot
    const stored = JSON.parse(JSON.stringify(build()))
    for (const k of ['thirds', 'goals', 'lineup'] as const) {
      stored[k] = stored[k].map((row: object, i: number) => ({ id: `row${i}`, ...row }))
    }
    expect(buildPatch(stored, build()).fields).toEqual([])
  })
})

describe('vchl zápasy: tresty a statistika', () => {
  it('tresty jen Čestic, s vazbou na hráče', () => {
    const rows = buildPenalties(detail, 'home', idPlayers)
    expect(rows).toHaveLength(6)
    expect(rows.every((r) => r.player != null)).toBe(true)
    expect(rows.find((r) => r.time === '8:18')).toEqual({
      time: '8:18',
      minutes: 2,
      kind: 'Menší trest',
      reason: 'Vysoká hůl',
      player: 44079,
      playerName: 'Jakub Všetečka',
    })
    expect(rows.some((r) => r.playerName === 'Roman Fuks')).toBe(false)
  })

  it('tresty hostů: 46992 z pohledu hostujícího týmu', () => {
    expect(detail2.away.name).toMatch(/Divo/)
    const rows = buildPenalties(detail2, 'away', idPlayers)
    expect(rows).toHaveLength(11)
    expect(
      detail2.penalties!.filter((p) => p.side === 'away').every((p) => p.teamCode === 'DIV'),
    ).toBe(true)
    expect(buildPenalties(detail2, 'home', idPlayers)).toHaveLength(8)
  })

  it('nespárovaný hráč nechá vazbu prázdnou, jméno zůstane', () => {
    const rows = buildPenalties(detail, 'home', { idFor: () => null })
    expect(rows.every((r) => r.player === null && r.playerName)).toBe(true)
  })

  it('kandidáti na hráče zahrnují i hráče z trestů', () => {
    const only = { ...detail, goals: [], lineups: { home: [], away: [] } }
    expect(ourCandidates(only, 'home').map((c) => c.ahlPlayerId)).toContain(44079)
    expect(ourCandidates(only, 'away').map((c) => c.name)).not.toContain('Jakub Všetečka')
  })

  it('kandidáti z trestů: hráč ze sestavy se nezdvojuje, trest bez hracid nezakládá hráče', () => {
    const base = detail.penalties!.find((p) => p.side === 'home' && p.player?.playerId === 44079)!
    const inLineup = detail.lineups.home.find((r) => r.playerId != null)!
    const pen = (player: typeof base.player) => ({ ...base, player })
    const d = {
      ...detail,
      goals: [],
      penalties: [
        pen({ name: inLineup.name, playerId: inLineup.playerId }),
        pen({ name: 'Trenér Bez Id', playerId: null }),
        pen(null),
        pen({ name: 'Host Z Trestu', playerId: 99999 }),
      ],
    }
    const out = ourCandidates(d, 'home')
    expect(out.filter((c) => c.ahlPlayerId === inLineup.playerId)).toHaveLength(1)
    expect(out.some((c) => c.name === 'Trenér Bez Id')).toBe(false)
    expect(out.some((c) => c.ahlPlayerId === 99999)).toBe(true)
  })

  it('nečitelná tabulka trestů (null): helpery to unesou', () => {
    const broken = { ...detail, penalties: null, penaltiesError: 'chybí tabulka' } as never
    expect(buildPenalties(broken, 'home', idPlayers)).toEqual([])
    expect(penaltyMinutesMismatch(broken, 'home')).toBeNull()
    expect(ourCandidates(broken, 'home').length).toBeGreaterThan(0)
  })

  it('trest bez odkazu na hráče bere jméno z textu buňky', () => {
    const base = detail.penalties!.find((p) => p.side === 'home')!
    const d = {
      ...detail,
      penalties: [{ ...base, player: null, playerText: 'Trenér Novák' }],
    } as never
    expect(buildPenalties(d, 'home', idPlayers)[0]).toMatchObject({
      player: null,
      playerName: 'Trenér Novák',
    })
  })

  it('statistika se otáčí na naše:soupeř', () => {
    expect(buildMatchStats(detail, 'home')).toEqual({
      penaltiesOurs: 6,
      penaltiesOpp: 7,
      majorsOurs: 0,
      majorsOpp: 0,
      ppGoalsOurs: 2,
      ppGoalsOpp: 2,
      ppTimeOurs: '7:39',
      ppTimeOpp: '6:21',
    })
    expect(buildMatchStats(detail, 'away')).toEqual({
      penaltiesOurs: 7,
      penaltiesOpp: 6,
      majorsOurs: 0,
      majorsOpp: 0,
      ppGoalsOurs: 2,
      ppGoalsOpp: 2,
      ppTimeOurs: '6:21',
      ppTimeOpp: '7:39',
    })
  })

  it('chybějící statistika → samé null', () => {
    const none = {
      ...detail,
      stats: { penalties: null, majors: null, ppGoals: null, ppTime: null },
    }
    const stats = buildMatchStats(none, 'home')
    expect(Object.keys(stats)).toHaveLength(8)
    expect(Object.values(stats).every((v) => v === null)).toBe(true)
  })

  it('součet minut trestů sedí se sestavou; po úpravě vrátí čísla', () => {
    expect(ourSide(detail)).toBe('home')
    expect(penaltyMinutesMismatch(detail, 'home')).toBeNull()
    expect(penaltyMinutesMismatch(detail, 'away')).toBeNull()
    expect(penaltyMinutesMismatch(detail2, 'away')).toBeNull()
    expect(penaltyMinutesMismatch(detail2, 'home')).toBeNull()
    const idx = detail.penalties!.findIndex((p) => p.side === 'home' && p.minutes === 2)
    const cut = { ...detail, penalties: detail.penalties!.filter((_, i) => i !== idx) }
    expect(penaltyMinutesMismatch(cut, 'home')).toEqual({ penalties: 10, pim: 12 })
    // minuty null se ignorují
    const nulled = {
      ...detail,
      penalties: detail.penalties!.map((p, i) => (i === idx ? { ...p, minutes: null } : p)),
    }
    expect(penaltyMinutesMismatch(nulled, 'home')).toEqual({ penalties: 10, pim: 12 })
  })

  it('idempotence: stav z DB (stats objekt, řádky s id, relace jako id) = žádný patch', () => {
    const build = () => ({
      penalties: buildPenalties(detail, 'home', idPlayers),
      stats: buildMatchStats(detail, 'home'),
    })
    const stored = JSON.parse(JSON.stringify(build()))
    stored.penalties = stored.penalties.map((row: object, i: number) => ({ id: `row${i}`, ...row }))
    // Payload u skupiny vrací klíče v jiném pořadí
    stored.stats = Object.fromEntries(Object.entries(stored.stats).reverse())
    expect(buildPatch(stored, build()).fields).toEqual([])
  })

  it('stats: samé null vs. objekt z DB s null / chybějící skupina = shoda', () => {
    const none = {
      ...detail,
      stats: { penalties: null, majors: null, ppGoals: null, ppTime: null },
    }
    const desired = { stats: buildMatchStats(none, 'home') }
    expect(buildPatch({ stats: { penaltiesOurs: null, ppTimeOpp: null } }, desired).fields).toEqual(
      [],
    )
    expect(buildPatch({}, desired).fields).toEqual([])
  })

  it('nula není prázdná hodnota: 0 vyloučení vs. chybějící statistika se liší', () => {
    const desired = { stats: buildMatchStats(detail, 'home') }
    expect(buildPatch({ stats: { penaltiesOurs: null } }, desired).fields).toEqual(['stats'])
    const stored = { stats: { ...desired.stats, majorsOurs: 0 } }
    expect(buildPatch(stored, desired).fields).toEqual([])
  })

  it('zápas bez trestů: prázdné pole vs. prázdné pole z DB = shoda', () => {
    const none = { ...detail, penalties: [] }
    expect(
      buildPatch({ penalties: [] }, { penalties: buildPenalties(none, 'home', idPlayers) }).fields,
    ).toEqual([])
    expect(buildPatch({}, { penalties: buildPenalties(none, 'home', idPlayers) }).fields).toEqual(
      [],
    )
  })

  it('pořadí řádků nezávisí na pořadí v HTML (AHL u shody příjmení pořadí nedrží)', () => {
    const shuffled = {
      ...detail,
      lineups: { ...detail.lineups, home: [...detail.lineups.home].reverse() },
      penalties: [...detail.penalties!].reverse(),
    }
    expect(buildLineup(shuffled, 'home', idPlayers)).toEqual(buildLineup(detail, 'home', idPlayers))
    expect(buildPenalties(shuffled, 'home', idPlayers)).toEqual(
      buildPenalties(detail, 'home', idPlayers),
    )
    const desired = {
      lineup: buildLineup(detail, 'home', idPlayers),
      penalties: buildPenalties(detail, 'home', idPlayers),
    }
    const other = {
      lineup: buildLineup(shuffled, 'home', idPlayers),
      penalties: buildPenalties(shuffled, 'home', idPlayers),
    }
    expect(buildPatch(other, desired).fields).toEqual([])
  })

  it('stejné příjmení: řádky se stejným číslem/jménem se řadí deterministicky', () => {
    const row = (name: string, playerId: number, number: number) =>
      ({
        ...detail.lineups.home[0],
        name,
        playerId,
        number,
        goalie: false,
      }) as (typeof detail.lineups.home)[number]
    const a = [row('Jakub Javůrek', 1, 7), row('Jan Javůrek', 2, 7), row('Matěj Vašata', 3, 9)]
    const mk = (rows: typeof a) => ({ ...detail, lineups: { ...detail.lineups, home: rows } })
    expect(buildLineup(mk([a[1], a[0], a[2]]), 'home', idPlayers)).toEqual(
      buildLineup(mk(a), 'home', idPlayers),
    )
    // číslo null na konec
    const noNum = { ...a[2], number: null } as (typeof a)[number]
    expect(buildLineup(mk([noNum, a[0]]), 'home', idPlayers).map((r) => r.number)).toEqual([
      7,
      null,
    ])
  })

  it('tresty se řadí podle času numericky (9:59 před 10:00)', () => {
    const pen = (time: string) => ({ ...detail.penalties!.find((p) => p.side === 'home')!, time })
    const d = { ...detail, penalties: [pen('10:00'), pen('9:59'), pen('2:05')] }
    expect(buildPenalties(d, 'home', idPlayers).map((r) => r.time)).toEqual([
      '2:05',
      '9:59',
      '10:00',
    ])
  })

  it('zastaralá verze: jen zápas se zápisem a nižší verzí (null = 1)', () => {
    const doc = (ahl: object) => ({ ahl }) as never
    expect(isDetailOutdated(doc({ hasReport: true }))).toBe(true)
    expect(isDetailOutdated(doc({ hasReport: true, detailVersion: 1 }))).toBe(true)
    expect(isDetailOutdated(doc({ hasReport: true, detailVersion: DETAIL_VERSION }))).toBe(false)
    expect(isDetailOutdated(doc({ hasReport: false }))).toBe(false)
    expect(isDetailOutdated(null)).toBe(false)
  })

  it('verze po zápisu: detail zvedne, bez detailu zůstane uložená hodnota (i null)', () => {
    const doc = (v: number | null) => ({ ahl: { detailVersion: v } }) as never
    expect(nextDetailVersion(doc(null), detail)).toBe(DETAIL_VERSION)
    expect(nextDetailVersion(null, detail)).toBe(DETAIL_VERSION)
    expect(nextDetailVersion(doc(null), null)).toBeNull()
    expect(nextDetailVersion(doc(1), null)).toBe(1)
    expect(nextDetailVersion(doc(DETAIL_VERSION), null)).toBe(DETAIL_VERSION)
  })

  it('samotná změna verze vede k zápisu `ahl`; druhý běh už ne', () => {
    const next = { matchId: 46616, hasReport: true, detailVersion: DETAIL_VERSION }
    const old = { ahl: { matchId: 46616, hasReport: true, detailVersion: null } } as never
    expect(ahlNeedsWrite(old, next)).toBe(true)
    const done = {
      ahl: { matchId: 46616, hasReport: true, detailVersion: DETAIL_VERSION },
    } as never
    expect(ahlNeedsWrite(done, next)).toBe(false)
    expect(ahlNeedsWrite(null, next)).toBe(true)
    expect(ahlNeedsWrite(done, { ...next, hasReport: false })).toBe(true)
    expect(ahlNeedsWrite(done, { ...next, matchId: 1 })).toBe(true)
    // zápas bez detailu v tomto běhu: verze se nemění
    expect(ahlNeedsWrite(old, { ...next, detailVersion: nextDetailVersion(old, null) })).toBe(false)
  })

  it('verze zpracování je alespoň 2 (tresty a statistika)', () => {
    expect(DETAIL_VERSION).toBeGreaterThanOrEqual(2)
  })
})

describe('vchl zápasy: seznamy a datum', () => {
  const rozpis = parseMatchList(fx('rozpis-1185.html'), { seasonStartYear: 2026 })
  const vysledky = parseMatchList(fx('vysledky-1185.html'), { seasonStartYear: 2026 })
  const entries = mergeLists({ rozpis, vysledky })

  it('jen zápasy Čestic', () => {
    expect(entries.length).toBeGreaterThan(0)
    expect(entries.length).toBeLessThan(rozpis.length + vysledky.length)
  })

  it('čas z rozpisu → UTC s DST', () => {
    const e = entries.find((x) => x.matchId === 46734)!
    expect(resolveMatchDate(e, null, null).toISOString()).toBe('2026-10-18T14:30:00.000Z')
  })

  it('výsledky čas nemají: u existujícího zápasu se čas nepřepíše půlnocí', () => {
    const e = entries.find((x) => x.matchId === 46616)!
    expect(e.vysledky?.timeKnown).toBe(false)
    const existing = { date: '2026-10-04T14:30:00.000Z' }
    expect(resolveMatchDate(e, null, existing as never).toISOString()).toBe(
      '2026-10-04T14:30:00.000Z',
    )
    // s detailem (má čas) vyhrává detail
    expect(resolveMatchDate(e, detail, null).toISOString()).toBe('2026-10-04T14:30:00.000Z')
  })

  it('přeložený termín: stejné ID, jiný den → nový den se starým časem', () => {
    const e = entries.find((x) => x.matchId === 46616)!
    const existing = { date: '2026-10-03T14:30:00.000Z' }
    expect(resolveMatchDate(e, null, existing as never).toISOString()).toBe(
      '2026-10-04T14:30:00.000Z',
    )
  })
})

describe('vchl legacy párování', () => {
  const vysledky = parseMatchList(fx('vysledky-1185.html'), { seasonStartYear: 2026 })
  const entry = mergeLists({ rozpis: null, vysledky }).find((x) => x.matchId === 46616)! // doma, Pardubice 5:6
  const opp = {
    byId: (id: number) =>
      (id === 11 ? { id: 11, name: 'ZH Pardubice' } : { id: 99, name: 'Jiný' }) as never,
  }
  const doc = (over: object) =>
    ({ id: 1, date: '2026-10-04T14:30:00.000Z', home: true, opponent: 11, ...over }) as never

  it('podle dne a soupeře („Pardubice" ↔ „ZH Pardubice")', () => {
    expect(pairLegacy(entry, [doc({})], opp)).toMatchObject({ id: 1 })
  })

  it('jiný den nespáruje', () => {
    expect(pairLegacy(entry, [doc({ date: '2026-10-05T14:30:00.000Z' })], opp)).toBeNull()
  })

  it('den se počítá v Europe/Prague (22:30 UTC je už další den)', () => {
    expect(pairLegacy(entry, [doc({ date: '2026-10-03T22:30:00.000Z' })], opp)).toMatchObject({
      id: 1,
    })
  })

  it('jiný soupeř jen při jediném zápase ten den, stejné straně a neodporujícím skóre', () => {
    const other = doc({ opponent: 99 })
    expect(pairLegacy(entry, [other], opp)).toMatchObject({ id: 1 })
    expect(pairLegacy(entry, [doc({ opponent: 99, scoreOurs: 1, scoreOpp: 0 })], opp)).toBeNull()
    expect(pairLegacy(entry, [doc({ opponent: 99, home: false })], opp)).toBeNull()
  })
})

describe('vchl soupeři', () => {
  it('normalizace názvů', () => {
    expect(foldTeam('HC Spartak Polička "B"')).toBe('hc spartak policka b')
    expect(stripClubPrefix('zh pardubice')).toBe('pardubice')
  })

  it('klíče z názvu a aliasů', () => {
    const k = opponentKeys({
      name: 'ZH Pardubice',
      aliases: [{ name: 'Závodní hokejová Pardubice' }],
    } as never)
    expect(k.has('pardubice')).toBe(true)
    expect(k.has('zavodni hokejova pardubice')).toBe(true)
  })
})

describe('vchl: přeložení termínu', () => {
  it('doplnění času u zápasu založeného na půlnoc není přeložení', () => {
    // 00:00 Prague (SELČ) = 22:00 UTC předchozího dne
    expect(isReschedule('2026-10-03T22:00:00.000Z', '2026-10-04T14:30:00.000Z')).toBe(false)
  })
  it('změna dne je přeložení, i když byl čas neznámý', () => {
    expect(isReschedule('2026-10-03T22:00:00.000Z', '2026-10-11T14:30:00.000Z')).toBe(true)
  })
  it('změna známého času je přeložení', () => {
    expect(isReschedule('2026-10-04T14:30:00.000Z', '2026-10-04T16:00:00.000Z')).toBe(true)
  })
  it('stejný okamžik není přeložení', () => {
    expect(isReschedule('2026-10-04T14:30:00.000Z', '2026-10-04T14:30:00.000Z')).toBe(false)
  })
})

describe('vchl: stav zápasu', () => {
  it('skóre → played', () => {
    expect(desiredStatus('scheduled', true, false)).toBe('played')
  })
  it('odehraný zápas se bez skóre ve výpisu nevrací na scheduled', () => {
    expect(desiredStatus('played', false, true)).toBeUndefined()
  })
  it('zrušený zůstává; nový a naplánovaný jde na scheduled', () => {
    expect(desiredStatus('canceled', false, true)).toBeUndefined()
    expect(desiredStatus(undefined, false, true)).toBe('scheduled')
    expect(desiredStatus('scheduled', false, true)).toBe('scheduled')
  })
  it('bez řádku v rozpisu se stav bez skóre neřeší', () => {
    expect(desiredStatus('scheduled', false, false)).toBeUndefined()
  })
})

describe('vchl: stahování detailu', () => {
  const base = { played: true, recent: false, hasReport: false, outdated: false }
  it('neodehraný se nestahuje (ani zastaralý)', () => {
    expect(shouldFetchDetail({ ...base, played: false, recent: true, trigger: 'manual' })).toBe(
      false,
    )
    expect(
      shouldFetchDetail({
        ...base,
        played: false,
        hasReport: true,
        outdated: true,
        trigger: 'manual',
      }),
    ).toBe(false)
  })
  it('čerstvý odehraný vždy (i se zápisem, i z cronu)', () => {
    expect(shouldFetchDetail({ ...base, recent: true, hasReport: true, trigger: 'cron' })).toBe(
      true,
    )
  })
  it('starý bez zápisu: cron ne, ruční a nanečisto ano', () => {
    expect(shouldFetchDetail({ ...base, trigger: 'cron' })).toBe(false)
    expect(shouldFetchDetail({ ...base, trigger: 'manual' })).toBe(true)
    expect(shouldFetchDetail({ ...base, trigger: 'dry' })).toBe(true)
  })
  it('starý se zápisem se nestahuje, dokud je zpracovaný aktuální verzí', () => {
    expect(shouldFetchDetail({ ...base, hasReport: true, trigger: 'manual' })).toBe(false)
    expect(shouldFetchDetail({ ...base, hasReport: true, trigger: 'cron' })).toBe(false)
  })
  it('starý se zápisem zpracovaným starší verzí se stáhne znovu i z cronu (backfill)', () => {
    for (const trigger of ['cron', 'manual', 'dry'] as const) {
      expect(shouldFetchDetail({ ...base, hasReport: true, outdated: true, trigger })).toBe(true)
    }
  })
})
