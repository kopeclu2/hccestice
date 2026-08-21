/**
 * Naplnění bloku „Landing — Historie" na home stránce texty z handoffu
 * („Sekce Historie na landing (finální)"). Zdrojem je konstanta `HISTORY`
 * v `src/landing/content.ts`, aby web i CMS měly stejný výchozí obsah.
 *
 * Idempotentní — pole se jen přepíšou, ostatní bloky layoutu zůstanou beze
 * změny. Spuštění:
 * bun --env-file=.env migration/seed-home-history.ts > /tmp/seed-home-history.log 2>&1
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

import { HISTORY } from '../src/landing/content'

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'home' } },
  limit: 1,
  depth: 0,
})

const home = docs[0]
if (!home) {
  payload.logger.error('Stránka „home" v CMS není — není co naplnit.')
  process.exit(1)
}

const layout = (home.layout ?? []) as unknown as Array<Record<string, unknown>>
const index = layout.findIndex((block) => block.blockType === 'landingHistory')
if (index === -1) {
  payload.logger.error('Home layout neobsahuje blok landingHistory — přidejte ho v adminu.')
  process.exit(1)
}

layout[index] = {
  ...layout[index],
  kicker: HISTORY.kicker,
  watermark: HISTORY.watermark,
  headlineStart: HISTORY.headlineStart,
  headlineHighlight: HISTORY.headlineHighlight,
  lead: HISTORY.lead,
  text: HISTORY.text,
  metaLine: HISTORY.metaLine,
  ctaLabel: HISTORY.ctaLabel,
  photosCtaLabel: HISTORY.photosCtaLabel,
  chips: HISTORY.chips.map((chip) => ({ label: chip.label, accent: chip.accent })),
  quote: {
    start: HISTORY.quoteStart,
    highlight: HISTORY.quoteHighlight,
    end: HISTORY.quoteEnd,
    source: HISTORY.quoteSource,
  },
}

// `_status` je potřeba poslat explicitně — bez něj Payload uloží dokument
// jako draft a home stránka by ze zveřejněné verze zmizela.
// `disableRevalidate` — hook `revalidatePage` volá next/cache, které mimo
// běžící Next kontext skončí chybou (ISR se stejně obnoví do 10 minut).
await payload.update({
  collection: 'pages',
  id: home.id,
  data: { layout, _status: 'published' } as never,
  context: { disableRevalidate: true },
})

payload.logger.info(`Blok Historie na stránce „home" (id ${home.id}) naplněn obsahem z handoffu.`)
process.exit(0)
