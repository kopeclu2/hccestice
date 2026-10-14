import { AhlParseError } from '../errors'
import { displayName } from '../names'
import type {
  AhlGoal,
  AhlLineupRow,
  AhlMatchDetail,
  AhlPersonRef,
  AhlScore,
  AhlScoreSuffix,
} from '../types'
import { paramFromHref, parseDocument, phaseFromCompetition, requireInt, text, toInt } from './dom'

const pad = (n: number) => String(n).padStart(2, '0')

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
    (tr) => tr.classList.contains('tabulka_radek_lichy') || tr.classList.contains('tabulka_radek_sudy'),
  )
}

function parseHeader(doc: Document, matchId: number) {
  const page = `zapas ${matchId}`
  const portlet = doc.querySelector('#zapas_full_portlet_inner_box')
  if (!portlet) {
    // ahl.cz u neexistujícího zápasu vrací HTTP 200 a chybovou stránku
    // („požadavku nelze vyhovět"), takže status nestačí.
    throw new AhlParseError(page, 'chybí #zapas_full_portlet (neexistující zápas nebo změna layoutu)')
  }
  const idInput = portlet.querySelector('input[name="zapasid"]')
  const pageId = toInt(idInput?.getAttribute('value'))
  if (pageId !== null && pageId !== matchId) {
    throw new AhlParseError(page, `stránka je zápas ${pageId}`)
  }

  // Skóre je jediný `div` bez potomků-elementů, který vypadá jako „5 : 6".
  const scoreDiv = Array.from(portlet.querySelectorAll('div')).find(
    (d) => d.children.length === 0 && /^\s*\d+\s*:\s*\d+\s*$/.test(d.textContent ?? ''),
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

  const sm = text(scoreDiv).match(/^(\d+)\s*:\s*(\d+)$/)!
  const boxDivs = Array.from(scoreBox.children)
  const suffixRaw = text(boxDivs[1]).toLowerCase()
  const suffix: AhlScoreSuffix = suffixRaw === 'pp' || suffixRaw === 'sn' ? suffixRaw : null
  const score: AhlScore = { home: +sm[1], away: +sm[2], suffix }

  const periodsRaw = text(boxDivs[2])
  const periods = Array.from(periodsRaw.matchAll(/(\d+)\s*:\s*(\d+)/g)).map((m) => ({
    home: +m[1],
    away: +m[2],
  }))

  // „VCHL VČHL 2.ročník | Základní část | Neděle 4. 10. 2026, 16:30 | Rychnov nad Kněžnou | Zápas č. 12"
  const metaDiv = Array.from(portlet.querySelectorAll('div')).find((d) =>
    /\|/.test(Array.from(d.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('')),
  )
  const parts = text(metaDiv)
    .split('|')
    .map((p) => p.trim())
  if (!metaDiv || parts.length < 3) throw new AhlParseError(page, 'chybí řádek s datem a místem')

  const dateIdx = parts.findIndex((p) => /\d{1,2}\.\s*\d{1,2}\.\s*\d{4}/.test(p))
  let dateISO: string | null = null
  if (dateIdx >= 0) {
    const dm = parts[dateIdx].match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})(?:,\s*(\d{1,2}):(\d{2}))?/)!
    dateISO = `${dm[3]}-${pad(+dm[2])}-${pad(+dm[1])}T${dm[4] ? `${pad(+dm[4])}:${dm[5]}` : '00:00'}:00`
  }
  const venueRaw = dateIdx >= 0 ? parts[dateIdx + 1] : undefined
  const venue = venueRaw && !/^Zápas č\./i.test(venueRaw) ? venueRaw : null

  // Soutěž ve tvaru jako ve výpisech („VČHL 2.ročník - ZČ").
  const compName = parts[0].replace(/^[A-ZČ]{2,6}\s+(?=VČHL|\S+\.ročník)/, '').trim()
  const phaseName = dateIdx > 1 ? parts[1] : ''
  const phaseShort = /základní/i.test(phaseName) ? 'ZČ' : phaseName
  const competition = phaseShort ? `${compName} - ${phaseShort}` : compName

  return { home, away, score, periods, dateISO, venue, competition, phaseName }
}

function parseGoals(doc: Document, matchId: number): AhlGoal[] {
  const page = `zapas ${matchId}`
  const table = tableByCaption(doc, /^Branky$/i)
  if (!table) throw new AhlParseError(page, 'chybí tabulka Branky')

  const headers = Array.from(table.querySelectorAll('tr.tabulka_radek_nadpis th')).map((th) => text(th))
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
  const codeSide = new Map<string, 'home' | 'away'>()

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
    if (!side) throw new AhlParseError(page, `branka ${time}: stav ${state} nenavazuje na ${prevHome}:${prevAway}`)
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
  return goals
}

function parseLineup(table: Element, matchId: number, label: string): AhlLineupRow[] {
  const page = `zapas ${matchId}`
  const required = ['tabulka_cislo', 'tabulka_jmeno', 'tabulka_goly', 'tabulka_asistence', 'tabulka_body', 'tabulka_trestne_minuty']
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
  const goals = parseGoals(doc, matchId)

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
  }
}
