import type { CollectionBeforeChangeHook } from 'payload'

import { utcToPragueLocal } from '@/jobs/vchlSync/time'
import { matchSlug, uniqueSlug } from '@/lib/matchSlug'
import { slugifyCs } from '@/lib/slugifyCs'

import { resolveOpponent } from './resolveOpponent'

/**
 * Slug zápasu (`/zapasy/<slug>`) se vytvoří **jednou**: dokud dokument slug
 * nemá. Pozdější přeložení zápasu ani přejmenování soupeře ho nemění, aby
 * odkazy, které už někdo sdílel, dál vedly na tentýž zápas.
 *
 * Funguje i pro synchronizaci z AHL: job `slug` neposílá (`buildPatch`
 * prochází jen klíče z `desired`), takže se slug ve výpisu změn neobjeví;
 * zápis ho doplní teprve hook při `create`.
 */
export const generateMatchSlug: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  // Update jen s částí polí nenese `slug` — bere se z uloženého dokumentu.
  // Explicitní prázdná hodnota ale znamená „vygenerovat znovu". `null` je
  // i hodnota, kterou při duplikaci nastaví `beforeDuplicate` pole slug
  // (`originalDoc` je pak kopie originálu bez `id` a bez adresy).
  const current: unknown = data.slug !== undefined ? data.slug : originalDoc?.slug
  // Ručně zadaný slug se očistí, aby se do URL nedostala mezera nebo
  // diakritika. Když z něj po očištění nic nezbude („???"), je to jako
  // prázdné pole a generuje se z data a soupeře.
  const cleaned = typeof current === 'string' ? slugifyCs(current) : ''
  if (cleaned) {
    if (typeof data.slug === 'string') data.slug = cleaned
    return data
  }

  const date = data.date ?? originalDoc?.date
  if (!date) return data
  const { day } = utcToPragueLocal(date)

  // Soupeř: update nemusí nést `opponent`, relace může být i populovaná.
  // Neexistující soupeř dá slug jen ze dne. Pojistka: slug soupeře má být už
  // čistý, ale zapsat ho do URL bez kontroly by znamenalo spoléhat na jinou
  // kolekci.
  const opponent = await resolveOpponent(req, data.opponent ?? originalDoc?.opponent)
  const opponentSlug = opponent?.slug ? slugifyCs(opponent.slug) : null

  const id = originalDoc?.id
  data.slug = await uniqueSlug(matchSlug(day, opponentSlug), async (slug) => {
    const { totalDocs } = await req.payload.count({
      collection: 'matches',
      where: {
        and: [{ slug: { equals: slug } }, ...(id != null ? [{ id: { not_equals: id } }] : [])],
      },
      req,
    })
    return totalDocs > 0
  })
  return data
}
