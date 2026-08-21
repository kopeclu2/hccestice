import type { Block } from 'payload'

import { photoField } from '../shared'

/**
 * Varianta 2 hero sekce (handoff `design_header/HC Cestice Modern.dc.html`).
 *
 * Textová pole jsou schválně shodná s `landingHero` — obě varianty vyprávějí
 * totéž, liší se jen kompozicí, takže přepnutí bloku nesmí znamenat
 * přepisování textů. Navíc má tahle varianta obě tlačítka plně v rukou
 * správce: u varianty 1 je cíl hlavního CTA zadrátovaný na `#sezona`.
 */
export const LandingHeroModern: Block = {
  slug: 'landingHeroModern',
  interfaceName: 'LandingHeroModernBlock',
  labels: { singular: 'Landing — Hero varianta 2', plural: 'Landing — Hero varianta 2' },
  fields: [
    photoField('photo', 'Hlavní fotka (šířka min. 2000 px)'),
    { name: 'intro', type: 'textarea', label: 'Úvodní odstavec' },
    {
      type: 'row',
      fields: [
        { name: 'headlineLight', type: 'text', label: 'Headline — tenká část' },
        { name: 'headlineBold', type: 'text', label: 'Headline — tučná část' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Tlačítko v obsahu',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'showCta',
          type: 'checkbox',
          label: 'Zobrazit tlačítko',
          defaultValue: true,
          admin: {
            description:
              'Vypnuté tlačítko nechá jen perex a headline — hodí se, když sekce nemá kam pobízet (rozehraná sezóna, uzavřený nábor).',
          },
        },
        {
          type: 'row',
          admin: { condition: (_, siblings) => siblings?.showCta !== false },
          fields: [
            { name: 'ctaLabel', type: 'text', label: 'Text tlačítka' },
            {
              name: 'ctaHref',
              type: 'text',
              label: 'Cíl tlačítka',
              admin: {
                description: 'Kotva na této stránce (#sezona) nebo cesta (/zapasy).',
              },
            },
          ],
        },
        {
          name: 'ctaVariant',
          type: 'select',
          label: 'Vzhled tlačítka',
          defaultValue: 'lime',
          admin: { condition: (_, siblings) => siblings?.showCta !== false },
          options: [
            { label: 'Lime (podle handoffu)', value: 'lime' },
            { label: 'Tmavé', value: 'dark' },
            { label: 'Bílé', value: 'light' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Tlačítko v navigaci',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'showNavCta',
          type: 'checkbox',
          label: 'Zobrazit tlačítko v navigaci',
          defaultValue: true,
        },
        {
          name: 'navCtaLabel',
          type: 'text',
          label: 'Text tlačítka v navigaci',
          admin: {
            condition: (_, siblings) => siblings?.showNavCta !== false,
            description:
              'Prázdné = použije se text z Nastavení webu. Cíl tlačítka se spravuje tam (platí pro celý web).',
          },
        },
      ],
    },
  ],
}
