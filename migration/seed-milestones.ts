/**
 * Naplnění kolekce `milestones` (timeline na /historie-klubu) obsahem
 * z handoffu „HC Cestice Historie" — texty z `HISTORY_PAGE.fallbackMilestones`,
 * fotky se párují na archivní skeny v Media podle názvu souboru.
 *
 * Idempotentní (podle roku + titulku). Spuštění:
 * bun --env-file=.env migration/seed-milestones.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

import { HISTORY_PAGE } from '../src/landing/content'

const payload = await getPayload({ config })
const ctx = { disableRevalidate: true }

/** Rok milníku → základ názvu archivní fotky v Media (bez přípony a suffixů). */
const PHOTO_BY_YEAR: Record<string, string> = {
  '1954': 'sport_hokej_druzstvo_1966',
  '1955': 'sport_hokej_druzstvo_1968',
  '1959': 'sport_hokej_zaci_1',
  '2007': 'nova-rolba',
  '2008': 'nove-osvetleni-noc',
  '2026': 'p3081016',
}

/** Nejstarší (původní) media dokument, jehož filename začíná daným základem. */
const findPhoto = async (base: string): Promise<number | null> => {
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { like: base } },
    sort: 'id',
    limit: 1,
    depth: 0,
  })
  return docs[0]?.id ?? null
}

let created = 0
let skipped = 0

for (const [index, row] of HISTORY_PAGE.fallbackMilestones.entries()) {
  const { totalDocs } = await payload.find({
    collection: 'milestones',
    where: { and: [{ year: { equals: row.year } }, { title: { equals: row.title } }] },
    limit: 0,
    depth: 0,
  })
  if (totalDocs > 0) {
    skipped += 1
    continue
  }

  const base = PHOTO_BY_YEAR[row.year]
  const photo = base ? await findPhoto(base) : null
  if (base && !photo) {
    console.warn(`Fotka „${base}" pro rok ${row.year} v Media nenalezena — milník bude bez fotky`)
  }

  await payload.create({
    collection: 'milestones',
    data: {
      year: row.year,
      era: row.era,
      title: row.title,
      text: row.text,
      photo,
      // Krok 10 kvůli pozdějšímu vkládání milníků mezi existující.
      order: (index + 1) * 10,
    },
    context: ctx,
  })
  created += 1
}

console.log(`Milníky: ${created} vytvořeno, ${skipped} přeskočeno (už existují)`)
process.exit(0)
