/**
 * Seed kolekce Produkty (merch) z importovaných stránek
 * „Reklamní předměty" (2019 + 2024/2025).
 *
 * Ceny: 2024/25 kde známé (šála, kulichy); starší položky mají cenu
 * z roku 2019 a jsou označené jako „mimo nabídku" — klub je před
 * další kampaní přecení a zapne. Fotky se linkují z médií (import).
 *
 * Idempotentní (podle názvu). Spuštění:
 * bun --env-file=.env migration/seed-products.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })
const ctx = { disableRevalidate: true }

const PRODUCTS = [
  {
    name: 'Šála HC Čestice',
    photoFile: 'sala_hc_cestice.jpg',
    price: 240,
    available: true,
    order: 10,
  },
  {
    name: 'Čepice zimní — kulich',
    photoFile: 'cepice_zimni-1.jpg',
    price: 450,
    available: true,
    order: 20,
    orderNote: 'U objednávky nezapomeňte napsat velikost čepice.',
    sizes: [
      { label: 'PÁNSKÁ', note: '24–25 × 23 cm' },
      { label: 'DÁMSKÁ', note: '22–23 × 23 cm' },
      { label: 'DĚTSKÁ', note: '20–21 × 22 cm' },
    ],
  },
  {
    name: 'Čepice sublimační tenká',
    photoFile: 'cepice_sublimacni_tenka.jpg',
    price: 400,
    available: true,
    order: 30,
    orderNote: 'U objednávky nezapomeňte napsat velikost čepice.',
  },
  {
    name: 'Mini dres',
    photoFile: 'minidres_hc_cestice-1.jpg',
    price: 90,
    available: false, // cena z 2019 — před kampaní přecenit
    order: 40,
    orderNote: 'Uveďte jméno a číslo, které chcete mít na dresu.',
  },
  {
    name: 'Vak na záda',
    photoFile: 'vak_na_zada.jpg',
    price: 320,
    available: false,
    order: 50,
  },
  {
    name: 'Vlaječka velká',
    photoFile: 'vlajecka_velka.jpg',
    price: 200,
    available: false,
    order: 60,
  },
  {
    name: 'Vlaječka malá',
    photoFile: 'vlajecka_mala.jpg',
    price: 175,
    available: false,
    order: 70,
  },
]

let created = 0
let skipped = 0

for (const item of PRODUCTS) {
  const existing = await payload.find({
    collection: 'products',
    where: { name: { equals: item.name } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs[0]) {
    skipped++
    continue
  }

  const photo = (
    await payload.find({
      collection: 'media',
      where: { filename: { equals: item.photoFile } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]
  if (!photo) console.warn(`  ! foto nenalezeno: ${item.photoFile}`)

  await payload.create({
    collection: 'products',
    // slug doplní hook slugField z názvu
    data: {
      name: item.name,
      photo: photo?.id,
      price: item.price,
      available: item.available,
      order: item.order,
      orderNote: item.orderNote,
      sizes: item.sizes,
    } as never,
    context: ctx,
  })
  console.log(`  + ${item.name} (${item.price} Kč${item.available ? '' : ', mimo nabídku'})`)
  created++
}

console.log(`\nProdukty: +${created} nových, ${skipped} už existovalo`)
process.exit(0)
