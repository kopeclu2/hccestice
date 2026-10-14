/**
 * Upozornění po běhu synchronizace VČHL (`jobs/vchlSync/notify.ts`).
 *
 * Jeden e-mail na běh, sekce podle typu události. HTML a text se skládají
 * ze stejných dat, ale zvlášť: `renderEmailText` z HTML odkazy zahazuje
 * (zbyde jen popisek), takže textová varianta nese adresu přímo v řádku.
 */
import { LANDING_COLORS as C } from '@/landing/tokens'
import { getServerSideURL } from '@/utilities/getURL'

import { emailBranding } from '../config'
import { escapeHtml, renderEmailHtml, renderEmailText, type RenderEmailArgs } from '../render'

export type NotifyWarning = { type: string; message: string; ref?: string | null }

export type PlayedMatch = {
  matchId: number
  /** `2026-10-04 doma Pardubice` */
  label: string
  /** `5:6 sn` z pohledu Čestic (naše:soupeř); chybí, když ho diff nenesl */
  score?: string
}

/** Co se má v e-mailu objevit; prázdné sekce se vynechávají. */
export type NotificationPlan = {
  failure?: { streak: number; status: 'error' | 'partial'; error?: string }
  recovered?: { after: number }
  newPlayers: NotifyWarning[]
  ambiguousPlayers: NotifyWarning[]
  newOpponents: NotifyWarning[]
  rescheduled: NotifyWarning[]
  results: PlayedMatch[]
  /** koncepty reportáže založené v tomto běhu */
  draftPosts: number
}

type Item = { text: string; href?: string }
type Section = { title: string; items: Item[]; note?: string }

/** České skloňování: 1 / 2–4 / 5+. */
export const plural = (n: number, one: string, few: string, many: string): string =>
  n === 1 ? one : n >= 2 && n <= 4 ? few : many

const MAX_ITEMS = 15

const cap = (items: Item[]): Item[] =>
  items.length <= MAX_ITEMS
    ? items
    : [...items.slice(0, MAX_ITEMS), { text: `… a dalších ${items.length - MAX_ITEMS}` }]

export function buildSubject(plan: NotificationPlan): string {
  const parts: string[] = []
  if (plan.failure) parts.push(`selhání (${plan.failure.streak}× po sobě)`)
  if (plan.recovered) parts.push('synchronizace obnovena')
  const n = (count: number, one: string, few: string, many: string) =>
    count > 0 ? parts.push(`${count} ${plural(count, one, few, many)}`) : undefined
  n(plan.newPlayers.length, 'nový hráč', 'noví hráči', 'nových hráčů')
  n(plan.ambiguousPlayers.length, 'nejednoznačný hráč', 'nejednoznační hráči', 'nejednoznačných hráčů')
  n(plan.newOpponents.length, 'nový soupeř', 'noví soupeři', 'nových soupeřů')
  n(plan.rescheduled.length, 'přeložený zápas', 'přeložené zápasy', 'přeložených zápasů')
  n(plan.results.length, 'nový výsledek', 'nové výsledky', 'nových výsledků')
  return `Synchronizace VČHL: ${parts.join(', ')}`
}

function sections(
  plan: NotificationPlan,
  linkFor: (w: NotifyWarning) => string | undefined,
  base: string,
): Section[] {
  const out: Section[] = []
  const warnItems = (ws: NotifyWarning[]): Item[] =>
    cap(ws.map((w) => ({ text: w.message, href: linkFor(w) })))

  if (plan.failure) {
    const { streak, status, error } = plan.failure
    out.push({
      title: 'Synchronizace selhává',
      items: [
        {
          text: `${streak} ${plural(streak, 'běh', 'běhy', 'běhů')} po sobě ${
            status === 'error' ? 'skončil chybou' : 'proběhl jen částečně'
          }.${error ? ` Poslední chyba: ${error.slice(0, 500)}` : ''}`,
        },
      ],
      note: 'Další selhání už upozornění neposílají; ozveme se, až synchronizace znovu proběhne bez chyby.',
    })
  }
  if (plan.recovered) {
    out.push({
      title: 'Synchronizace funguje znovu',
      items: [
        {
          text: `Po ${plan.recovered.after} ${plural(plan.recovered.after, 'selhání', 'selháních', 'selháních')} proběhl poslední běh bez chyby.`,
        },
      ],
    })
  }
  if (plan.newPlayers.length > 0) {
    out.push({
      title: 'Noví hráči',
      items: warnItems(plan.newPlayers),
      note: 'Hráči jsou založeni jako neaktivní — na soupisku je zařaďte v administraci.',
    })
  }
  if (plan.ambiguousPlayers.length > 0) {
    out.push({
      title: 'Nejednoznační hráči',
      items: warnItems(plan.ambiguousPlayers),
      note: 'Statistiky se jim nepřipisují, dokud nedoplníte AHL ID ručně.',
    })
  }
  if (plan.newOpponents.length > 0) {
    out.push({
      title: 'Noví soupeři',
      items: warnItems(plan.newOpponents),
      note: 'Doplňte jim logo a případně aliasy (pokud už existuje pod jiným názvem).',
    })
  }
  if (plan.rescheduled.length > 0) {
    out.push({ title: 'Přeložené zápasy', items: warnItems(plan.rescheduled) })
  }
  if (plan.results.length > 0) {
    out.push({
      title: 'Nové výsledky',
      items: cap(
        plan.results.map((r) => ({ text: `${r.label}${r.score ? ` — ${r.score}` : ''}` })),
      ),
      note:
        plan.draftPosts > 0
          ? `Založeno ${plan.draftPosts} ${plural(plan.draftPosts, 'koncept reportáže', 'koncepty reportáží', 'konceptů reportáží')} — najdete je mezi články: ${base}/admin/collections/posts`
          : undefined,
    })
  }
  return out
}

const sectionHtml = (s: Section): string =>
  `<div style="margin:0 0 20px;">` +
  `<h3 style="margin:0 0 8px;font-size:16px;line-height:1.4;font-weight:700;color:${C.ink};">${escapeHtml(s.title)}</h3>` +
  s.items
    .map(
      (i) =>
        `<div style="margin:0 0 6px;color:${C.dim};">&bull; ${escapeHtml(i.text)}${
          i.href
            ? ` <a href="${escapeHtml(i.href)}" style="color:${C['club-dark']};text-decoration:none;">Otevřít</a>`
            : ''
        }</div>`,
    )
    .join('') +
  (s.note
    ? `<div style="margin:8px 0 0;font-size:13px;line-height:1.5;color:${C.faint};">${escapeHtml(s.note)}</div>`
    : '') +
  `</div>`

/** Plain text: nadpis, odrážky, adresa za řádkem. */
const sectionText = (s: Section): string =>
  [
    s.title.toUpperCase(),
    ...s.items.map((i) => `- ${i.text}${i.href ? `\n  ${i.href}` : ''}`),
    s.note ? `(${s.note})` : '',
  ]
    .filter(Boolean)
    .join('\n')

/**
 * Sestaví předmět, HTML i text. `linkFor` vrací odkaz do administrace
 * k položce varování (hráč podle AHL ID) nebo `undefined`.
 */
export function renderVchlSyncEmail(
  plan: NotificationPlan,
  linkFor: (w: NotifyWarning) => string | undefined = () => undefined,
): { subject: string; html: string; text: string } {
  const base = getServerSideURL()
  const subject = buildSubject(plan)
  const secs = sections(plan, linkFor, base)

  const common: RenderEmailArgs = {
    ...emailBranding(),
    heading: subject,
    paragraphs: ['Automatická synchronizace s ahl.cz hlásí:'],
    button: { href: `${base}/admin/vchl-sync`, label: 'Otevřít synchronizaci VČHL' },
    footnote: 'Rozsah upozornění a příjemce nastavíte v administraci: Hokej → Synchronizace VČHL.',
  }

  return {
    subject,
    html: renderEmailHtml({ ...common, bodyHtml: secs.map(sectionHtml).join('') }),
    text: renderEmailText({ ...common, bodyHtml: escapeHtml(secs.map(sectionText).join('\n\n')).replace(/\n/g, '<br />') }),
  }
}
