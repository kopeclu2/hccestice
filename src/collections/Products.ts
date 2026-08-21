import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateLanding, revalidateLandingDelete } from '../hooks/revalidateLanding'

/**
 * Reklamní předměty (merch) — šály, kulichy, vlaječky, mini dresy…
 *
 * Prodej běží e-mailem (objednávková kampaň s termínem), ne e-shopem:
 * widget Produkty zobrazí zboží + objednací instrukce, tlačítko
 * předvyplní e-mail. Ceny se mění po sezónách — udržuje se aktuální.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Produkt',
    plural: 'Produkty (merch)',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: 'Hokej',
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'available', 'order'],
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Název',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Fotka',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          label: 'Cena (Kč / ks)',
        },
        {
          name: 'available',
          type: 'checkbox',
          defaultValue: true,
          label: 'V nabídce',
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
          label: 'Pořadí',
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Popis (volitelný)',
    },
    {
      name: 'sizes',
      type: 'array',
      label: 'Velikosti',
      labels: { singular: 'Velikost', plural: 'Velikosti' },
      admin: {
        description: 'Např. „PÁNSKÁ" s poznámkou „24–25 × 23 cm". Prázdné = bez velikostí.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, label: 'Označení' },
            { name: 'note', type: 'text', label: 'Rozměry / poznámka' },
          ],
        },
      ],
    },
    {
      name: 'orderNote',
      type: 'text',
      label: 'Poznámka k objednávce',
      admin: {
        description: 'Např. „nezapomeňte napsat velikost" nebo „uveďte jméno a číslo na dres".',
      },
    },
    {
      name: 'params',
      type: 'array',
      label: 'Parametry',
      labels: { singular: 'Parametr', plural: 'Parametry' },
      admin: {
        description:
          'Libovolné vlastnosti produktu — materiál, rozměry, barva, výrobce… Zobrazují se na detailu produktu.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, label: 'Název (např. Materiál)' },
            { name: 'value', type: 'text', required: true, label: 'Hodnota (např. 100% akryl)' },
          ],
        },
      ],
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Další fotky (detail produktu)',
      labels: { singular: 'Fotka', plural: 'Fotky' },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Fotka',
        },
      ],
    },
    slugField({ useAsSlug: 'name' }),
  ],
  hooks: {
    afterChange: [revalidateLanding],
    afterDelete: [revalidateLandingDelete],
  },
}
