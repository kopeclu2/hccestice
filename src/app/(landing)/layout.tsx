import type { Metadata } from 'next'

import { draftMode } from 'next/headers'
import { Archivo } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { CookieConsentInit } from '@/components/CookieConsent/CookieConsentInit'
import { GlobalNav } from '@/landing/components/GlobalNav'
import { MaintenanceNotice } from '@/landing/components/MaintenanceNotice'
import { MaintenanceScreen } from '@/landing/components/MaintenanceScreen'
import { PatternDevSwitcher } from '@/landing/components/PatternDevSwitcher'
import { fetchMaintenance } from '@/landing/data/maintenance'
import { hasSession } from '@/landing/data/session'
import { fetchSite } from '@/landing/data/site'
import { LANDING_COLORS } from '@/landing/tokens'
import { getServerSideURL } from '@/utilities/getURL'
import { defaultTwitter, mergeOpenGraph } from '@/utilities/mergeOpenGraph'

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
        {/* `favicon.ico` nese víc rozlišení (16/32/48) — vygenerováno ze
            znaku klubu (`public/media/znak_hc_cestice_2850px…`). Žádná
            vektorová verze znaku neexistuje, proto tu není `.svg` varianta. */}
        <link href="/favicon.ico" rel="icon" sizes="any" />
        <link href="/icon-192.png" rel="icon" sizes="192x192" type="image/png" />
        <link href="/icon-512.png" rel="icon" sizes="512x512" type="image/png" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" />
        {/* Soubor žije v `public/`, ne jako `app/manifest.ts` — projekt má dva
            root layouty ((landing) a Payloadem generovaný (payload)) a
            file-based konvence Next generuje jen pro jeden z nich. */}
        <link href="/manifest.webmanifest" rel="manifest" />
        <meta content={LANDING_COLORS.ink} name="theme-color" />
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
          <>
            {/* Fixní lišta skrytá do prvního scrollu — doplňuje plovoucí
                Hero navigaci a nesticky `ArticleNav`, obě po scrollu pryč
                z prvního plátna mizí a web by jinak zbytek stránky
                nechal bez menu. */}
            <GlobalNav />
            {children}
          </>
        )}

        {/* DEV nástroj: plovoucí přepínač vzorů pozadí (jen ve vývoji) */}
        {process.env.NODE_ENV === 'development' && <PatternDevSwitcher />}

        {/* Bez `NEXT_PUBLIC_GA_MEASUREMENT_ID` nabídne modál jen nezbytné
            cookies — kategorie „Analytické" se v konfiguraci vůbec nevytvoří
            (viz `cookieConsentConfig.ts`). */}
        <CookieConsentInit gaMeasurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? null} />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: defaultTwitter,
}
