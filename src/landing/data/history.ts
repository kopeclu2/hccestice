import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { HISTORY_PAGE } from '../content'
import type { HistoryEra, Milestone } from '../types'

import { uploadToPhoto } from './format'

/** Historie klubu — timeline milníků pro /historie-klubu. */

/**
 * Milníky z kolekce `milestones` seskupené do ér v pořadí podle
 * `HISTORY_PAGE.eras`. Prázdné éry se vynechají; když v CMS nejsou
 * žádné milníky, použije se obsah z handoffu (`fallbackMilestones`).
 */
export const fetchHistoryEras = cache(async (): Promise<HistoryEra[]> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'milestones',
    sort: ['order', 'year'],
    limit: 0,
    depth: 1,
  })

  const milestones: (Milestone & { era: string })[] =
    docs.length > 0
      ? docs.map((doc) => ({
          key: `milestone-${doc.id}`,
          era: doc.era,
          year: doc.year,
          title: doc.title,
          text: doc.text,
          photo: uploadToPhoto(doc.photo),
        }))
      : HISTORY_PAGE.fallbackMilestones.map((row) => ({
          key: `fallback-${row.era}-${row.year}`,
          era: row.era,
          year: row.year,
          title: row.title,
          text: row.text,
          photo: null,
        }))

  return HISTORY_PAGE.eras
    .map((era) => ({
      value: era.value,
      title: era.title,
      range: era.range,
      milestones: milestones.filter((milestone) => milestone.era === era.value),
    }))
    .filter((era) => era.milestones.length > 0)
})
