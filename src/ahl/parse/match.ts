import { AhlParseError } from '../errors'
import { displayName } from '../names'
import type {
  AhlGoal,
  AhlLineupRow,
  AhlMatchDetail,
  AhlMatchStats,
  AhlPair,
  AhlPenalty,
  AhlPersonRef,
  AhlScore,
  AhlScoreSuffix,
} from '../types'

import {
  pad2,
  paramFromHref,
  parseDocument,
  parseScorePair,
  phaseFromCompetition,
  requireInt,
  text,
  toInt,
} from './dom'

function personFromLink(a: Element): AhlPersonRef {
  return {
    name: displayName(a.textContent ?? ''),
    playerId: paramFromHref(a.getAttribute('href'), 'hracid'),
  }
}

function tableByCaption(doc: Document, re: RegExp): HTMLTableElement | null {
  for (const t of Array.from(doc.querySelectorAll('table'))) {
    const cap = t.querySelector('caption')
    if (cap && re.test(text(cap))) return t as HTMLTableElement
  }
  return null
}

function bodyRows(table: Element): Element[] {
  return Array.from(table.querySelectorAll('tr')).filter(
    (tr) =>
      tr.classList.contains('tabulka_radek_lichy') || tr.classList.contains('tabulka_radek_sudy'),
  )
}

/** „5 : 6" a nic jiného — hlavička i statistika zápasu mají dvojici samostatně. */
function exactScorePair(raw: string): { home: number; away: number } | null {
  const pair = parseScorePair(raw)
  return pair && pair.rest === '' ? { home: pair.home, away: pair.away } : null
}

/** Skóre, přípona (PP/SN) a skóre třetin z boxu uprostřed hlavičky. */
function parseScoreBox(
  scoreBox: Element,
  scoreDiv: Element,
  page: string,
): { score: AhlScore; periods: AhlPair[] } {
  const pair = exactScorePair(text(scoreDiv))
  if (!pair) throw new AhlParseError(page, 'nečitelné skóre v hlavičce')
  const boxDivs = Array.from(scoreBox.children)
  const suffixRaw = text(boxDivs[1]).toLowerCase()
  const suffix: AhlScoreSuffix = suffixRaw === 'pp' || suffixRaw === 'sn' ? suffixRaw : null

  const periodsRaw = text(boxDivs[2])
  const periods = Array.from(periodsRaw.matchAll(/(\d+)\s*:\s*(\d+)/g)).map((m) => ({
    home: +m[1],
    away: +m[2],
  }))
  return { score: { ...pair, suffix }, periods }
}

/**
 * Řádek s datem a místem:
 * „VCHL VČHL 2.ročník | Základní část | Neděle 4. 10. 2026, 16:30 | Rychnov nad Kněžnou | Zápas č. 12"
 */
function parseMeta(portlet: Element, page: string) {
  const metaDiv = Array.from(portlet.querySelectorAll('div')).find((d) =>
    /\|/.test(
      Array.from(d.childNodes)
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join(''),
    ),
  )
  const parts = text(metaDiv)
    .split('|')
    .map((p) => p.trim())
  if (!metaDiv || parts.length < 3) throw new AhlParseError(page, 'chybí řádek s datem a místem')

  const dateIdx = parts.findIndex((p) => /\d{1,2}\.\s*\d{1,2}\.\s*\d{4}/.test(p))
  let dateISO: string | null = null
  if (dateIdx >= 0) {
    const dm = parts[dateIdx].match(
      /(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})(?:,\s*(\d{1,2}):(\d{2}))?/,
    )!
    dateISO = `${dm[3]}-${pad2(+dm[2])}-${pad2(+dm[1])}T${dm[4] ? `${pad2(+dm[4])}:${dm[5]}` : '00:00'}:00`
  }
  const venueRaw = dateIdx >= 0 ? parts[dateIdx + 1] : undefined
  const venue = venueRaw && !/^Zápas č\./i.test(venueRaw) ? venueRaw : null

  // Soutěž ve tvaru jako ve výpisech („VČHL 2.ročník - ZČ").
  const compName = parts[0].replace(/^[A-ZČ]{2,6}\s+(?=VČHL|\S+\.ročník)/, '').trim()
  const phaseName = dateIdx > 1 ? parts[1] : ''
  const phaseShort = /základní/i.test(phaseName) ? 'ZČ' : phaseName
  const competition = phaseShort ? `${compName} - ${phaseShort}` : compName

  return { dateISO, venue, competition, phaseName }
}

function parseHeader(doc: Document, matchId: number) {
  const page = `zapas ${matchId}`
  const portlet = doc.querySelector('#zapas_full_portlet_inner_box')
  if (!portlet) {
    // ahl.cz u neexistujícího zápasu vrací HTTP 200 a chybovou stránku
    // („požadavku nelze vyhovět"), takže status nestačí.
    throw new AhlParseError(
      page,
      'chybí #zapas_full_portlet (neexistující zápas nebo změna layoutu)',
    )
  }
  const idInput = portlet.querySelector('input[name="zapasid"]')
  const pageId = toInt(idInput?.getAttribute('value'))
  if (pageId !== null && pageId !== matchId) {
    throw new AhlParseError(page, `stránka je zápas ${pageId}`)
  }

  // Skóre je jediný `div` bez potomků-elementů, který vypadá jako „5 : 6".
  const scoreDiv = Array.from(portlet.querySelectorAll('div')).find(
    (d) => d.children.length === 0 && exactScorePair(d.textContent ?? '') !== null,
  )
  const scoreBox = scoreDiv?.parentElement
  const homeBox = scoreBox?.previousElementSibling
  const awayBox = scoreBox?.nextElementSibling
  if (!scoreDiv || !scoreBox || !homeBox || !awayBox) {
    throw new AhlParseError(page, 'chybí hlavička se skóre a týmy')
  }
  const home = text(homeBox)
  const away = text(awayBox)
  if (!home || !away) throw new AhlParseError(page, 'prázdný název týmu v hlavičce')

  const { score, periods } = parseScoreBox(scoreBox, scoreDiv, page)
  return { home, away, score, periods, ...parseMeta(portlet, page) }
}

type Side = 'home' | 'away'

/**
 * Písmenné kódy trestů a jejich délka v TM. OK = osobní trest do konce utkání,
 * do trestných minut v sestavě se počítá za 20 (ověřeno na zápasech 46732:
 * 2+2+2+2+2+5 + OK = 35, a 40236: 2+5+2+2+2+2+2 + OK = 37). Neznámý kód dostane
 * `minutes: null`, ať se délka nevymýšlí.
 */
const PENALTY_CODE_MINUTES: Record<string, number> = { OK: 20 }

function parseGoals(
  doc: Document,
  matchId: number,
): { goals: AhlGoal[]; codeSide: Map<string, Side> } {
  const page = `zapas ${matchId}`
  const table = tableByCaption(doc, /^Branky$/i)
  if (!table) throw new AhlParseError(page, 'chybí tabulka Branky')

  const headers = Array.from(table.querySelectorAll('tr.tabulka_radek_nadpis th')).map((th) =>
    text(th),
  )
  const idx = {
    team: headers.indexOf('Team'),
    time: headers.indexOf('Čas'),
    scorer: headers.indexOf('Střelec'),
    assists: headers.indexOf('Asistence'),
    type: headers.indexOf('Typ'),
    state: headers.indexOf('Stav'),
  }
  if (Object.values(idx).some((i) => i < 0)) {
    throw new AhlParseError(page, `tabulka Branky má neočekávané záhlaví (${headers.join(', ')})`)
  }

  const goals: AhlGoal[] = []
  // Strana se odvozuje z průběžného stavu (domácí:hosté), ne z kódu týmu —
  // ten je v hlavičce zápasu nikde neuvedený a nelze ho spárovat s názvem.
  let prevHome = 0
  let prevAway = 0
  const codeSide = new Map<string, Side>()

  for (const tr of bodyRows(table)) {
    const cells = Array.from(tr.children)
    const teamCode = text(cells[idx.team])
    const time = text(cells[idx.time])
    const state = text(cells[idx.state])
    const sm = state.match(/^(\d+):(\d+)$/)
    if (!teamCode || !/^\d+:\d{2}$/.test(time) || !sm) {
      throw new AhlParseError(page, `nečitelný řádek branky (${teamCode}|${time}|${state})`)
    }
    const scorerLink = cells[idx.scorer].querySelector('a')
    if (!scorerLink) throw new AhlParseError(page, `branka ${time} bez střelce`)

    const h = +sm[1]
    const a = +sm[2]
    let side: 'home' | 'away' | undefined
    if (h === prevHome + 1 && a === prevAway) side = 'home'
    else if (a === prevAway + 1 && h === prevHome) side = 'away'
    else side = codeSide.get(teamCode)
    if (!side)
      throw new AhlParseError(
        page,
        `branka ${time}: stav ${state} nenavazuje na ${prevHome}:${prevAway}`,
      )
    codeSide.set(teamCode, side)
    prevHome = h
    prevAway = a

    goals.push({
      time,
      side,
      teamCode,
      scorer: personFromLink(scorerLink),
      assists: Array.from(cells[idx.assists].querySelectorAll('a')).map(personFromLink),
      strength: text(cells[idx.type]) || null,
      scoreAfter: state,
    })
  }
  return { goals, codeSide }
}

/**
 * Tresty obou stran. Kód týmu (CES, ZH) nejde spárovat s názvem v hlavičce,
 * takže strana se odvozuje postupně — viz `resolveSides`. Tabulka u zápasu bez
 * trestů nebo u neodehraného zápasu v HTML úplně chybí, to je `[]`.
 */
function parsePenalties(
  doc: Document,
  matchId: number,
  ctx: { codeSide: Map<string, Side>; lineups: { home: AhlLineupRow[]; away: AhlLineupRow[] } },
): AhlPenalty[] {
  const page = `zapas ${matchId}`
  const table = tableByCaption(doc, /^Tresty$/i)
  if (!table) return []

  const headers = Array.from(table.querySelectorAll('tr.tabulka_radek_nadpis th')).map((th) =>
    text(th),
  )
  const idx = {
    team: headers.indexOf('Team'),
    time: headers.indexOf('Čas'),
    player: headers.indexOf('Hráč'),
    kind: headers.indexOf('Trest'),
    reason: headers.indexOf('Důvod'),
  }
  if (Object.values(idx).some((i) => i < 0)) {
    throw new AhlParseError(page, `tabulka Tresty má neočekávané záhlaví (${headers.join(', ')})`)
  }

  // Sloupce Hráč, Trest a Důvod mají stejnou třídu `tabulka_jmeno`, proto se
  // indexují podle pozice záhlaví, ne podle třídy.
  const rows = bodyRows(table).map((tr) => {
    const cells = Array.from(tr.children)
    const teamCode = text(cells[idx.team])
    const time = text(cells[idx.time])
    if (!teamCode || !/^\d+:\d{2}$/.test(time)) {
      throw new AhlParseError(page, `nečitelný řádek trestu (${teamCode}|${time})`)
    }
    const link = cells[idx.player]?.querySelector('a')
    const playerRaw = text(cells[idx.player])
    const kindRaw = text(cells[idx.kind])
    const km = kindRaw.match(/^(\d+)\s*-\s*(.+)$/)
    const cm = km ? null : kindRaw.match(/^([A-ZÁ-Ž]{1,4})\s*-\s*(.+)$/)
    return {
      time,
      teamCode,
      player: link ? personFromLink(link) : null,
      playerText: !link && playerRaw ? displayName(playerRaw) : null,
      code: km ? km[1] : cm ? cm[1] : null,
      minutes: km ? +km[1] : cm ? (PENALTY_CODE_MINUTES[cm[1]] ?? null) : null,
      kind: km ? km[2].trim() : cm ? cm[2].trim() : kindRaw,
      reason: text(cells[idx.reason]) || null,
    }
  })

  const sides = resolveSides(rows, ctx, page)
  return rows.map((r, i) => ({ ...r, side: sides[i] }))
}

/**
 * Strana trestu v pořadí od nejspolehlivějšího zdroje:
 * 1. `hracid` hráče je v sestavě domácích / hostů;
 * 2. kód týmu se už potkal u branky;
 * 3. kód se naučil z trestu rozhodnutého krokem 1 (trest lavice téhož týmu
 *    tak dostane stranu, i když tým v zápase nestřelil);
 * 4. známe kódy jen jednoho týmu a tenhle je jiný → je to ten druhý.
 * Dvouprůchodově proto, aby výsledek nezávisel na pořadí řádků.
 */
function resolveSides(
  rows: { time: string; teamCode: string; player: AhlPersonRef | null }[],
  ctx: { codeSide: Map<string, Side>; lineups: { home: AhlLineupRow[]; away: AhlLineupRow[] } },
  page: string,
): Side[] {
  const playerSide = new Map<number, Side>()
  for (const r of ctx.lineups.home) if (r.playerId !== null) playerSide.set(r.playerId, 'home')
  for (const r of ctx.lineups.away) if (r.playerId !== null) playerSide.set(r.playerId, 'away')

  const codeSide = new Map(ctx.codeSide)
  const fromLineup = rows.map((r) =>
    r.player?.playerId != null ? playerSide.get(r.player.playerId) : undefined,
  )
  // Sestava je nejspolehlivější, proto se z ní kódy učí první — a když si
  // protiřečí s tím, co už víme (z branek nebo z jiného řádku), je vstup
  // nedůvěryhodný celý, ne jen ten řádek.
  rows.forEach((r, i) => {
    const side = fromLineup[i]
    if (!side) return
    const known = codeSide.get(r.teamCode)
    if (known && known !== side) {
      throw new AhlParseError(
        page,
        `trest ${r.time}: hráč ${r.player?.name} je v sestavě ${side}, ale kód ${r.teamCode} patří straně ${known}`,
      )
    }
    codeSide.set(r.teamCode, side)
  })

  return rows.map((r, i) => {
    const side = fromLineup[i] ?? codeSide.get(r.teamCode)
    if (side) return side
    const knownSides = new Set(codeSide.values())
    if (knownSides.size === 1) {
      const [only] = knownSides
      return only === 'home' ? 'away' : 'home'
    }
    throw new AhlParseError(page, `trest ${r.time}: nelze určit stranu (${r.teamCode})`)
  })
}

const NO_STATS: AhlMatchStats = { penalties: null, majors: null, ppGoals: null, ppTime: null }

function parseMatchStats(doc: Document): AhlMatchStats {
  const table = tableByCaption(doc, /^Statistika zápasu$/i)
  if (!table) return { ...NO_STATS }

  const values = new Map<string, string>()
  // Řádky tu nemají třídy lichy/sudy, takže se bere každé `tr` s dvěma buňkami.
  for (const tr of Array.from(table.querySelectorAll('tr'))) {
    const tds = tr.querySelectorAll('td')
    if (tds.length >= 2) values.set(text(tds[0]), text(tds[1]))
  }
  const ppTimeMatch = (values.get('Čas v PP') ?? '').match(/(\d+:\d{2})\s*:\s*(\d+:\d{2})/)

  return {
    penalties: exactScorePair(values.get('Vyloučení') ?? ''),
    majors: exactScorePair(values.get('Vyšší tresty') ?? ''),
    ppGoals: exactScorePair(values.get('Využití') ?? ''),
    ppTime: ppTimeMatch ? { home: ppTimeMatch[1], away: ppTimeMatch[2] } : null,
  }
}

function parseLineup(table: Element, matchId: number, label: string): AhlLineupRow[] {
  const page = `zapas ${matchId}`
  const required = [
    'tabulka_cislo',
    'tabulka_jmeno',
    'tabulka_goly',
    'tabulka_asistence',
    'tabulka_body',
    'tabulka_trestne_minuty',
  ]
  for (const c of required) {
    if (!table.querySelector(`tr.tabulka_radek_nadpis th.${c}`)) {
      throw new AhlParseError(page, `sestava ${label}: chybí sloupec ${c}`)
    }
  }
  const post = (tr: Element) => tr.querySelector('td.tabulka_team_zkratka')
  return bodyRows(table).map((tr) => {
    const cell = (c: string) => text(tr.querySelector(`td.${c}`))
    const link = tr.querySelector('td.tabulka_jmeno a')
    const rawName = link?.textContent ?? tr.querySelector('td.tabulka_jmeno')?.textContent ?? ''
    if (!rawName.trim()) throw new AhlParseError(page, `sestava ${label}: řádek bez jména`)
    // `H/B` (hráč i brankář) není brankář zápasu; ten má jen „B".
    const goalie = text(post(tr)) === 'B'
    return {
      playerId: paramFromHref(link?.getAttribute('href'), 'hracid'),
      name: displayName(rawName),
      number: toInt(cell('tabulka_cislo')),
      goalie,
      goals: requireInt(cell('tabulka_goly'), page, 'G'),
      assists: requireInt(cell('tabulka_asistence'), page, 'A'),
      points: requireInt(cell('tabulka_body'), page, 'B'),
      pim: requireInt(cell('tabulka_trestne_minuty'), page, 'TM'),
    }
  })
}

/**
 * Detail zápasu. Neodehraný zápas je platný vstup (`hasReport: false`,
 * `score: null`, prázdné branky a sestavy); chybová stránka ahl.cz není.
 */
export function parseMatchDetail(html: string, matchId: number): AhlMatchDetail {
  const page = `zapas ${matchId}`
  const doc = parseDocument(html, page)
  const header = parseHeader(doc, matchId)
  const { goals, codeSide } = parseGoals(doc, matchId)

  const lineupTables = Array.from(doc.querySelectorAll('table')).filter((t) => {
    const cap = t.querySelector('caption')
    return cap && /^Hráči\s*-/i.test(text(cap))
  })
  if (lineupTables.length !== 2) {
    throw new AhlParseError(page, `očekávány 2 tabulky Hráči, nalezeno ${lineupTables.length}`)
  }
  const lineups = {
    home: parseLineup(lineupTables[0], matchId, 'domácí'),
    away: parseLineup(lineupTables[1], matchId, 'hosté'),
  }

  const hasReport = goals.length > 0 || lineups.home.length > 0 || lineups.away.length > 0
  // Neodehraný zápas ukazuje „0 : 0" bez přípony a bez sestav; to je
  // „výsledek ještě není", ne remíza.
  const played =
    hasReport || header.score.home + header.score.away > 0 || header.score.suffix !== null

  // Neodehraný zápas ukazuje ve statistice nuly, které nic neznamenají.
  let penalties: AhlPenalty[] | null = []
  let penaltiesError: string | null = null
  if (played) {
    try {
      penalties = parsePenalties(doc, matchId, { codeSide, lineups })
    } catch (e) {
      if (!(e instanceof AhlParseError)) throw e
      penalties = null
      penaltiesError = e.message
    }
  }
  const stats = played ? parseMatchStats(doc) : { ...NO_STATS }

  return {
    matchId,
    dateISO: header.dateISO,
    venue: header.venue,
    competition: header.competition,
    phase: phaseFromCompetition(`${header.competition} ${header.phaseName}`),
    home: { name: header.home },
    away: { name: header.away },
    score: played ? header.score : null,
    periods: played ? header.periods : [],
    hasReport,
    goals,
    lineups,
    penalties,
    penaltiesError,
    stats,
  }
}
