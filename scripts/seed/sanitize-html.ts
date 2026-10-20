/**
 * Jednorázově vyčistí uložené surové HTML od skriptů, událostí (`onclick`),
 * formulářů a cizích iframů — stejnou funkcí jako hook při uložení
 * (`hooks/sanitizeHtml`). Dosud uložená data totiž hook nikdy neviděla.
 *
 * Prochází čtyři sloupce: `posts.legacy_html`, `_posts_v.version_legacy_html`
 * (verze, aby obnovení staré verze nevrátilo nečistý obsah) a `html` bloku
 * RawHtml na `pages_blocks_raw_html` / `_pages_v_blocks_raw_html`.
 *
 * Píše přímým SQL, ne přes `payload.update`: update by u každého článku
 * založil novou verzi a přepsal `updatedAt` (a tím `lastmod` v sitemapě)
 * kvůli změně, která pro čtenáře není obsahem. Revalidace se proto neděje
 * (`revalidateTag` mimo Next runtime by stejně spadl) — upravené stránky se
 * obnoví po vypršení ISR / příštím buildu.
 *
 * Výchozí je nanečisto: vypíše, co by se změnilo. Zápis až s `--apply`.
 * Idempotentní — druhý běh hlásí 0 změn.
 *
 * Spuštění přes **tsx (Node), ne bun**:
 *   PAYLOAD_CRON=off node --env-file=.env node_modules/.bin/tsx scripts/seed/sanitize-html.ts [--apply]
 * Pod bunem jsdom při zpracování 100+ velkých dokumentů nedrží paměť
 * (RSS přes 12 GB, běh se zasekne); pod Nodem — tedy tak, jak sanitizace
 * běží v produkci — to celé trvá pár sekund.
 */
import { getPayload } from 'payload'

import type { SanitizeReport } from '@/hooks/sanitizeHtml'
import { sanitizeHtmlWithReport } from '@/hooks/sanitizeHtml'
import config from '@/payload.config'

const APPLY = process.argv.includes('--apply')

type Target = { table: string; column: string; label: string }

const TARGETS: Target[] = [
  { table: 'posts', column: 'legacy_html', label: 'posts.legacyHtml' },
  { table: '_posts_v', column: 'version_legacy_html', label: '_posts_v.legacyHtml (verze)' },
  { table: 'pages_blocks_raw_html', column: 'html', label: 'pages: blok RawHtml' },
  { table: '_pages_v_blocks_raw_html', column: 'html', label: '_pages_v: blok RawHtml (verze)' },
]

/** Minimální tvar `pg.Pool`, který tu potřebujeme; adaptér ho typuje až uvnitř. */
type Queryable = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>
}

const payload = await getPayload({ config })
// `payload.db` je v typech obecný adaptér; Postgres adaptér pod ním drží `pool`.
const pool = (payload.db as unknown as { pool: Queryable }).pool

const emptyTotals = (): SanitizeReport => ({ tags: {}, attrs: {}, iframeHosts: {}, styleProps: {} })

function merge(into: Record<string, number>, from: Record<string, number>): void {
  for (const [key, count] of Object.entries(from)) into[key] = (into[key] ?? 0) + count
}

function format(counter: Record<string, number>, limit = 12): string {
  const entries = Object.entries(counter).sort((a, b) => b[1] - a[1])
  if (entries.length === 0) return '-'
  const shown = entries.slice(0, limit).map(([key, count]) => `${key}×${count}`)
  const rest = entries.length - shown.length
  return shown.join(' ') + (rest > 0 ? ` (+${rest})` : '')
}

const grand = emptyTotals()
let grandChanged = 0
let grandRows = 0

for (const { table, column, label } of TARGETS) {
  const { rows } = await pool.query(
    `SELECT id, "${column}" AS html FROM "${table}" WHERE "${column}" IS NOT NULL`,
  )
  const totals = emptyTotals()
  let changed = 0

  console.log(`\n== ${label}: ${rows.length} záznamů`)

  for (const row of rows) {
    const original = String(row.html)
    const { html: clean, report } = sanitizeHtmlWithReport(original)
    if (clean === original) continue

    changed++
    merge(totals.tags, report.tags)
    merge(totals.attrs, report.attrs)
    merge(totals.iframeHosts, report.iframeHosts)
    merge(totals.styleProps, report.styleProps)

    // Řádek na dokument jen u dokumentů, kde zmizelo něco nebezpečnějšího
    // než `class` a nepodporovaný `style` (jinak by výpis měl stovky řádků).
    const notable = { ...report.tags, ...report.iframeHosts }
    const onHandlers = Object.keys(report.attrs).filter((name) => name.startsWith('on'))
    if (Object.keys(notable).length > 0 || onHandlers.length > 0) {
      console.log(
        `  ${table}#${String(row.id)}: tagy ${format(report.tags, 6)} | iframe ${format(report.iframeHosts, 4)} | on* ${onHandlers.join(',') || '-'}`,
      )
    }

    if (APPLY) {
      await pool.query(`UPDATE "${table}" SET "${column}" = $1 WHERE id = $2`, [clean, row.id])
    }
  }

  console.log(`  změní se: ${changed} z ${rows.length}`)
  console.log(`  odstraněné tagy:      ${format(totals.tags)}`)
  console.log(`  odstraněné atributy:  ${format(totals.attrs)}`)
  console.log(`  vyhozené iframy:      ${format(totals.iframeHosts)}`)
  console.log(`  vyhozené CSS:         ${format(totals.styleProps)}`)

  grandChanged += changed
  grandRows += rows.length
  merge(grand.tags, totals.tags)
  merge(grand.attrs, totals.attrs)
  merge(grand.iframeHosts, totals.iframeHosts)
  merge(grand.styleProps, totals.styleProps)
}

console.log(
  `\n== CELKEM: ${grandChanged} z ${grandRows} záznamů ${APPLY ? 'PŘEPSÁNO' : 'by se změnilo'}`,
)
console.log(`  tagy:     ${format(grand.tags, 30)}`)
console.log(`  atributy: ${format(grand.attrs, 30)}`)
console.log(`  iframy:   ${format(grand.iframeHosts, 30)}`)
console.log(`  CSS:      ${format(grand.styleProps, 30)}`)
if (!APPLY) console.log('\nNanečisto — nic se nezapsalo. Zápis: --apply')

process.exit(0)
