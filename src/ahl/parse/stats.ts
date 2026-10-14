import { AhlParseError } from '../errors'
import { displayName } from '../names'
import type { AhlPlayerStat } from '../types'
import { paramFromHref, parseDocument, requireInt, text } from './dom'

const PAGE = 'statistiky'

/** Souhrn hráčů týmu; v pipeline slouží jako kontrolní součet proti zápisům. */
export function parsePlayerStats(html: string): AhlPlayerStat[] {
  const doc = parseDocument(html, PAGE)
  const table = doc.querySelector('table#tabulka_statistiky')
  if (!table) throw new AhlParseError(PAGE, 'chybí tabulka #tabulka_statistiky')

  for (const c of ['tabulka_jmeno', 'tabulka_zapasy', 'tabulka_goly', 'tabulka_asistence', 'tabulka_body', 'tabulka_trestne_minuty']) {
    if (!table.querySelector(`tr.tabulka_radek_nadpis th.${c}`)) {
      throw new AhlParseError(PAGE, `v záhlaví chybí sloupec ${c}`)
    }
  }

  // Prázdná tabulka je platná (začátek sezóny, nikdo ještě nehrál).
  return Array.from(table.querySelectorAll('tr.tabulka_radek')).map((tr, i) => {
    const cell = (c: string) => text(tr.querySelector(`td.${c}`))
    const link = tr.querySelector('td.tabulka_jmeno a')
    const raw = link?.textContent ?? ''
    if (!raw.trim()) throw new AhlParseError(PAGE, `řádek ${i + 1}: chybí jméno`)
    const postCell = Array.from(tr.querySelectorAll('td.tabulka_team_zkratka')).find((td) => td.querySelector('abbr[title]') && /^(B|H\/B|O|Ú|O\/Ú)$/.test(text(td)))
    return {
      playerId: paramFromHref(link?.getAttribute('href'), 'hracid'),
      // Ve statistikách je jméno bez čárky: „Sajdl Lukáš" (Příjmení Jméno).
      name: displayName(raw, 'last-first'),
      games: requireInt(cell('tabulka_zapasy'), PAGE, 'Z'),
      goals: requireInt(cell('tabulka_goly'), PAGE, 'G'),
      assists: requireInt(cell('tabulka_asistence'), PAGE, 'A'),
      points: requireInt(cell('tabulka_body'), PAGE, 'B'),
      pim: requireInt(cell('tabulka_trestne_minuty'), PAGE, 'TM'),
      goalie: text(postCell) === 'B',
    }
  })
}
