'use client'

import Link from 'next/link'
import React, { useSyncExternalStore } from 'react'

import { MAINTENANCE_BYPASS_COOKIE } from '@/lib/maintenanceGate'

const COOKIE_PATTERN = new RegExp(`(?:^|;\\s*)${MAINTENANCE_BYPASS_COOKIE}=`)

// Cookie se během života stránky nemění bez navigace, takže odběr změn
// není potřeba; `useSyncExternalStore` tu slouží k bezpečnému čtení
// `document.cookie` bez hydratačního rozdílu (server vrací `false`).
const subscribe = () => () => {}
const readCookie = () => COOKIE_PATTERN.test(document.cookie)
const readOnServer = () => false

/**
 * Lišta pro přihlášeného správce, když je zapnutý
 * režim údržby.
 *
 * Brána (`src/proxy.ts`) přihlášené **pouští dál** — správce musí web vidět
 * i zavřený, jinak by neměl jak zkontrolovat, co po údržbě nasazuje. Bez
 * téhle lišty ale zapnutý přepínač vypadá z jeho prohlížeče jako rozbitý.
 *
 * Kdo se dívá, pozná jen proxy; layout prerenderovaných stránek to vědět
 * nemůže. Proxy proto průchozím nastaví cookie a lišta se podle ní ukáže
 * až na klientu.
 */
export function MaintenanceNotice() {
  const visible = useSyncExternalStore(subscribe, readCookie, readOnServer)
  if (!visible) return null

  return (
    <div className="relative z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-lime px-4 py-2 text-xs font-semibold text-ink">
      <span>Režim údržby je zapnutý — návštěvníci vidí údržbovou stránku.</span>
      <Link className="underline underline-offset-2" href="/udrzba">
        Zobrazit ji
      </Link>
      <Link className="underline underline-offset-2" href="/admin/globals/siteConfig">
        Vypnout v nastavení
      </Link>
    </div>
  )
}
