import type { Block } from 'payload'

export const AnnouncementWidget: Block = {
  slug: 'announcement',
  interfaceName: 'AnnouncementBlock',
  labels: { singular: 'Widget — Oznámení', plural: 'Widgety — Oznámení' },
  fields: [
    {
      name: 'tone',
      type: 'select',
      label: 'Typ',
      defaultValue: 'info',
      options: [
        { label: 'Informace (zelená)', value: 'info' },
        { label: 'Upozornění (lime)', value: 'warning' },
      ],
    },
    { name: 'text', type: 'text', required: true, label: 'Text oznámení' },
    {
      type: 'row',
      fields: [
        { name: 'linkLabel', type: 'text', label: 'Text odkazu' },
        { name: 'linkHref', type: 'text', label: 'Cíl odkazu' },
        { name: 'dismissible', type: 'checkbox', label: 'Lze zavřít křížkem', defaultValue: true },
      ],
    },
  ],
}
