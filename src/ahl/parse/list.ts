import { AhlParseError } from '../errors'
import type { AhlListMatch, AhlScore, AhlScoreSuffix } from '../types'

import { paramFromHref, parseDocument, phaseFromCompetition, text } from './dom'

const PAGE = 'rozpis/vysledky'

const MONTHS: Record<string, number> = {
  ledna: 1,
  unora: 2,
  brezna: 3,
  dubna: 4,
  kvetna: 5,
  cervna: 6,
  cervence: 7,
  srpna: 8,
  zari: 9,
  rijna: 10,
  listopadu: 11,
  prosince: 12,
}

// getDay(): 0 = neděle
const WEEKDAYS: Record<string, number> = { ne: 0, po: 1, ut: 2, st: 3, ct: 4, pa: 5, so: 6 }

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

type Week = { startDay: number; startMonth: number; endDay: number; endMonth: number }

function parseWeek(raw: string): Week {
  // „28. září -  4. října" / „26. října -  1. listopadu"
  const m = fold(raw)
    .replace(/ /g, ' ')
    .match(/(\d{1,2})\.\s*([a-z]+)\s*-\s*(\d{1,2})\.\s*([a-z]+)/)
  const sm = m && MONTHS[m[2]]
  const em = m && MONTHS[m[4]]
  if (!m || !sm || !em) throw new AhlParseError(PAGE, `nerozpoznaný nadpis týdne „${raw.trim()}"`)
  return { startDay: +m[1], startMonth: sm, endDay: +m[3], endMonth: em }
}

/** Den z „17/So" + týden z nadpisu → měsíc; rok z pravidla sezóny. */
function resolveDate(
  day: number,
  weekdayAbbr: string,
  week: Week,
  seasonStartYear: number,
): { y: number; m: number; d: number } {
  let month: number
  if (week.startMonth === week.endMonth) {
    month = week.startMonth
  } else if (day >= week.startDay) {
    month = week.startMonth
  } else if (day <= week.endDay) {
    month = week.endMonth
  } else {
    throw new AhlParseError(
      PAGE,
      `den ${day} mimo týden ${week.startDay}.${week.startMonth}.–${week.endDay}.${week.endMonth}.`,
    )
  }
  // Sezóna startuje na podzim: 7–12 = startYear, 1–6 = startYear + 1.
  const year = month >= 7 ? seasonStartYear : seasonStartYear + 1
  // Kontrola dne v týdnu odhalí chybně odvozený rok (jinak by se zápas
  // tiše posunul o rok).
  const expected = WEEKDAYS[fold(weekdayAbbr)]
  const actual = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  if (expected !== undefined && expected !== actual) {
    throw new AhlParseError(PAGE, `datum ${day}. ${month}. ${year} nesedí na den „${weekdayAbbr}"`)
  }
  return { y: year, m: month, d: day }
}

function parseScore(raw: string): AhlScore | null {
  const m = raw
    .replace(/ /g, ' ')
    .trim()
    .match(/^(\d+)\s*:\s*(\d+)\s*(pp|sn)?$/i)
  if (!m) return null
  return {
    home: +m[1],
    away: +m[2],
    suffix: (m[3]?.toLowerCase() as AhlScoreSuffix | undefined) ?? null,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Parser `/rozpis/` i `/vysledky/` — tabulky mají stejný základ a liší se jen
 * sloupci, které se hledají podle záhlaví (rozpis má Čas, výsledky Výsledek).
 *
 * `seasonStartYear` je nutný, protože řádek nese jen „17/So" a nadpis týdne
 * bez roku.
 */
export function parseMatchList(html: string, opts: { seasonStartYear: number }): AhlListMatch[] {
  const doc = parseDocument(html, PAGE)

  const table = Array.from(doc.querySelectorAll('table')).find((t) =>
    Array.from(t.querySelectorAll('tr.tabulka_radek_nadpis th')).some(
      (th) => text(th) === 'Domácí',
    ),
  )
  if (!table) throw new AhlParseError(PAGE, 'chybí tabulka zápasů (záhlaví Domácí/Hosté)')

  const headers = Array.from(table.querySelectorAll('tr.tabulka_radek_nadpis th')).map((th) =>
    text(th),
  )
  const col = (name: string) => headers.indexOf(name)
  const iDate = col('Datum')
  const iHome = col('Domácí')
  const iAway = col('Hosté')
  if (iDate < 0 || iHome < 0 || iAway < 0) {
    throw new AhlParseError(PAGE, `v záhlaví chybí Datum/Domácí/Hosté (${headers.join(', ')})`)
  }
  const iTime = col('Čas')
  const iVenue = col('Stadion')
  const iComp = col('Zápas')
  const iResult = col('Výsledek')

  const out: AhlListMatch[] = []
  let week: Week | null = null

  for (const tr of Array.from(table.querySelectorAll('tr'))) {
    if (tr.classList.contains('tabulka_radek_separator')) {
      week = parseWeek(text(tr))
      continue
    }
    if (!tr.classList.contains('tabulka_radek')) continue

    const cells = Array.from(tr.children)
    if (cells.length < headers.length) {
      throw new AhlParseError(PAGE, `řádek má ${cells.length} buněk, záhlaví ${headers.length}`)
    }

    const link = tr.querySelector('a[href*="zapasid="]')
    const matchId = paramFromHref(
      link?.getAttribute('href') ?? tr.getAttribute('data-href'),
      'zapasid',
    )
    if (matchId === null) throw new AhlParseError(PAGE, 'řádek bez zapasid')
    if (!week) throw new AhlParseError(PAGE, `zápas ${matchId} před nadpisem týdne`)

    const dateText = text(cells[iDate])
    const dm = dateText.match(/^(\d{1,2})\/(\S+)$/)
    if (!dm)
      throw new AhlParseError(PAGE, `zápas ${matchId}: datum „${dateText}" neodpovídá „17/So"`)
    const { y, m, d } = resolveDate(+dm[1], dm[2], week, opts.seasonStartYear)

    let time = ''
    let timeKnown = false
    if (iTime >= 0) {
      const tm = text(cells[iTime]).match(/^(\d{1,2}):(\d{2})$/)
      if (tm) {
        time = `${pad(+tm[1])}:${tm[2]}`
        timeKnown = true
      }
    }

    const teamCell = (i: number) => {
      const a = cells[i].querySelector('a')
      const name = text(a ?? cells[i])
      if (!name) throw new AhlParseError(PAGE, `zápas ${matchId}: prázdný název týmu`)
      return {
        name,
        participantId: paramFromHref(a?.getAttribute('href'), 'ucastniksouteznihorocnikuid'),
      }
    }

    const competition = iComp >= 0 ? text(cells[iComp]) : ''
    const venue = iVenue >= 0 ? text(cells[iVenue]) || null : null

    let score: AhlScore | null = null
    let hasReport = false
    if (iResult >= 0) {
      const a = cells[iResult].querySelector('a.zapas_vysledek_link')
      score = a ? parseScore(text(a)) : null
      hasReport = score !== null && !a?.classList.contains('neni_zapis')
    }

    out.push({
      matchId,
      dateISO: `${y}-${pad(m)}-${pad(d)}T${timeKnown ? time : '00:00'}:00`,
      timeKnown,
      home: teamCell(iHome),
      away: teamCell(iAway),
      venue,
      competition,
      phase: phaseFromCompetition(competition),
      score,
      hasReport,
    })
  }

  return out
}
