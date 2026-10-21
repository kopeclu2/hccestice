import { slugField } from 'payload'

import { slugifyCs } from '@/lib/slugifyCs'

/**
 * `slugField` s českým slugifikátorem. Výchozí `slugify` Payloadu
 * (`payload/dist/utilities/slugify.js`) zahazuje písmena s diakritikou
 * celá (`Rozhovor s trenérem` → `rozhovor-s-trenrem`, `HC Žďár` → `hc-r`),
 * `slugifyCs` je převádí na základní tvar (`rozhovor-s-trenerem`, `hc-zdar`).
 *
 * Mění jen funkci, která slug *generuje*: schéma databáze, typy ani
 * pravidla, kdy se generuje (jen při `create` bez slugu a u konceptů),
 * se nemění. Už uložené slugy (indexované URL) se tedy nepřepisují.
 */
export const slugFieldCs = (
  options?: Omit<NonNullable<Parameters<typeof slugField>[0]>, 'slugify'>,
) =>
  slugField({
    ...options,
    slugify: ({ valueToSlugify }) =>
      typeof valueToSlugify === 'string' ? slugifyCs(valueToSlugify) : undefined,
  })
