/**
 * Synchronizace kolekce players s oficiální soupiskou HC Čestice na AHL.cz
 * (Východočeská hokejová liga, VČHL 1. ročník, ucastniksouteznihorocnikuid=8650).
 *
 * Zdroj:
 *   soupiska  https://www.ahl.cz/soutez/vychodoceska_hokejova_liga/statistiky/?limit=500&ucastniksouteznihorocnikuid=8650&souteznirocnikids%5B%5D=973&order=-1
 *   čísla     https://www.ahl.cz/soutez/vychodoceska_hokejova_liga/hrac/?hracid=<ahlId>
 *
 * Data jsou odsud opsaná do tabulky ROSTER (skript nechodí na síť, je tedy
 * deterministický). `ahlId` se do DB neukládá — schéma pro něj pole nemá.
 *
 * Co AHL o postu říct umí a co ne:
 *   - `B` = brankář → position 'G'
 *   - `O/Ú` = obránce NEBO útočník, sloučeně → post se NEDOPLŇUJE, jinak by
 *     se polovina kádru označila věcně špatně. Zůstává na ruční editaci v adminu.
 *
 * Idempotentní: existující hráč se dohledá podle normalizovaného jména a doplní
 * se mu jen PRÁZDNÁ pole (ruční editace v adminu má přednost). Druhý běh proto
 * hlásí „0 aktualizováno".
 *
 * Hráči, kteří jsou v DB, ale na aktuální AHL soupisce nejsou, se NEDEAKTIVUJÍ —
 * jen se vypíšou. Nenastoupit do zápasu neznamená nebýt v kádru.
 *
 * Spuštění: bun --env-file=.env migration/sync-players-ahl.ts
 * Výstup jde i do migration/sync-players-ahl.log (stdout se v bunu ztrácí).
 */
import { writeFileSync } from 'node:fs'
import { getPayload } from 'payload'

import config from '../src/payload.config'

type RosterPlayer = {
  /** ID karty hráče na AHL.cz — jen pro dohledání zdroje, do DB nejde. */
  ahlId: number
  name: string
  /** Číslo dresu z karty hráče; chybí i na AHL → nechat prázdné. */
  number?: number
  /** Jen 'G' — obránce/útočník AHL nerozlišuje. */
  position?: 'G'
}

// Pořadí = pořadí v tabulce statistik (podle bodů).
const ROSTER: RosterPlayer[] = [
  { ahlId: 38010, name: 'Lukáš Sajdl', number: 25 },
  { ahlId: 38031, name: 'Vojtěch Kapucián', number: 14 },
  { ahlId: 38011, name: 'Radim Sajdl', number: 15 },
  { ahlId: 38032, name: 'David Morong', number: 19 },
  { ahlId: 38029, name: 'Daniel Skála', number: 21 },
  { ahlId: 40093, name: 'Petr Kulhánek', number: 8 },
  { ahlId: 38009, name: 'Jan Vacek', number: 17 },
  { ahlId: 38014, name: 'Jiří Kozel', number: 20 },
  { ahlId: 38022, name: 'Aleš Kolář' },
  { ahlId: 38028, name: 'Jakub Javůrek' },
  { ahlId: 38025, name: 'Marek Vašata', number: 27 },
  { ahlId: 38030, name: 'Tomáš Hernych', number: 12 },
  { ahlId: 38026, name: 'Martin Mráz', number: 26 },
  { ahlId: 38015, name: 'Filip Šimerda', number: 28 },
  { ahlId: 38012, name: 'Jan Javůrek', number: 9 },
  { ahlId: 38017, name: 'Richard Pitch', number: 23 },
  { ahlId: 38007, name: 'David Šverák', number: 11 },
  { ahlId: 38013, name: 'Martin Dvořák', number: 22 },
  { ahlId: 38024, name: 'Václav Kubasa' },
  { ahlId: 38021, name: 'Lukáš Jiruška', number: 7 },
  { ahlId: 40196, name: 'Antonín Jirka' },
  { ahlId: 38018, name: 'Vojtěch Sajdl' },
  { ahlId: 40546, name: 'Šimon Lenoch' },
  { ahlId: 38020, name: 'Matěj Vašata' },
  { ahlId: 38019, name: 'Tomáš Kopecký', number: 18 },
  { ahlId: 38005, name: 'Jan Šimon', number: 1, position: 'G' },
  { ahlId: 38008, name: 'Filip Marek', number: 13 },
  { ahlId: 38027, name: 'Lukáš Kubasa' },
  { ahlId: 38004, name: 'Jakub Novotný', number: 2, position: 'G' },
  { ahlId: 40548, name: 'Dušan Felcman', position: 'G' },
]

const lines: string[] = []
const log = (message: string) => {
  console.log(message)
  lines.push(message)
}

/** „Lukáš  Sajdl" → „lukas sajdl" — AHL i DB píšou jména různě. */
const normalize = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

const payload = await getPayload({ config })

// Všichni existující hráči najednou — matchování běží v paměti.
const existing = await payload.find({ collection: 'players', limit: 0, depth: 0 })
const byNormalizedName = new Map(existing.docs.map((doc) => [normalize(doc.name), doc]))

let created = 0
let updated = 0
let unchanged = 0

for (const row of ROSTER) {
  const doc = byNormalizedName.get(normalize(row.name))

  if (!doc) {
    // Fotku nový hráč nedostane — portréty jsou jen za sezónu 2025 a nové
    // tváře mezi nimi nejsou. Doplní se v adminu.
    await payload.create({
      collection: 'players',
      data: {
        name: row.name,
        number: row.number,
        position: row.position,
        active: true,
      },
      context: { disableRevalidate: true },
    })
    created++
    log(`  + ${row.name}${row.number ? ` #${row.number}` : ''}${row.position ? ' (G)' : ''}`)
    continue
  }

  // Doplňujeme jen prázdná pole — ruční editace v adminu má přednost.
  const patch: Partial<{ active: boolean; number: number; position: 'G' }> = {}
  if (doc.number == null && row.number != null) patch.number = row.number
  if (!doc.position && row.position) patch.position = row.position
  if (doc.active !== true) patch.active = true

  if (Object.keys(patch).length === 0) {
    unchanged++
    continue
  }

  await payload.update({
    collection: 'players',
    id: doc.id,
    data: patch,
    context: { disableRevalidate: true },
  })
  updated++
  log(`  ~ ${doc.name} (${Object.keys(patch).join(', ')})`)
}

// Hráči na soupisce, kterým chybí číslo dresu i na AHL.
for (const row of ROSTER) {
  if (row.number == null) log(`  ! bez čísla dresu na AHL: ${row.name}`)
}

// Hráči v DB, které soupiska nezná — jen upozornění, nic se s nimi nedělá.
const rosterNames = new Set(ROSTER.map((row) => normalize(row.name)))
for (const doc of existing.docs) {
  if (!rosterNames.has(normalize(doc.name))) {
    log(`  ? v DB, ale není na AHL soupisce: ${doc.name}`)
  }
}

const total = await payload.count({ collection: 'players' })
log(
  `\nHráči: +${created} nových, ${updated} aktualizováno, ${unchanged} bez změny, celkem ${total.totalDocs}`,
)

writeFileSync('migration/sync-players-ahl.log', `${lines.join('\n')}\n`)
process.exit(0)
