import type { Block } from 'payload'

export const PricingCardsWidget: Block = {
  slug: 'pricingCards',
  interfaceName: 'PricingCardsBlock',
  labels: { singular: 'Widget — Členské příspěvky', plural: 'Widgety — Příspěvky' },
  fields: [
    { name: 'title', type: 'text', label: 'Nadpis' },
    { name: 'perex', type: 'textarea', label: 'Text pod nadpisem' },
    {
      name: 'cards',
      type: 'array',
      label: 'Karty',
      labels: { singular: 'Karta', plural: 'Karty' },
      minRows: 1,
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', label: 'Název (Mládež, Muži…)', required: true },
            { name: 'price', type: 'text', label: 'Cena (např. 1 500 Kč)', required: true },
            { name: 'period', type: 'text', label: 'Období (za sezónu…)' },
          ],
        },
        { name: 'description', type: 'text', label: 'Popis' },
        {
          name: 'features',
          type: 'array',
          label: 'Co zahrnuje',
          labels: { singular: 'Položka', plural: 'Položky' },
          fields: [{ name: 'text', type: 'text', label: 'Text', required: true }],
        },
        {
          type: 'row',
          fields: [
            { name: 'highlighted', type: 'checkbox', label: 'Zvýraznit (zelená karta)' },
            { name: 'ctaLabel', type: 'text', label: 'Text tlačítka' },
            { name: 'ctaHref', type: 'text', label: 'Cíl tlačítka' },
          ],
        },
      ],
    },
  ],
}
