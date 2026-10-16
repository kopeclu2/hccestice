import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import { draftMode } from 'next/headers'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { CookieConsentInit } from '@/components/CookieConsent/CookieConsentInit'
import { GlobalNav } from '@/landing/layout/GlobalNav'
import { MaintenanceNotice } from '@/landing/layout/MaintenanceNotice'
import { PatternDevSwitcher } from '@/landing/layout/PatternDevSwitcher'
import { LANDING_COLORS } from '@/landing/tokens'
import { getServerSideURL } from '@/lib/getURL'
import { defaultTwitter, mergeOpenGraph } from '@/lib/mergeOpenGraph'

import '@/app/globals.css'

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

  /* Režim údržby tady není: bránu drží `src/proxy.ts`, který běží před
     každou routou a vrací HTTP 503. Layout prerenderovaných stránek se na
     každém requestu nespouští a ověření přihlášení (`headers()`) by při
     ISR regeneraci stránku shodilo na 500. */

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
      </head>
      <body className="font-display">
        {/* Lišta „upravit v adminu" pro přihlášené editory. Dřív ji měly jen
            CMS stránky ve `(frontend)`; teď je na celém webu. */}
        <AdminBar adminBarProps={{ preview: draft }} />

        {/* Ukáže se jen tomu, koho proxy při zapnuté údržbě pustila dál
            (přihlášený správce) — viz komponenta. */}
        <MaintenanceNotice />

        {/* Fixní lišta skrytá do prvního scrollu — doplňuje plovoucí
            Hero navigaci a nesticky `ArticleNav`, obě po scrollu pryč
            z prvního plátna mizí a web by jinak zbytek stránky
            nechal bez menu. */}
        <GlobalNav />
        {children}

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
