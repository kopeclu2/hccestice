/**
 * Nastaví widgetu Aktuality na úvodní stránce počet karet na 3.
 *
 * Změna `defaultValue` v configu bloku platí jen pro nově vkládané bloky —
 * existující dokument v databázi si drží uloženou hodnotu, takže se musí
 * přepsat zvlášť.
 *
 * Spuštění: bun --env-file=.env migration/set-news-count.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const COUNT = 3

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'home' } },
  limit: 1,
  depth: 0,
})

const page = docs[0]
if (!page) throw new Error('Stránka „home" v databázi není.')

const layout = (page.layout ?? []).map((block) =>
  block.blockType === 'landingNews' ? { ...block, count: COUNT } : block,
)

const touched = layout.filter(
  (block) => block.blockType === 'landingNews' && block.count === COUNT,
).length

if (touched === 0) throw new Error('Na stránce „home" žádný blok Aktuality není.')

await payload.update({
  collection: 'pages',
  id: page.id,
  data: { layout },
  // revalidatePath mimo Next runtime spadne na „static generation store missing"
  context: { disableRevalidate: true },
})

payload.logger.info(`Widget Aktuality: počet karet = ${COUNT} (bloků: ${touched})`)
process.exit(0)
