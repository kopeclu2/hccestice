/**
 * Sloučí duplikátní soupeře do původních (s logem).
 *
 * V produkci 1. 10. 2026 vznikli soupeři pod krátkými názvy z AHL
 * („Divočáci", „Skuteč"…) vedle původních z importu. Synchronizace je pak
 * páruje přesnou shodou jména, takže zápasy nové sezóny visely na
 * duplikátu bez loga.
 *
 * Pro každý pár: zápasy → originál, jméno a aliasy duplikátu → aliasy
 * originálu (jinak by synchronizace „Divočáky" založila znovu — se „SK
 * Divočáci Žamberk" se nespárují), duplikát smazat. Slugy zápasů se nemění.
 *
 * Páruje se podle slugu, ne id — lokální a produkční databáze se liší.
 * Idempotentní: chybějící duplikát se přeskočí.
 *
 * Spuštění: bun --env-file=.env migration/merge-duplicate-opponents.ts [--dry]
 */
import { getPayload } from 'payload'

import config from '../src/payload.config'

const DRY = process.argv.includes('--dry')
const ctx = { disableRevalidate: true }

// slug duplikátu → slug originálu
const MERGE: Record<string, string> = {
  divocaci: 'sk-divocaci-zamberk',
  'chocen-b': 'hc-chocen-b',
  skutec: 'hc-skutec',
  opocno: 'hc-opocno',
  'litomysl-b': 'hc-litomysl-b',
}

const payload = await getPayload({ config })

const bySlug = async (slug: string) =>
  (
    await payload.find({
      collection: 'opponents',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]

for (const [dupSlug, origSlug] of Object.entries(MERGE)) {
  const dup = await bySlug(dupSlug)
  const orig = await bySlug(origSlug)
  if (!dup) {
    console.log(`  = ${dupSlug}: duplikát neexistuje, přeskočeno`)
    continue
  }
  if (!orig) throw new Error(`Originál ${origSlug} pro ${dupSlug} neexistuje`)

  const { docs: matches } = await payload.find({
    collection: 'matches',
    where: { opponent: { equals: dup.id } },
    limit: 0,
    depth: 0,
    select: { slug: true },
  })

  const known = new Set([orig.name, ...(orig.aliases ?? []).map((a) => a.name)])
  const newAliases = [dup.name, ...(dup.aliases ?? []).map((a) => a.name)].filter(
    (name): name is string => Boolean(name) && !known.has(name as string),
  )

  console.log(
    `  ${DRY ? '~' : '+'} ${dup.name} (#${dup.id}) → ${orig.name} (#${orig.id}): ` +
      `${matches.length} zápasů [${matches.map((m) => m.slug).join(', ')}], ` +
      `aliasy +[${newAliases.join(', ')}]`,
  )
  if (DRY) continue

  // Alias dřív než přepojení: kdyby skript spadl uprostřed, synchronizace
  // už krátký název najde na originálu a duplikát nebude dál plnit.
  if (newAliases.length > 0) {
    await payload.update({
      collection: 'opponents',
      id: orig.id,
      data: {
        aliases: [
          ...(orig.aliases ?? []).map((a) => ({ name: a.name })),
          ...newAliases.map((name) => ({ name })),
        ],
      },
      context: ctx,
    })
  }
  for (const match of matches) {
    await payload.update({
      collection: 'matches',
      id: match.id,
      data: { opponent: orig.id },
      context: ctx,
    })
  }
  await payload.delete({ collection: 'opponents', id: dup.id, context: ctx })
}

process.exit(0)
