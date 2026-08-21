import type { Block } from 'payload'

export const DataTableBlock: Block = {
  slug: 'dataTable',
  interfaceName: 'DataTableBlockType',
  labels: { singular: 'Tabulka (data)', plural: 'Tabulky (data)' },
  fields: [
    { name: 'title', type: 'text', label: 'Nadpis nad tabulkou' },
    {
      name: 'data',
      type: 'textarea',
      required: true,
      label: 'Data tabulky',
      admin: {
        rows: 8,
        description:
          'Vlož data z Excelu/Numbers (Ctrl+C → Ctrl+V) — každý řádek tabulky na nový řádek, buňky oddělené tabulátorem, středníkem nebo |. Např.: „Kolo; Soupeř; Skóre".',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'firstRowHeader',
          type: 'checkbox',
          label: 'První řádek je záhlaví',
          defaultValue: true,
        },
        {
          name: 'numericRight',
          type: 'checkbox',
          label: 'Čísla zarovnat doprava',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'highlight',
      type: 'text',
      label: 'Zvýraznit řádky obsahující text',
      admin: { description: 'Např. „Čestice" — řádek dostane zelené podbarvení.' },
    },
    { name: 'caption', type: 'text', label: 'Popisek pod tabulkou' },
  ],
}
