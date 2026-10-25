import type { Block } from 'payload'

/**
 * Tréninky — nadpis a karty ledových hodin.
 *
 * Termíny tréninků blok nenese: čte je z kolekce `trainings` (jeden dokument
 * = jeden termín). Pole `rows` a `defaultVenue` jsou zastaralá a v adminu
 * skrytá; zůstávají jen kvůli schématu — jejich smazání je destruktivní
 * migrace, která se smí pustit až po nasazení (AGENTS.md „Sekce Tréninky").
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
    {
      name: 'defaultVenue',
      type: 'text',
      label: 'Výchozí místo (zastaralé)',
      admin: {
        hidden: true,
        description: 'Zastaralé — nahradila ho kolekce Tréninky. Web hodnotu nečte.',
      },
    },
    {
      name: 'rows',
      type: 'array',
      label: 'Rozpis ledových hodin (zastaralé)',
      labels: { singular: 'Hodina', plural: 'Hodiny' },
      admin: {
        hidden: true,
        description: 'Zastaralé — termíny se zadávají v kolekci Tréninky. Web řádky nečte.',
        initCollapsed: true,
        components: { RowLabel: '@/landing/blocks/Trainings/RowLabel#TrainingRowLabel' },
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'day', type: 'text', label: 'Den (Út, Pá…)', required: true },
            { name: 'time', type: 'text', label: 'Čas (17:45 – 19:00)', required: true },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'group',
              type: 'text',
              label: 'Skupina (Muži…)',
              admin: { description: 'Štítek na kartě. Prázdné = karta bez štítku.' },
            },
            {
              name: 'venue',
              type: 'text',
              label: 'Místo',
              admin: { description: 'Prázdné = výchozí místo sekce.' },
            },
          ],
        },
        {
          name: 'note',
          type: 'text',
          label: 'Poznámka',
          admin: {
            description: 'Drobný řádek pod místem — např. „Od 1. 11." nebo „Bez brankáře".',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'joint',
              type: 'checkbox',
              label: 'Zvýraznit kartu (tmavá karta, lime štítek)',
              defaultValue: false,
            },
            {
              name: 'hiddenOnWeb',
              type: 'checkbox',
              label: 'Skrýt na webu',
              defaultValue: false,
              admin: { description: 'Zrušený trénink se skryje, aniž by se řádek mazal.' },
            },
          ],
        },
      ],
    },
  ],
}
