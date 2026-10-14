/** Formátování pro ovládací stránku synchronizace (česky, pražský čas). */

import { plural } from '@/utilities/plural'

const dtf = new Intl.DateTimeFormat('cs-CZ', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Prague',
})

export const fmtDate = (iso?: string | null) => (iso ? dtf.format(new Date(iso)) : '—')

export function fmtDuration(startIso?: string | null, endIso?: string | null): string {
  if (!startIso || !endIso) return '—'
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime()
  if (!Number.isFinite(ms) || ms < 0) return '—'
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1).replace('.', ',')} s`
}

/** Za jak dlouho / před jak dlouho — hrubě, pro „další běh". */
export function fmtRelative(iso?: string | null, now = Date.now()): string {
  if (!iso) return ''
  const diff = new Date(iso).getTime() - now
  const abs = Math.abs(diff)
  const min = Math.round(abs / 60_000)
  const text =
    min < 1 ? 'okamžik' : min < 60 ? `${min} min` : min < 2880 ? `${Math.round(min / 60)} h` : `${Math.round(min / 1440)} dní`
  if (min < 1) return 'právě teď'
  return diff >= 0 ? `za ${text}` : `před ${text}`
}

export const STATUS_LABEL: Record<string, string> = {
  ok: 'V pořádku',
  partial: 'Částečně',
  error: 'Chyba',
  skipped: 'Přeskočeno',
}

export const TRIGGER_LABEL: Record<string, string> = {
  cron: 'Plánovač',
  manual: 'Ručně',
  dry: 'Nanečisto',
}

export const WARNING_LABEL: Record<string, string> = {
  'unknown-player': 'Neznámý hráč',
  'unknown-opponent': 'Neznámý soupeř',
  'ambiguous-player': 'Nejednoznačný hráč',
  rescheduled: 'Přeložený zápas',
  'missing-on-ahl': 'Zápas chybí na AHL',
  'stats-mismatch': 'Neshoda statistik',
  other: 'Jiné',
}

export const ENTITY_LABEL: Record<string, string> = {
  matches: 'Zápasy',
  players: 'Hráči',
  opponents: 'Soupeři',
  seasons: 'Sezóny',
  posts: 'Koncepty článků',
}

/** Tvary pro skloňování: 1 / 2–4 / 5+ (`plural`). */
const CHANGE_LABEL: Record<string, [one: string, few: string, many: string]> = {
  matchesCreated: ['zápas přidán', 'zápasy přidány', 'zápasů přidáno'],
  matchesUpdated: ['zápas upraven', 'zápasy upraveny', 'zápasů upraveno'],
  playersCreated: ['hráč přidán', 'hráči přidáni', 'hráčů přidáno'],
  playersUpdated: ['hráč upraven', 'hráči upraveni', 'hráčů upraveno'],
  opponentsCreated: ['soupeř přidán', 'soupeři přidáni', 'soupeřů přidáno'],
  standingsUpdated: ['tabulka aktualizována', 'tabulky aktualizovány', 'tabulek aktualizováno'],
  draftPosts: ['koncept článku', 'koncepty článků', 'konceptů článků'],
}

export function totalChanges(changes: unknown): number {
  if (!changes || typeof changes !== 'object') return 0
  return Object.values(changes as Record<string, unknown>).reduce<number>(
    (sum, v) => sum + (typeof v === 'number' ? v : 0),
    0,
  )
}

export function describeChanges(changes: unknown): string {
  if (!changes || typeof changes !== 'object') return 'beze změn'
  const parts = Object.entries(changes as Record<string, unknown>)
    .filter(([, v]) => typeof v === 'number' && v > 0)
    .map(([k, v]) => {
      const l = CHANGE_LABEL[k]
      return l ? `${v} ${plural(v as number, ...l)}` : `${v} ${k}`
    })
  return parts.length ? parts.join(', ') : 'beze změn'
}
