import type { Block } from 'payload'

/**
 * Tréninky — nadpis a karty ledových hodin.
 *
 * Rozpis je pole `rows`, takže se dny v adminu přidávají, přetahují a mažou
 * bez zásahu do kódu; karty se zalamují na další řádek. Fotka a zelená karta
 * s akcí tady dřív byly jako volitelné doplňky — handoff je nekreslí, takže
 * je blok už nemá vůbec.
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
      label: 'Výchozí místo',
      admin: {
        description:
          'Doplní se u karet bez vlastního místa — např. „ZS Rychnov nad Kněžnou".',
      },
    },
    {
      name: 'rows',
      type: 'array',
      label: 'Rozpis ledových hodin',
      labels: { singular: 'Hodina', plural: 'Hodiny' },
      admin: {
        description: 'Každý řádek je jedna karta v pásu. Pořadí karet se přetahuje myší.',
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
          admin: { description: 'Drobný řádek pod místem — např. „Od 1. 11." nebo „Bez brankáře".' },
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
