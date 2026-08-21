import type { Block } from 'payload'

export const LandingPeople: Block = {
  slug: 'landingPeople',
  interfaceName: 'LandingPeopleBlock',
  labels: { singular: 'Landing — Lidé v klubu', plural: 'Landing — Lidé v klubu' },
  fields: [
    { name: 'intro', type: 'textarea', label: 'Text vpravo od nadpisu' },
    {
      name: 'people',
      type: 'relationship',
      relationTo: 'people',
      hasMany: true,
      label: 'Zobrazit tyto lidi (v tomto pořadí)',
    },
  ],
}
