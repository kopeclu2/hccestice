import type { Metadata } from 'next'
import React from 'react'

import { fetchMaintenance } from '@/landing/data/maintenance'
import { fetchSite } from '@/landing/data/site'
import { MaintenanceScreen } from '@/landing/layout/MaintenanceScreen'
import { brandTitle } from '@/lib/brandTitle'

/**
 * Náhled údržbové stránky s texty z adminu — aby si správce mohl ověřit,
 * co návštěvníci uvidí, **než** režim zapne. Zapnutý režim řeší brána
 * v root layoutu (`src/app/(landing)/layout.tsx`), ne tahle routa.
 *
 * Neindexuje se: je to systémová stránka, ne obsah webu.
 */
export default async function UdrzbaPage() {
  const [maintenance, site] = await Promise.all([fetchMaintenance(), fetchSite()])

  return <MaintenanceScreen maintenance={maintenance} site={site} />
}

export const metadata: Metadata = {
  title: brandTitle('Údržba'),
  robots: { index: false, follow: false },
}
