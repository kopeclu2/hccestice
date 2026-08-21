import type { GlobalConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { revalidateLanding } from '../../hooks/revalidateLanding'
import { revalidateMaintenance } from '../../hooks/revalidateMaintenance'

export const SiteConfig: GlobalConfig = {
  slug: 'siteConfig',
  admin: {
    group: 'Nastavení',
  },
  label: 'Nastavení webu',
  access: {
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'titleText',
      type: 'text',
      label: 'Titulek webu',
      admin: { description: 'Např. „Hokejový klub Čestice - sezóna 2025/2026"' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'defaultPostImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Výchozí obrázek článků',
      admin: {
        description:
          'Použije se u článků bez vlastní fotky — na kartách, ve výpisech i v hero detailu.',
      },
    },
    {
      name: 'postsListShowPhoto',
      type: 'checkbox',
      label: 'Zobrazit fotky ve výpisu Aktuality',
      defaultValue: false,
      admin: {
        description:
          'Karty na /aktuality budou mít náhledovou fotku. Widget Aktuality na úvodní stránce má vlastní přepínač na svém bloku v layoutu stránky.',
      },
    },
    {
      name: 'contactEmail',
      type: 'email',
      label: 'Kontaktní e-mail',
    },
    {
      type: 'row',
      fields: [
        { name: 'facebook', type: 'text', label: 'Facebook URL' },
        { name: 'instagram', type: 'text', label: 'Instagram URL' },
      ],
    },
    {
      name: 'analyticsId',
      type: 'text',
      label: 'Analytics ID',
      admin: { description: 'Volitelné (GA4 measurement ID apod.)' },
    },
    {
      name: 'navCta',
      type: 'group',
      label: 'Tlačítko v navigaci',
      admin: {
        description:
          'Zvýrazněné tlačítko vpravo v navigaci — na homepage i na podstránkách. Cíl může být kotva (#kontakt) nebo cesta (/kontakt).',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', label: 'Text tlačítka' },
            { name: 'href', type: 'text', label: 'Cíl (#kotva nebo /cesta)' },
          ],
        },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      label: 'Patička webu (landing page)',
      admin: { description: 'Patička je pevná část stránky — needituje se v layout builderu.' },
      fields: [
        { name: 'photo', type: 'upload', relationTo: 'media', label: 'Fotka na pozadí' },
        { name: 'headline', type: 'text', label: 'Nadpis' },
        { name: 'perex', type: 'textarea', label: 'Text' },
        {
          name: 'columns',
          type: 'array',
          label: 'Sloupce odkazů',
          labels: { singular: 'Sloupec', plural: 'Sloupce' },
          fields: [
            { name: 'title', type: 'text', label: 'Nadpis sloupce', required: true },
            {
              name: 'links',
              type: 'array',
              label: 'Odkazy',
              labels: { singular: 'Odkaz', plural: 'Odkazy' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', label: 'Text', required: true },
                    {
                      name: 'href',
                      type: 'text',
                      label: 'Cíl (#kotva nebo /cesta)',
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        { name: 'league', type: 'text', label: 'Text vpravo dole (název ligy)' },
      ],
    },
    {
      name: 'maintenance',
      type: 'group',
      label: 'Režim údržby',
      admin: {
        description:
          'Zapnutím schováte celý veřejný web za údržbovou stránku. Administrace zůstává přístupná a vy jako přihlášený správce web vidíte normálně — návštěvníci uvidí údržbu. Náhled stránky: /udrzba',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Zapnout režim údržby',
          defaultValue: false,
        },
        {
          name: 'headline',
          type: 'text',
          label: 'Nadpis',
          admin: { description: 'Prázdné = „Rolba právě upravuje led".' },
        },
        {
          name: 'perex',
          type: 'textarea',
          label: 'Text',
          admin: { description: 'Prázdné = výchozí text o krátké údržbě.' },
        },
      ],
    },
  ],
  hooks: {
    /* `revalidateMaintenance` musí být vedle `revalidateLanding`, ne místo něj:
     * první přepíná tagovanou cache (dosáhne i na prerenderované detaily),
     * druhá přegeneruje vyjmenované landing cesty. */
    afterChange: [revalidateLanding, revalidateMaintenance],
  },
}
