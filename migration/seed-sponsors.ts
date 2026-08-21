/**
 * Seed kolekce sponsors — aktuální partneři klubu (loga ze starého webu,
 * kontakty z handoffu `design_sponzori/HC Cestice Sponzori.dc.html`).
 * Loga už jsou v kolekci media (nahrál je import obsahu) — dohledávají se
 * podle filename.
 *
 * Idempotentní: existující partner se dohledá podle názvu / aliasu /
 * normalizovaného názvu a doplní se mu jen PRÁZDNÁ pole. Druhý běh proto
 * hlásí „0 aktualizováno".
 *
 * Spuštění: bun --env-file=.env migration/seed-sponsors.ts
 * Výstup jde i do migration/seed-sponsors.log (stdout se v bunu ztrácí).
 */
import { writeFileSync } from 'node:fs'
import { getPayload } from 'payload'

import config from '../src/payload.config'

type SeedSponsor = {
  /** Názvy z původního webu / handoffu, pod kterými může partner být v DB. */
  aliases?: string[]
  address: string
  email: string
  logoFile: string
  name: string
  person?: string
  phone: string
  url?: string
}

// Pořadí = pořadí na původní stránce Sponzoři
const SPONSORS: SeedSponsor[] = [
  {
    name: 'Obec Čestice',
    logoFile: 'znak-obec-cestice.jpg',
    url: 'https://www.obeccestice.cz',
    address: 'Čestice 94, Kostelec nad Orlicí, 517 41',
    phone: '+420 494 323 636',
    email: 'obeccestice@iol.cz',
  },
  {
    name: 'Energomontáže Votroubek s.r.o.',
    logoFile: 'logo--1-.jpg',
    url: 'https://www.energomontaze.cz',
    address: 'Strojnická 1646, Rychnov nad Kněžnou, 516 01',
    phone: '+420 770 110 048',
    email: 'info@energomontaze.cz',
  },
  {
    name: 'HOLMER CZ s.r.o.',
    aliases: ['HOLMER CZ, s.r.o.'],
    logoFile: '2020-08_logo-holmer_schwarz-rot.png',
    url: 'https://www.holmer.cz',
    address: 'Zámecká 130, Hradec Králové – Stěžery, 503 21',
    phone: '+420 495 453 424',
    email: 'info@holmer.cz',
  },
  {
    name: 'MH servis plus s.r.o.',
    logoFile: 'mh-servis--.png',
    url: 'https://www.mh-klimatizace.cz',
    address: 'Jiráskova 1071, Rychnov nad Kněžnou, 516 01',
    phone: '+420 720 037 076',
    email: 'info@mh-klimatizace.cz',
  },
  {
    name: 'TIPO creative',
    logoFile: 'tipo-creative.png',
    url: 'https://www.tipo.cz',
    address: 'Špindlerova 706, Ústí nad Orlicí, 562 01',
    phone: '+420 606 707 813',
    email: 'info@tipo.cz',
  },
  {
    name: 'TechTronix',
    logoFile: 'techtronix.png',
    url: 'https://www.facebook.com/profile.php?id=61555067564084',
    person: 'Michal Šverák',
    address: 'Na Jamách 1427, Rychnov nad Kněžnou, 516 01',
    phone: '+420 728 747 474',
    email: 'info@techtronix.cz',
  },
  {
    name: 'PROHOKEJ.eu',
    logoFile: 'prohokej_eu.png',
    url: 'https://www.prohokej.eu',
    person: 'Jan Doležal',
    address: 'Na Strážnici 201, Nové Město nad Metují, 549 01',
    phone: '+420 777 135 453',
    email: 'prohokej@email.cz',
  },
  {
    name: 'FOUR PROJECT',
    logoFile: 'four-project---michal-sverak.jpg',
    url: 'https://www.facebook.com/FourProjectsRealizace/',
    person: 'Michal Šverák',
    address: 'Trnkova 3070/150a, Líšeň, 628 00 Brno',
    phone: '+420 728 747 474',
    email: 'michal.sverak@fourprojects.cz',
  },
  {
    name: 'Michal Franc – střechy',
    aliases: ['Michal Franc s.r.o.'],
    logoFile: 'michal-franc.jpg',
    url: 'https://www.strechymf.cz',
    address: 'Na Jamách 1710, Rychnov nad Kněžnou, 516 01',
    phone: '+420 775 240 386',
    email: 'info@strechymf.cz',
  },
  {
    name: 'CIMIEL s.r.o.',
    logoFile: 'cimiel.png',
    address: 'Čepí 125, 533 32 Čepí',
    phone: '+420 774 317 215',
    email: 'cimiel@email.cz',
  },
  {
    name: 'MATRIX a.s.',
    logoFile: 'matrix.jpg',
    url: 'https://www.matrix-as.cz',
    address: 'Třebešov 1, Rychnov nad Kněžnou, 516 01',
    phone: '+420 494 384 593',
    email: 'matrix@matrix-as.cz',
  },
  {
    name: 'Motorest Lípa',
    aliases: ['MOTOREST LÍPA'],
    logoFile: 'motorest_lipa.jpg',
    url: 'https://www.motorestlipa.cz',
    address: 'Lípa nad Orlicí 92, Týniště nad Orlicí, 517 21',
    phone: '+420 494 530 642',
    email: 'motorest.lipa@klikni.cz',
  },
  {
    name: 'Stavebniny Morávek',
    aliases: ['Josef Morávek – STAVEBNINY'],
    logoFile: 'stavebniny-moravek-1.jpg',
    url: 'https://www.odmoravek.cz',
    address: 'Rudé armády 973, Kostelec nad Orlicí, 517 41',
    phone: '+420 494 321 274',
    email: 'stmoravek@seznam.cz',
  },
  {
    name: 'Říčař – klempířství a pokrývačství',
    aliases: ['Klempířství a pokrývačství s.r.o.'],
    logoFile: 'ricar-klemp-a-pokr.jpg',
    url: 'http://www.strechyricar.wz.cz',
    address: 'Čestice 141, Kostelec nad Orlicí, 517 41',
    phone: '+420 604 845 647',
    email: 'ricarstrechy@seznam.cz',
  },
  {
    name: 'Kalousova pila',
    aliases: ['KALOUSOVA PILA'],
    logoFile: 'Kalousova-pila.png',
    url: 'https://www.kalousovapila.cz',
    address: 'Čestice 37, Kostelec nad Orlicí, 517 41',
    phone: '+420 494 323 636',
    email: 'info@kalousovapila.cz',
  },
]

const lines: string[] = []
const log = (message: string) => {
  console.log(message)
  lines.push(message)
}

/** „HOLMER CZ, s.r.o." → „holmercz" — pro dohledání i při jiném zápisu firmy. */
const normalize = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\b(s\.?\s?r\.?\s?o\.?|a\.?\s?s\.?|spol\.?)\b/g, '')
    .replace(/[^a-z0-9]/g, '')

const payload = await getPayload({ config })

// Všichni existující partneři najednou — matchování běží v paměti.
const existing = await payload.find({ collection: 'sponsors', limit: 0, depth: 0 })
const byNormalizedName = new Map(existing.docs.map((doc) => [normalize(doc.name), doc]))

let created = 0
let updated = 0
let unchanged = 0

for (let i = 0; i < SPONSORS.length; i++) {
  const s = SPONSORS[i]
  const candidates = [s.name, ...(s.aliases ?? [])]
  const doc = candidates.map((name) => byNormalizedName.get(normalize(name))).find(Boolean)

  if (!doc) {
    const media = await payload.find({
      collection: 'media',
      where: { filename: { equals: s.logoFile } },
      limit: 1,
      depth: 0,
    })
    const logoId = media.docs[0]?.id
    if (!logoId) log(`  ! logo nenalezeno v médiích: ${s.logoFile} (${s.name})`)

    await payload.create({
      collection: 'sponsors',
      data: {
        name: s.name,
        logo: logoId,
        url: s.url,
        person: s.person,
        address: s.address,
        phone: s.phone,
        email: s.email,
        active: true,
        order: i,
      },
      context: { disableRevalidate: true },
    })
    created++
    log(`  + ${s.name}`)
    continue
  }

  // Doplňujeme jen prázdná pole — ruční editace v adminu má přednost.
  // `url` v DB je už https, handoff má u některých http → nepřepisovat.
  const patch: Record<string, string> = {}
  if (!doc.person && s.person) patch.person = s.person
  if (!doc.address) patch.address = s.address
  if (!doc.phone) patch.phone = s.phone
  if (!doc.email) patch.email = s.email
  if (!doc.url && s.url) patch.url = s.url

  if (Object.keys(patch).length === 0) {
    unchanged++
    continue
  }

  await payload.update({
    collection: 'sponsors',
    id: doc.id,
    data: patch,
    context: { disableRevalidate: true },
  })
  updated++
  log(`  ~ ${doc.name} (${Object.keys(patch).join(', ')})`)
}

// Partneři v DB, které seed nezná — jen upozornění, nic se s nimi nedělá.
const seededNames = new Set(
  SPONSORS.flatMap((s) => [s.name, ...(s.aliases ?? [])]).map((name) => normalize(name)),
)
for (const doc of existing.docs) {
  if (!seededNames.has(normalize(doc.name))) log(`  ? v DB, ale není v seedu: ${doc.name}`)
}

const total = await payload.count({ collection: 'sponsors' })
log(
  `\nSponzoři: +${created} nových, ${updated} aktualizováno, ${unchanged} bez změny, celkem ${total.totalDocs}`,
)

writeFileSync('migration/seed-sponsors.log', `${lines.join('\n')}\n`)
process.exit(0)
