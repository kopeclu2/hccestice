import type { Block } from 'payload'

import { photoField } from '../shared'

export const PhotoCardsBlock: Block = {
  slug: 'photoCards',
  interfaceName: 'PhotoCardsBlockType',
  labels: { singular: 'Fotokarty', plural: 'Fotokarty' },
  fields: [
    {
      name: 'cards',
      type: 'array',
      label: 'Karty',
      labels: { singular: 'Karta', plural: 'Karty' },
      minRows: 1,
      fields: [
        photoField('photo'),
        {
          type: 'row',
          fields: [
            { name: 'tag', type: 'text', label: 'Štítek (levý horní roh)' },
            { name: 'badge', type: 'text', label: 'Lime štítek (pravý horní roh)' },
          ],
        },
        { name: 'caption', type: 'text', label: 'Popisek dole' },
        { name: 'href', type: 'text', label: 'Odkaz (volitelné)' },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      label: 'Sloupce na desktopu',
      defaultValue: '2',
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
      ],
    },
    {
      name: 'height',
      type: 'select',
      label: 'Výška karet',
      defaultValue: 'md',
      options: [
        { label: 'Nízká', value: 'sm' },
        { label: 'Střední', value: 'md' },
        { label: 'Vysoká', value: 'lg' },
      ],
    },
  ],
}
