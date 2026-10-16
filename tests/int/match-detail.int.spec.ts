import { describe, expect, it } from 'vitest'

import type {
  ArticleGoal,
  MatchPenaltyRow,
  MatchTimelineEvent,
} from '@/landing/features/matches/types'
import {
  buildTimeline,
  matchDescription,
  matchHeadline,
  periodLabel,
  pickReport,
  toMatchDetail,
} from '@/landing/features/matches/view/matchDetailView'

import type { Match, Post } from '../../src/payload-types'

type Goals = NonNullable<Match['goals']>

/** Branky z první skupiny osy (pro testy mapování branek). */
const firstGoals = (detail: ReturnType<typeof toMatchDetail>) =>
  (detail.timeline[0]?.events ?? []).filter(
    (event): event is Extract<MatchTimelineEvent, { type: 'goal' }> => event.type === 'goal',
  )

const opponent = {
  id: 5,
  name: 'HC Zdar',
  slug: 'hc-zdar',
  logo: null,
  updatedAt: '',
  createdAt: '',
}
const season = { id: 1, slug: '2025-2026', startYear: 2025 } as unknown as Match['season']

const goal = (overrides: Goals[number]): Goals[number] => ({
  side: 'ours',
  strength: '5/5',
  ...overrides,
})

const baseMatch = (overrides: Partial<Match> = {}): Match =>
  ({
    id: 10,
    slug: '2025-10-12-hc-zdar',
    date: '2025-10-12T14:00:00.000Z',
    season,
    team: 1,
    competition: 'VČHL 18. kolo',
    opponent,
    home: true,
    venue: 'Rychnov nad Kněžnou',
    status: 'played',
    scoreOurs: 5,
    scoreOpp: 3,
    overtime: false,
    shootout: false,
    updatedAt: '',
    createdAt: '',
    ...overrides,
  }) as Match

const post = (overrides: Partial<Post> = {}): Post =>
  ({
    id: 1,
    title: 'Reportáž',
    slug: 'reportaz',
    _status: 'published',
    publishedAt: '2025-10-13T08:00:00.000Z',
    updatedAt: '',
    createdAt: '',
    ...overrides,
  }) as Post

describe('toMatchDetail — domácí a venkovní zápas', () => {
  const goals: Goals = [
    goal({
      time: '05:00',
      side: 'ours',
      scoreAfter: '1:0',
      scorerName: 'Sajdl',
      assist1Name: 'Vacek',
    }),
    goal({ time: '25:10', side: 'opp', scoreAfter: '1:1', scorerName: 'Novák' }),
  ]

  it('domácí: skóre, třetiny i stav po brance v pořadí Čestice : soupeř', () => {
    const detail = toMatchDetail(
      baseMatch({
        goals,
        thirds: [
          { ours: 2, opp: 0 },
          { ours: 1, opp: 3 },
          { ours: 2, opp: 0 },
        ],
      }),
      null,
    )
    expect(detail.weAreHome).toBe(true)
    expect([detail.homeName, detail.awayName]).toEqual(['HC Čestice', 'HC Zdar'])
    expect([detail.homeScore, detail.awayScore]).toEqual([5, 3])
    expect(detail.thirds).toEqual([
      { home: 2, away: 0 },
      { home: 1, away: 3 },
      { home: 2, away: 0 },
    ])
    expect(firstGoals(detail)[0]?.score).toBe('1:0')
    expect(detail.outcome).toBe('win')
    expect(detail.title).toBe('HC Čestice × HC Zdar')
    expect(matchHeadline(detail)).toBe('HC Čestice 5:3 HC Zdar')
  })

  it('venku: skóre, třetiny a stav po brance se prohodí na domácí : hosté', () => {
    const detail = toMatchDetail(
      baseMatch({
        home: false,
        scoreOurs: 7,
        scoreOpp: 8,
        shootout: true,
        goals,
        thirds: [
          { ours: 3, opp: 2 },
          { ours: 2, opp: 2 },
        ],
      }),
      null,
    )
    expect([detail.homeName, detail.awayName]).toEqual(['HC Zdar', 'HC Čestice'])
    expect([detail.homeScore, detail.awayScore]).toEqual([8, 7])
    expect(detail.thirds).toEqual([
      { home: 2, away: 3 },
      { home: 2, away: 2 },
    ])
    expect(firstGoals(detail)[0]?.score).toBe('0:1')
    // Prohra po nájezdech má bod — vlastní výsledek, ne obyčejná prohra.
    expect(detail.outcome).toBe('otLoss')
    expect(detail.suffix).toBe('sn')
    expect(matchHeadline(detail)).toBe('HC Zdar 8:7 HC Čestice')
  })

  it('remíza a prodloužení', () => {
    const detail = toMatchDetail(baseMatch({ scoreOurs: 2, scoreOpp: 2, overtime: true }), null)
    expect(detail.outcome).toBe('draw')
    expect(detail.suffix).toBe('pp')
  })

  it('prohra v základní době je `loss`, po prodloužení `otLoss`, výhra po prodloužení `win`', () => {
    const outcome = (overrides: Partial<Match>) => toMatchDetail(baseMatch(overrides), null).outcome
    expect(outcome({ scoreOurs: 2, scoreOpp: 4 })).toBe('loss')
    expect(outcome({ scoreOurs: 2, scoreOpp: 3, overtime: true })).toBe('otLoss')
    expect(outcome({ scoreOurs: 3, scoreOpp: 2, overtime: true })).toBe('win')
  })

  it('odkaz zpět nese slug a štítek sezóny', () => {
    const detail = toMatchDetail(baseMatch(), null)
    expect(detail.seasonSlug).toBe('2025-2026')
    expect(detail.seasonLabel).toBe('2025/26')
  })
})

describe('branky: přesilovky, třetiny, nájezdy', () => {
  it('PP a OS z `strength` z pohledu týmu, který skóroval', () => {
    const detail = toMatchDetail(
      baseMatch({
        goals: [
          goal({ time: '03:00', strength: '5/4', scorerName: 'A' }),
          goal({ time: '04:00', strength: '4/5', scorerName: 'B' }),
          goal({ time: '05:00', strength: '6/5', scorerName: 'C' }),
        ],
      }),
      null,
    )
    expect(firstGoals(detail).map((g) => (g.ours ? g.special : 'opp'))).toEqual(['pp', 'os', null])
  })

  it('seskupení podle času včetně prodloužení a nájezdů', () => {
    const detail = toMatchDetail(
      baseMatch({
        overtime: true,
        shootout: true,
        goals: [
          goal({ time: '00:42', scorerName: 'A' }),
          goal({ time: '20:00', scorerName: 'B' }),
          goal({ time: '20:01', scorerName: 'C' }),
          goal({ time: '40:00', scorerName: 'D' }),
          goal({ time: '40:01', scorerName: 'E' }),
          goal({ time: '60:00', scorerName: 'F' }),
          goal({ time: '61:30', scorerName: 'G' }),
          goal({ time: '65:00', strength: 'SN', scorerName: 'H' }),
        ],
      }),
      null,
    )
    expect(detail.timeline.map((g) => [g.label, g.events.length])).toEqual([
      ['1. třetina', 2],
      ['2. třetina', 2],
      ['3. třetina', 2],
      ['Prodloužení', 1],
      ['Nájezdy', 1],
    ])
  })

  it('rozhodující nájezd zapsaný v 60:00 jde do Nájezdů, ne do 3. třetiny', () => {
    expect(periodLabel({ time: '60:00', special: 'sn' })).toBe('Nájezdy')
    expect(periodLabel({ time: '60:00', special: null })).toBe('3. třetina')
    expect(periodLabel({ time: '62:10' })).toBe('Prodloužení')
  })
})

describe('buildTimeline', () => {
  const g = (time: string, special: ArticleGoal['special'] = null, ours = true): ArticleGoal => ({
    time,
    ours,
    scorer: time,
    assists: [],
    score: '',
    special,
  })
  const p = (time: string, minutes: number | null = 2): MatchPenaltyRow => ({
    time,
    player: `P ${time}`,
    minutes,
    kind: null,
    reason: null,
  })

  it('sloučí branky a tresty podle času do jedné skupiny', () => {
    const periods = buildTimeline([g('02:00'), g('10:00')], [p('05:00')], [], true)
    expect(periods).toHaveLength(1)
    expect(periods[0].events.map((e) => `${e.type}:${e.time}`)).toEqual([
      'goal:02:00',
      'penalty:05:00',
      'goal:10:00',
    ])
  })

  it('při shodném čase jde branka před trest', () => {
    const [period] = buildTimeline([g('12:00')], [p('12:00')], [], true)
    expect(period.events.map((e) => e.type)).toEqual(['goal', 'penalty'])
  })

  it('trest v prodloužení, nájezd na konci a ručně neseřazené vstupy bez duplicitních skupin', () => {
    const periods = buildTimeline(
      [g('45:00'), g('05:00'), g('60:00', 'sn'), g('50:00'), g('12:00'), g('61:30')],
      [p('62:10'), p('41:00')],
      [],
      true,
    )
    expect(periods.map((x) => x.label)).toEqual([
      '1. třetina',
      '3. třetina',
      'Prodloužení',
      'Nájezdy',
    ])
    expect(new Set(periods.map((x) => x.label)).size).toBe(periods.length)
    expect(periods[1].events.map((e) => e.time)).toEqual(['41:00', '45:00', '50:00'])
    expect(periods[2].events.map((e) => `${e.type}:${e.time}`)).toEqual([
      'goal:61:30',
      'penalty:62:10',
    ])
  })

  it('je stabilní pro shodný čas a nemění vstupní pole', () => {
    const a = g('10:00')
    const b = { ...a, scorer: 'B' }
    const input = [a, b]
    const [period] = buildTimeline(input, [], [], true)
    expect(period.events.map((e) => (e.type === 'goal' && e.ours ? e.scorer : null))).toEqual([
      '10:00',
      'B',
    ])
    expect(input).toEqual([a, b])
  })

  it('skóre třetin z `thirds`, jinak z branek; prodloužení z branek, nájezdy bez skóre', () => {
    const periods = buildTimeline(
      [g('05:00'), g('25:00', null, false), g('26:00', null, false), g('61:00'), g('65:00', 'sn')],
      [],
      [{ home: 3, away: 1 }],
      true,
    )
    expect(periods.map((x) => [x.label, x.score])).toEqual([
      ['1. třetina', { home: 3, away: 1 }],
      ['2. třetina', { home: 0, away: 2 }],
      ['Prodloužení', { home: 1, away: 0 }],
      ['Nájezdy', null],
    ])
  })

  it('spočítané skóre úseku je venku v pořadí domácí : hosté', () => {
    const [period] = buildTimeline([g('05:00'), g('06:00'), g('07:00', null, false)], [], [], false)
    expect(period.score).toEqual({ home: 1, away: 2 })
  })

  it('trest bez času (ruční zápis) jde do „Ostatní", ne na začátek 1. třetiny', () => {
    const periods = buildTimeline([g('05:00')], [p('')], [], true)
    expect(periods.map((x) => [x.label, x.events.length, x.score])).toEqual([
      ['1. třetina', 1, { home: 1, away: 0 }],
      ['Ostatní', 1, null],
    ])
  })

  it('úsek bez branek (jen tresty) má skóre 0:0, ne prázdné', () => {
    const [period] = buildTimeline([], [p('05:00')], [], true)
    expect(period.score).toEqual({ home: 0, away: 0 })
  })
})

describe('mapování branek do osy', () => {
  it('asistenti z relace se dohledají, gól soupeře je bez jmen', () => {
    const detail = toMatchDetail(
      baseMatch({
        goals: [
          goal({
            time: '10:00',
            scorer: { id: 1, name: 'Tomáš Kopecký' } as never,
            assist1: { id: 2, name: 'Jan Vacek' } as never,
            assist2Name: 'Jiří Novák',
          }),
          goal({ time: '11:00', side: 'opp', scorerName: 'Soupeřův Střelec' }),
        ],
      }),
      null,
    )
    const [ours, opp] = firstGoals(detail)
    expect(ours).toMatchObject({
      scorer: 'Tomáš Kopecký',
      assists: ['Jan Vacek', 'Jiří Novák'],
      ours: true,
    })
    // Gól soupeře nese jen stav — jména do view-modelu (a cache) nedoputují.
    expect(opp).toEqual({ type: 'goal', ours: false, time: '11:00', score: '' })
    expect(JSON.stringify(detail.timeline)).not.toContain('Soupeřův Střelec')
  })
})

describe('tresty a statistika', () => {
  it('součet minut a jméno hráče z textu i z relace', () => {
    const detail = toMatchDetail(
      baseMatch({
        penalties: [
          {
            time: '04:25',
            minutes: 2,
            kind: 'Menší trest',
            reason: 'Faul kolenem',
            playerName: 'Marek Vašata',
          },
          {
            time: '42:08',
            minutes: 20,
            kind: 'Trest do konce utkání',
            reason: 'Bodnutí',
            player: { id: 3, name: 'Šimon Zelený' } as never,
          },
          {
            time: '44:08',
            minutes: 5,
            kind: 'Větší trest',
            reason: null,
            playerName: 'Šimon Zelený',
          },
        ],
      }),
      null,
    )
    expect(detail.penaltyMinutes).toBe(27)
    expect(detail.penalties.map((p) => p.player)).toEqual([
      'Marek Vašata',
      'Šimon Zelený',
      'Šimon Zelený',
    ])
    expect(detail.penalties[2]?.reason).toBeNull()
  })

  it('statistika vynechá řádky s hodnotami null a bez statistiky je prázdná', () => {
    const detail = toMatchDetail(
      baseMatch({
        stats: {
          penaltiesOurs: 5,
          penaltiesOpp: 6,
          majorsOurs: null,
          majorsOpp: null,
          ppGoalsOurs: 0,
          ppGoalsOpp: 2,
          ppTimeOurs: '5:13',
          ppTimeOpp: '',
        },
      }),
      null,
    )
    expect(detail.stats.map((row) => row.label)).toEqual([
      'Vyloučení',
      'Využité přesilovky',
      'Čas v přesilovce',
    ])
    expect(detail.stats[1]).toMatchObject({ ours: '0', opp: '2', oursValue: 0, oppValue: 2 })
    // čas je text → žádný pruh; chybějící strana se ukáže pomlčkou
    expect(detail.stats[2]).toMatchObject({
      ours: '5:13',
      opp: '–',
      oursValue: null,
      oppValue: null,
    })

    expect(toMatchDetail(baseMatch({ stats: {} }), null).stats).toEqual([])
    expect(toMatchDetail(baseMatch(), null).stats).toEqual([])
  })
})

describe('stavy zápasu', () => {
  it('odehraný zápas bez zápisu hlásí chybějící protokol', () => {
    const detail = toMatchDetail(baseMatch(), null)
    expect(detail.missingProtocol).toBe(true)
    expect(detail.timeline).toEqual([])
  })

  it('zápis chybí jen tehdy, když není nic z branek, trestů a statistiky', () => {
    expect(
      toMatchDetail(baseMatch({ goals: [goal({ time: '01:00', scorerName: 'A' })] }), null)
        .missingProtocol,
    ).toBe(false)
    expect(
      toMatchDetail(
        baseMatch({ penalties: [{ time: '01:00', minutes: 2, playerName: 'A' }] }),
        null,
      ).missingProtocol,
    ).toBe(false)
  })

  it('bezbrankové 0:0 se zápisem poznámku nedostane', () => {
    const detail = toMatchDetail(
      baseMatch({ scoreOurs: 0, scoreOpp: 0, ahl: { hasReport: true } }),
      null,
    )
    expect(detail.missingProtocol).toBe(false)
  })

  it('naplánovaný zápas: bez skóre, bez výsledku, bez poznámky o zápisu', () => {
    const detail = toMatchDetail(
      baseMatch({ status: 'scheduled', scoreOurs: null, scoreOpp: null }),
      null,
    )
    expect(detail.status).toBe('scheduled')
    expect(detail.homeScore).toBeNull()
    expect(detail.outcome).toBeNull()
    expect(detail.missingProtocol).toBe(false)
    expect(matchHeadline(detail)).toBe('HC Čestice × HC Zdar')
    expect(matchDescription(detail)).toContain('se hraje')
  })

  it('zrušený zápas', () => {
    const detail = toMatchDetail(
      baseMatch({ status: 'canceled', scoreOurs: null, scoreOpp: null }),
      null,
    )
    expect(detail.status).toBe('canceled')
    expect(detail.homeScore).toBeNull()
    expect(detail.missingProtocol).toBe(false)
    expect(matchDescription(detail)).toContain('zrušen')
  })

  it('odehraný zápas bez skóre: popis netvrdí, že se hraje', () => {
    const detail = toMatchDetail(baseMatch({ scoreOurs: null, scoreOpp: null }), null)
    expect(detail.homeScore).toBeNull()
    const description = matchDescription(detail)
    expect(description).toContain('se odehrál')
    expect(description).not.toContain('se hraje')
  })

  it('popis odehraného zápasu nese skóre, střelce a tresty', () => {
    const detail = toMatchDetail(
      baseMatch({
        goals: [
          goal({ time: '01:00', scorerName: 'Lukáš Sajdl' }),
          goal({ time: '02:00', scorerName: 'Lukáš Sajdl' }),
        ],
        penalties: [{ time: '03:00', minutes: 2, playerName: 'A' }],
      }),
      null,
    )
    const description = matchDescription(detail)
    expect(description).toContain('HC Čestice 5:3 HC Zdar')
    expect(description).toContain('Střelci Čestic: Sajdl 2')
    expect(description).toContain('2 min')
  })
})

describe('reportáž a galerie v detailu', () => {
  it('publikovaná reportáž se promítne do karty s odkazem', () => {
    const detail = toMatchDetail(baseMatch(), post({ excerpt: '<p>Skvělý zápas.</p>' }))
    expect(detail.report).toMatchObject({
      title: 'Reportáž',
      excerpt: 'Skvělý zápas.',
      href: '/aktuality/reportaz',
      photo: null,
    })
  })

  it('galerie z match.gallery se odkazuje na /fotogalerie/<slug>', () => {
    const detail = toMatchDetail(
      baseMatch({ gallery: { id: 2, title: 'Fotky', slug: 'fotky' } as never }),
      null,
    )
    expect(detail.gallery).toEqual({ title: 'Fotky', href: '/fotogalerie/fotky' })
    expect(detail.report).toBeNull()
  })
})

describe('pickReport', () => {
  it('publikovaná match.report vyhrává nad kandidáty', () => {
    const linked = post({ id: 1 })
    const newer = post({ id: 2, publishedAt: '2025-11-01T00:00:00.000Z' })
    expect(pickReport(linked, [newer])?.id).toBe(1)
  })

  it('koncept v match.report se ignoruje a bere se nejnovější publikovaný post.match', () => {
    const draft = post({ id: 1, _status: 'draft' })
    const older = post({ id: 2, publishedAt: '2025-10-01T00:00:00.000Z' })
    const newer = post({ id: 3, publishedAt: '2025-10-20T00:00:00.000Z' })
    const unpublished = post({ id: 4, _status: 'draft', publishedAt: '2025-12-01T00:00:00.000Z' })
    expect(pickReport(draft, [older, unpublished, newer])?.id).toBe(3)
  })

  it('nepopulovaná relace (číslo) se nepovažuje za publikovanou', () => {
    expect(pickReport(7, [post({ id: 2 })])?.id).toBe(2)
  })

  it('bez publikované reportáže vrací null', () => {
    expect(pickReport(null, [])).toBeNull()
    expect(pickReport(post({ _status: 'draft' }), [post({ _status: 'draft' })])).toBeNull()
  })
})
