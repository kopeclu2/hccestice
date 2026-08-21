/**
 * Dopáruje loga soupeřům, kteří je nemají (vznikli při seedu z ahl.cz).
 *
 * Loga = existující media (nic se nenahrává). B-týmy sdílí logo klubu,
 * SK Divočáci Žamberk používá obrázek ze starého sidebar widgetu
 * (/img/picture/1222/…, jediné jejich logo, které starý web měl).
 *
 * Idempotentní: soupeř s již nastaveným logem se přeskočí.
 *
 * Spuštění: bun --env-file=.env migration/seed-opponent-logos.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

// opponents.slug → media.filename
const LOGO_MAP: Record<string, string> = {
  'hc-chocen-b': 'hc_chocen-2.png', // B-tým, logo klubu (stejné jako HC Spartak Choceň)
  'hc-litomysl-b': 'hc_litomysl_b.png',
  'hc-policka-b': 'hc_policka-4.png', // B-tým, logo klubu
  'rebels-policka': 'hc_rebels_policka.png',
  'sk-divocaci-zamberk': '582585458_122157757520624512_3809078566861193583_n.jpg',
  'zh-pardubice': 'zh_pardubice.png',
}

const payload = await getPayload({ config })

let updated = 0
let skipped = 0

const { docs: opponents } = await payload.find({ collection: 'opponents', limit: 0, depth: 0 })

for (const opp of opponents) {
  if (opp.logo) {
    skipped++
    continue
  }
  const filename = LOGO_MAP[opp.slug ?? '']
  if (!filename) {
    console.warn(`  ! ${opp.name}: bez loga a bez záznamu v mapě`)
    continue
  }
  const media = (
    await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]
  if (!media) {
    console.warn(`  ! ${opp.name}: media ${filename} nenalezeno`)
    continue
  }
  await payload.update({
    collection: 'opponents',
    id: opp.id,
    data: { logo: media.id },
    context: { disableRevalidate: true },
  })
  console.log(`  + ${opp.name} → ${filename}`)
  updated++
}

console.log(`\nSoupeři: +${updated} log doplněno, ${skipped} už mělo`)
process.exit(0)
