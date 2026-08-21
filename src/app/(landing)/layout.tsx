import type { Metadata } from 'next'

import { draftMode } from 'next/headers'
import { Archivo } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { MaintenanceNotice } from '@/landing/components/MaintenanceNotice'
import { MaintenanceScreen } from '@/landing/components/MaintenanceScreen'
import { PatternDevSwitcher } from '@/landing/components/PatternDevSwitcher'
import { fetchMaintenance } from '@/landing/data/maintenance'
import { hasSession } from '@/landing/data/session'
import { fetchSite } from '@/landing/data/site'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import '../globals.css'

/**
 * Jediný font landing page (viz design handoff — Typografie).
 * Vystavuje CSS proměnnou `--font-archivo`, na kterou se odkazuje
 * Tailwind token `--font-display` v globals.css (třída `font-display`).
 */
const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-archivo',
  display: 'swap',
})

/**
 * Root layout celého webu. Od zrušení route group `(frontend)` je jediný —
 * všechny veřejné routy (klubové stránky, CMS `pages`, legacy 301, sitemapy,
 * Payload preview i 404) jdou přes něj, takže mají jednotný rám: klubovou
 * navigaci, patičku a Archivo. Dřív existoval druhý root s Header/Footer
 * z Payload šablony, vlastním fontem Geist a přepínačem témat.
 *
 * `data-theme="light"` je nutné kvůli globálnímu pravidlu, které stránku
 * zobrazí až po nastavení tématu (ochrana proti FOUC). Tmavé hodnoty tokenů
 * existují (`[data-theme='dark']` v globals.css), ale zapnuté nejsou —
 * chybí pro ně design handoff.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled: draft } = await draftMode()

  /* Režim údržby se přepíná v adminu (Nastavení webu → Režim údržby).
     Brána je tady, protože tohle je jediné místo, kterým prochází celý
     veřejný web — admin má vlastní root layout pod `(payload)`, takže se
     do administrace dostanete i při zapnuté údržbě.

     `fetchMaintenance` je tagovaná cache, takže vypnutý režim nestojí ani
     dotaz do databáze. Přihlášení se ověřuje **jen když je režim zapnutý**:
     `headers()` je dynamické API a jeho bezpodmínečné čtení v root layoutu
     by zrušilo prerender celého webu. */
  const maintenance = await fetchMaintenance()
  const bypassMaintenance = maintenance.enabled && (draft || (await hasSession()))
  const showMaintenance = maintenance.enabled && !bypassMaintenance
  const site = showMaintenance ? await fetchSite() : null

  return (
    <html className={archivo.variable} data-theme="light" lang="cs" suppressHydrationWarning>
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        {/* Layout nemůže vrátit HTTP 503, takže indexaci brzdí aspoň meta. */}
        {showMaintenance && <meta content="noindex" name="robots" />}
      </head>
      <body className="font-display">
        {/* Lišta „upravit v adminu" pro přihlášené editory. Dřív ji měly jen
            CMS stránky ve `(frontend)`; teď je na celém webu. */}
        <AdminBar adminBarProps={{ preview: draft }} />

        {/* Přihlášený správce prochází bránou dál — bez tohohle upozornění
            by pro něj zapnutý přepínač vypadal jako nefunkční. */}
        {bypassMaintenance && <MaintenanceNotice />}

        {showMaintenance && site ? (
          <MaintenanceScreen maintenance={maintenance} site={site} />
        ) : (
          children
        )}

        {/* DEV nástroj: plovoucí přepínač vzorů pozadí (jen ve vývoji) */}
        {process.env.NODE_ENV === 'development' && <PatternDevSwitcher />}
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
}
