import { AhlParseError } from '../errors'
import type { AhlCompetitionInfo } from '../types'

import { paramFromHref, parseDocument, text } from './dom'

const PAGE = 'ročník'

/**
 * Autodetekce ID: ročník je `<option selected>` ve výběru ročníku, účastníci
 * jsou v rozbalovátku týmů (statistiky) nebo v odkazech `ucastnici/?…uid=`
 * (rozpis, výsledky, tabulky). Název v rozbalovátku je plný („HC Čestice").
 */
export function parseCompetitionInfo(html: string): AhlCompetitionInfo {
  const doc = parseDocument(html, PAGE)

  const yearSelect = doc.querySelector(
    'select[name="souteznirocnikid"], select[name="souteznirocnikids[0]"]',
  )
  const selected = yearSelect?.querySelector('option[selected]')
  const competitionYearId = Number.parseInt(selected?.getAttribute('value') ?? '', 10)
  if (!selected || !Number.isFinite(competitionYearId)) {
    throw new AhlParseError(PAGE, 'chybí vybraný ročník (select souteznirocnikid)')
  }
  const label = text(selected)

  const participants = new Map<number, string>()

  const teamSelect = doc.querySelector('select[name="ucastniksouteznihorocnikuid"]')
  if (teamSelect) {
    for (const o of Array.from(teamSelect.querySelectorAll('option'))) {
      const id = Number.parseInt(o.getAttribute('value') ?? '', 10)
      if (Number.isFinite(id)) participants.set(id, text(o))
    }
  }
  if (participants.size === 0) {
    for (const a of Array.from(doc.querySelectorAll('a[href*="ucastniksouteznihorocnikuid="]'))) {
      const id = paramFromHref(a.getAttribute('href'), 'ucastniksouteznihorocnikuid')
      const name = text(a)
      // Preferuje se první (nejdelší) název — tabulka má plné, rozpis krátké.
      if (id !== null && name && !participants.has(id)) participants.set(id, name)
    }
  }
  if (participants.size === 0) throw new AhlParseError(PAGE, 'nenalezen žádný účastník ročníku')

  return {
    competitionYearId,
    label,
    participants: Array.from(participants, ([participantId, name]) => ({ participantId, name })),
  }
}
