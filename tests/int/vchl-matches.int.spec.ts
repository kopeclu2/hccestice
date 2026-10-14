import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { parseMatchDetail, parseMatchList } from '../../src/ahl'
import { buildPatch } from '../../src/jobs/vchlSync/diff'
import { buildGoals, buildLineup, buildThirds, ourCandidates } from '../../src/jobs/vchlSync/sync/matchDetail'
import { mergeLists, pairLegacy, resolveMatchDate } from '../../src/jobs/vchlSync/sync/matches'
import { foldTeam, opponentKeys, stripClubPrefix } from '../../src/jobs/vchlSync/sync/opponents'

const fx = (name: string) => readFileSync(path.resolve(import.meta.dirname, '../fixtures/ahl', name), 'utf8')
const detail = parseMatchDetail(fx('zapas-46616.html'), 46616)
const players = { idFor: (id: number | null) => (id === 38010 ? 24 : null) }

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
    expect(goals[0]).toMatchObject({ side: 'ours', scorer: 24, scorerName: 'Lukáš Sajdl', scoreAfter: '1:0' })
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
    expect(resolveMatchDate(e, null, existing as never).toISOString()).toBe('2026-10-04T14:30:00.000Z')
    // s detailem (má čas) vyhrává detail
    expect(resolveMatchDate(e, detail, null).toISOString()).toBe('2026-10-04T14:30:00.000Z')
  })

  it('přeložený termín: stejné ID, jiný den → nový den se starým časem', () => {
    const e = entries.find((x) => x.matchId === 46616)!
    const existing = { date: '2026-10-03T14:30:00.000Z' }
    expect(resolveMatchDate(e, null, existing as never).toISOString()).toBe('2026-10-04T14:30:00.000Z')
  })
})

describe('vchl legacy párování', () => {
  const vysledky = parseMatchList(fx('vysledky-1185.html'), { seasonStartYear: 2026 })
  const entry = mergeLists({ rozpis: null, vysledky }).find((x) => x.matchId === 46616)! // doma, Pardubice 5:6
  const opp = { byId: (id: number) => (id === 11 ? { id: 11, name: 'ZH Pardubice' } : { id: 99, name: 'Jiný' }) as never }
  const doc = (over: object) => ({ id: 1, date: '2026-10-04T14:30:00.000Z', home: true, opponent: 11, ...over }) as never

  it('podle dne a soupeře („Pardubice" ↔ „ZH Pardubice")', () => {
    expect(pairLegacy(entry, [doc({})], opp)).toMatchObject({ id: 1 })
  })

  it('jiný den nespáruje', () => {
    expect(pairLegacy(entry, [doc({ date: '2026-10-05T14:30:00.000Z' })], opp)).toBeNull()
  })

  it('den se počítá v Europe/Prague (22:30 UTC je už další den)', () => {
    expect(pairLegacy(entry, [doc({ date: '2026-10-03T22:30:00.000Z' })], opp)).toMatchObject({ id: 1 })
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
    const k = opponentKeys({ name: 'ZH Pardubice', aliases: [{ name: 'Závodní hokejová Pardubice' }] } as never)
    expect(k.has('pardubice')).toBe(true)
    expect(k.has('zavodni hokejova pardubice')).toBe(true)
  })
})
