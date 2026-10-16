import type { Metadata } from 'next'
import React from 'react'

import { fetchMaintenance } from '@/landing/data/maintenance'
import { fetchSite } from '@/landing/data/site'
import { MaintenanceScreen } from '@/landing/layout/MaintenanceScreen'
import { brandTitle } from '@/lib/brandTitle'

/**
 * Údržbová stránka s texty z adminu. Dvě role:
 *
 * - náhled pro správce — co návštěvníci uvidí, **než** režim zapne;
 * - zdroj HTML, které brána (`src/proxy.ts`) při zapnutém režimu vrací
 *   s HTTP 503 na všech veřejných adresách (bez skriptů, viz `stripScripts`).
 *
 * Proto je `/udrzba` z brány vyjmutá (`isGatedPath`).
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
