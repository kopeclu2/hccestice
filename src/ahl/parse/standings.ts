import { AhlParseError } from '../errors'
import type { AhlStandingRow } from '../types'
import { paramFromHref, parseDocument, requireInt, text } from './dom'

const PAGE = 'tabulky'

/**
 * Tabulka základní části. Sloupce se berou podle tříd buněk, ne pořadí:
 * `tabulka_remizy` (R) je v této lize prohra v prodloužení/nájezdech.
 */
export function parseStandings(html: string): AhlStandingRow[] {
  const doc = parseDocument(html, PAGE)

  const tables = Array.from(doc.querySelectorAll('table.tabulka_tymu'))
  if (tables.length === 0) throw new AhlParseError(PAGE, 'chybí tabulka týmů (table.tabulka_tymu)')
  // Vícetabulkové stránky (skupiny, play-off) — bereme základní část. Bez
  // fallbacku na první tabulku: v play-off by se tiše zapsala jiná fáze.
  const table = tables.find((t) => /základní/i.test(text(t.querySelector('caption'))))
  if (!table) {
    throw new AhlParseError(PAGE, 'nenalezena tabulka základní části (caption „Základní část")')
  }

  const rows = Array.from(table.querySelectorAll('tr.tabulka_radek'))
  if (rows.length === 0) throw new AhlParseError(PAGE, 'tabulka týmů nemá žádný řádek')

  return rows.map((tr, i) => {
    const cell = (c: string) => {
      const td = tr.querySelector(`td.${c}`)
      if (!td) throw new AhlParseError(PAGE, `řádek ${i + 1}: chybí sloupec ${c}`)
      return text(td)
    }
    const link = tr.querySelector('td.tabulka_team a')
    const team = text(link ?? tr.querySelector('td.tabulka_team'))
    if (!team) throw new AhlParseError(PAGE, `řádek ${i + 1}: prázdný název týmu`)

    const score = cell('tabulka_bilance').match(/^(\d+)\s*:\s*(\d+)/)
    if (!score) throw new AhlParseError(PAGE, `řádek ${i + 1}: skóre „${cell('tabulka_bilance')}"`)

    return {
      pos: requireInt(cell('tabulka_poradi'), PAGE, 'pořadí'),
      team,
      participantId: paramFromHref(link?.getAttribute('href'), 'ucastniksouteznihorocnikuid'),
      games: requireInt(cell('tabulka_zapasy'), PAGE, 'Z'),
      wins: requireInt(cell('tabulka_vyhry'), PAGE, 'V'),
      otWins: requireInt(cell('tabulka_prodlouzeni'), PAGE, 'VP'),
      otLosses: requireInt(cell('tabulka_remizy'), PAGE, 'R'),
      losses: requireInt(cell('tabulka_prohry'), PAGE, 'P'),
      goalsFor: +score[1],
      goalsAgainst: +score[2],
      points: requireInt(cell('tabulka_body'), PAGE, 'B'),
    }
  })
}
