/**
 * Seed kolekce players z fotek „Hráči-2025" (ftp_mirror/hraci-2025).
 *
 * Jména z názvů souborů (prijmeni-jmeno.jpg) + mapa diakritiky.
 * Fotky se NEnahrávají znovu — nalinkují se existující media
 * (import je nahrál se source='photo' podle p_photos.id).
 *
 * Model: hráč = osoba s příznakem „active" (číslo/post se doplní ručně).
 * Idempotentní: existující hráč (dle jména) se přeskočí.
 *
 * Spuštění: bun --env-file=.env migration/seed-players.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GALLERY_LEGACY_DIR = 100149 // „Hráči-2025"

// filename (bez diakritiky) → správné české jméno
const NAME_MAP: Record<string, string> = {
  'simerda-filip': 'Filip Šimerda',
  'skala-daniel': 'Daniel Skála',
  'sverak-david': 'David Šverák',
  'vasata-marek': 'Marek Vašata',
  'barta-jaroslav': 'Jaroslav Bárta',
  'beranek-lukas': 'Lukáš Beránek',
  'dvorak-martin': 'Martin Dvořák',
  'hlousek-ondrej': 'Ondřej Hloušek',
  'javurek-jakub': 'Jakub Javůrek',
  'javurek-jan': 'Jan Javůrek',
  'javurek-michal': 'Michal Javůrek',
  'javurek-vladimir': 'Vladimír Javůrek',
  'jirka-antonin': 'Antonín Jirka',
  'karasek-jan': 'Jan Karásek',
  'kaspar-josef': 'Josef Kašpar',
  'kolar-ales': 'Aleš Kolář',
  'kopecky-tomas': 'Tomáš Kopecký',
  'machacek-jaroslav': 'Jaroslav Macháček',
  'marek-filip': 'Filip Marek',
  'mraz-martin': 'Martin Mráz',
  'novotny-jakub': 'Jakub Novotný',
  'sadjl-radin': 'Radim Sajdl', // překlep v názvu souboru (sadjl-radin)
  'sajdl-jakub': 'Jakub Sajdl',
  'sajdl-lukas': 'Lukáš Sajdl',
  'sajdl-vojtech': 'Vojtěch Sajdl',
}

async function main() {
  const payload = await getPayload({ config })

  // fotky z galerie „Hráči-2025" (parser data) → p_photos.legacyId → media
  const galleries = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'galleries.json'), 'utf8'),
  )
  const gallery = galleries.find((g: any) => g.legacyDir === GALLERY_LEGACY_DIR)
  if (!gallery) throw new Error('Galerie Hráči-2025 nenalezena v datech parseru')

  let created = 0
  let skipped = 0

  for (const photo of gallery.photos) {
    const key = photo.filename.replace(/\.[a-z0-9]+$/i, '').toLowerCase()
    const name = NAME_MAP[key]
    if (!name) {
      // akční fotky (img_8154.jpg…) nejsou portréty hráčů
      continue
    }

    // media dohledat podle legacy (source=photo, legacyId=p_photos.id)
    const media = (
      await payload.find({
        collection: 'media',
        where: {
          and: [
            { 'legacy.source': { equals: 'photo' } },
            { 'legacy.legacyId': { equals: photo.legacyId } },
          ],
        },
        limit: 1,
        depth: 0,
      })
    ).docs[0]
    if (!media) console.warn(`  ! foto nenalezeno v médiích: ${photo.filename}`)

    const existing = (
      await payload.find({
        collection: 'players',
        where: { name: { equals: name } },
        limit: 1,
        depth: 0,
      })
    ).docs[0]

    if (!existing) {
      await payload.create({
        collection: 'players',
        data: {
          name,
          photo: media?.id,
          active: true,
        } as any,
        context: { disableRevalidate: true },
      })
      console.log(`  + ${name}`)
      created++
    } else {
      skipped++
    }
  }

  const total = await payload.count({ collection: 'players' })
  console.log(`\nHráči: +${created} nových, ${skipped} beze změny, celkem ${total.totalDocs}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
