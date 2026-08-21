import type { Block } from 'payload'

export const ProductsGridWidget: Block = {
  slug: 'productsGrid',
  interfaceName: 'ProductsGridBlock',
  labels: { singular: 'Widget — Produkty (merch)', plural: 'Widgety — Produkty' },
  fields: [
    { name: 'title', type: 'text', label: 'Nadpis' },
    {
      name: 'orderInfo',
      type: 'textarea',
      label: 'Objednací instrukce (aktuální kampaň)',
      admin: {
        description:
          'Např. „Objednávejte do 5. 1. 2025 e-mailem. Uveďte název předmětu, velikost a počet kusů. Výroba do 30. 1."',
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      label: 'Text objednacího tlačítka',
      defaultValue: 'Objednat e-mailem',
    },
  ],
}
