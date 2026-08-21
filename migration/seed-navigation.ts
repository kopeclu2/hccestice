/**
 * Naplnění navigace v CMS podle `FALLBACK_NAV` z `src/landing/content.ts`.
 *
 * Vytvoří kontejner `hlavni` a jednu položku ke každému odkazu. Položky bez
 * podstránky (`path === null`) dostanou `url` prázdné a spoléhají jen na
 * `anchor`; položky bez kotvy (`anchor === null`) naopak vedou přímo na
 * cestu. Typ je vždy `external` — v pluginu to znamená „cíl zadaný textem",
 * protože ručně psané Next stránky (/zapasy, /soupiska…) nejsou dokumenty
 * v kolekci `pages` a varianta `internal` vyžaduje povinnou relaci.
 *
 * Idempotentní: kontejner se hledá podle `slug` (unique), položky podle
 * `title`. Opakované spuštění existující dokumenty aktualizuje.
 *
 * Spuštění: bun --env-file=.env migration/seed-navigation.ts
 */
import type { NavigationItem } from '../src/payload-types'

import { getPayload } from 'payload'
import config from '../src/payload.config'

import { FALLBACK_NAV } from '../src/landing/content'

const payload = await getPayload({ config })
const ctx = { disableRevalidate: true }

const CONTAINER_SLUG = 'hlavni'

const itemIds: number[] = []

for (const item of FALLBACK_NAV) {
  const data = {
    title: item.label,
    type: 'external' as const,
    url: item.path ?? '',
    // `anchor` je v CMS `select`, takže vygenerovaný typ je union hodnot.
    // `FALLBACK_NAV` je zdroj té množiny, proto cast, ne validace.
    anchor: (item.anchor ?? undefined) as NavigationItem['anchor'],
    target: '_self' as const,
    active: true,
  }

  const existing = await payload.find({
    collection: 'navigation-items',
    where: { title: { equals: item.label } },
    limit: 1,
  })

  // `payload.update` má návratový typ unii s bulk variantou i při zadaném
  // `id`; s jedním dokumentem je to vždy `NavigationItem`.
  const doc = existing.docs[0]
    ? ((await payload.update({
        collection: 'navigation-items',
        id: existing.docs[0].id,
        data,
        context: ctx,
      })) as NavigationItem)
    : await payload.create({ collection: 'navigation-items', data, context: ctx })

  itemIds.push(doc.id)
  console.log(`  ${existing.docs[0] ? 'aktualizováno' : 'vytvořeno'}: ${item.label}`)
}

const containerData = {
  name: 'Hlavní navigace',
  slug: CONTAINER_SLUG,
  description: 'Odkazy v horní liště na homepage i podstránkách.',
  items: itemIds,
}

const existingContainer = await payload.find({
  collection: 'navigation-containers',
  where: { slug: { equals: CONTAINER_SLUG } },
  limit: 1,
})

if (existingContainer.docs[0]) {
  await payload.update({
    collection: 'navigation-containers',
    id: existingContainer.docs[0].id,
    data: containerData,
    context: ctx,
  })
  console.log(`\nKontejner „${CONTAINER_SLUG}" aktualizován (${itemIds.length} položek).`)
} else {
  await payload.create({
    collection: 'navigation-containers',
    data: containerData,
    context: ctx,
  })
  console.log(`\nKontejner „${CONTAINER_SLUG}" vytvořen (${itemIds.length} položek).`)
}

process.exit(0)
