import type { Block } from 'payload'

/**
 * Tréninky — nadpis sekce a texty kolem tabulky.
 *
 * Termíny tréninků blok nenese: čte je z kolekce `trainings` (jeden dokument
 * = jeden termín). Dřívější pole `rows` a `defaultVenue` zrušila migrace
 * `trainings_drop_block_rows`.
 */
export const LandingTrainings: Block = {
  slug: 'landingTrainings',
  interfaceName: 'LandingTrainingsBlock',
  labels: { singular: 'Landing — Tréninky', plural: 'Landing — Tréninky' },
  fields: [
    {
      name: 'kicker',
      type: 'text',
      label: 'Štítek nad nadpisem',
      admin: { description: 'Pilulka nad nadpisem, např. „Tréninky". Prázdné = skryje se.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'headline', type: 'text', label: 'Nadpis — začátek' },
        { name: 'headlineHighlight', type: 'text', label: 'Zvýrazněné slovo' },
        {
          name: 'headlineRest',
          type: 'text',
          label: 'Nadpis — konec',
          admin: { description: 'Tečku na konci nepiš — doplní ji design zeleným akcentem.' },
        },
      ],
    },
    {
      name: 'perex',
      type: 'textarea',
      label: 'Perex',
      admin: { description: 'Volitelný text pod nadpisem. Prázdné = jen nadpis a karty.' },
    },
  ],
}
