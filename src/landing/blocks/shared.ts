import type { Field } from 'payload'

/**
 * Sdílená pole blokových configů (viz `blocks/<Name>/config.ts`).
 */

/** Upload pole s fotkou. */
export const photoField = (name: string, label = 'Fotka'): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
  label,
})

/** Filtr sezóny (prázdné = aktuální). */
export const seasonFilter: Field = {
  name: 'season',
  type: 'relationship',
  relationTo: 'seasons',
  label: 'Sezóna',
  admin: { description: 'Prázdné = aktuální sezóna.' },
}

/** Filtr týmu (prázdné = všechny). */
export const teamFilter: Field = {
  name: 'team',
  type: 'relationship',
  relationTo: 'teams',
  label: 'Tým',
  admin: { description: 'Prázdné = všechny týmy.' },
}

/** Počet položek widgetu. */
export const limitField = (defaultValue: number, max = 20): Field => ({
  name: 'limit',
  type: 'number',
  label: 'Počet položek',
  defaultValue,
  min: 1,
  max,
})
