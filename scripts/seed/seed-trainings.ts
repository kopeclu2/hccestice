/**
 * Naimportuje rozpis tréninků do kolekce `trainings` z textového souboru,
 * jeden termín na řádek:
 *
 *   úterý    03.11.2026    16:00-17:15    trénink Muži + děti
 *
 * Řádky prázdné a začínající `#` se přeskakují. Za popis jde středníkem
 * poznámka: „trénink Muži; bez brankáře".
 *
 * Idempotentní: termín se stejným začátkem a skupinou se přeskočí, takže jde
 * soubor doplňovat a pouštět znovu. Nic se nemaže ani nepřepisuje. Sezónu
 * doplní hook kolekce podle data.
 *
 * Výchozí je **nanečisto** (jen vypíše, co by se stalo); zápis `--apply`.
 * Zápisy jdou s `disableRevalidate` (mimo Next runtime `revalidateTag` padá),
 * proto se po `--apply` jednou zavolá `POST /internal/revalidate?scope=trainings`
 * na `127.0.0.1:$PORT` (potřebuje `CRON_SECRET` a běžící server). Bez toho se
 * web obnoví nejpozději za hodinu.
 *
 * Spuštění:
 *   bun --env-file=.env scripts/seed/seed-trainings.ts rozpis.txt
 *   bun --env-file=.env scripts/seed/seed-trainings.ts rozpis.txt --apply \
 *     --venue "ZS Rychnov nad Kněžnou"
 */
import { readFileSync } from 'node:fs'

import { getPayload } from 'payload'

import { pragueLocalToUtc } from '@/lib/datetime'
import { errorMessage } from '@/lib/errors'
import { parseTrainingLine } from '@/lib/trainingImport'
import config from '@/payload.config'

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const venueIndex = args.indexOf('--venue')
const venue = venueIndex >= 0 ? (args[venueIndex + 1]?.trim() ?? '') : ''
const file = args.find((arg, i) => !arg.startsWith('--') && args[i - 1] !== '--venue')

if (!file || (venueIndex >= 0 && !venue)) {
  console.error('Použití: seed-trainings.ts <soubor.txt> [--apply] [--venue "Místo"]')
  process.exit(1)
}

const lines = readFileSync(file, 'utf8')
  .split(/\r?\n/)
  .map((text, i) => ({ text: text.trim(), number: i + 1 }))
  .filter(({ text }) => text && !text.startsWith('#'))

const parsed = lines.map(({ text, number }) => ({ number, text, result: parseTrainingLine(text) }))
const errors = parsed.filter((row) => !row.result.ok)

for (const row of parsed) {
  if (!row.result.ok) console.error(`✗ řádek ${row.number}: ${row.result.error} — „${row.text}"`)
  else if (row.result.warning) console.warn(`! řádek ${row.number}: ${row.result.warning}`)
}

if (errors.length) {
  console.error(`\n${errors.length} řádků se nepodařilo přečíst, nic se nezapsalo.`)
  process.exit(1)
}

const payload = await getPayload({ config })

let created = 0
let skipped = 0

for (const { number, result } of parsed) {
  if (!result.ok) continue
  const { start, end, group, note } = result.training
  const date = pragueLocalToUtc(start).toISOString()

  const existing = await payload.find({
    collection: 'trainings',
    where: {
      and: [
        { date: { equals: date } },
        group ? { group: { equals: group } } : { group: { exists: false } },
      ],
    },
    limit: 1,
    depth: 0,
    pagination: false,
    select: {},
  })

  if (existing.docs.length) {
    skipped += 1
    console.log(`= řádek ${number}: ${start} ${group ?? ''} už existuje`)
    continue
  }

  console.log(
    `${apply ? '+' : '·'} řádek ${number}: ${start}${end ? `–${end.slice(11)}` : ''} ${group ?? ''}`,
  )
  if (!apply) continue

  await payload.create({
    collection: 'trainings',
    data: {
      date,
      endsAt: end ? pragueLocalToUtc(end).toISOString() : null,
      group,
      note,
      ...(venue ? { venue } : {}),
    },
    context: { disableRevalidate: true },
  })
  created += 1
}

if (apply && created > 0) {
  const secret = process.env.CRON_SECRET
  const url = `http://127.0.0.1:${process.env.PORT ?? 3000}/internal/revalidate?scope=trainings`
  try {
    if (!secret) throw new Error('CRON_SECRET není nastavený')
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    console.log('Web obnoven (tag trainings-list expirován).')
  } catch (err) {
    console.warn(
      `! Revalidace přes ${url} se nepovedla (${errorMessage(err)}); web se obnoví do hodiny.`,
    )
  }
}

console.log(
  apply
    ? `\nHotovo: založeno ${created}, přeskočeno ${skipped}.`
    : `\nNanečisto: ${parsed.length - skipped} k založení, ${skipped} už existuje. Zápis: --apply`,
)
process.exit(0)
