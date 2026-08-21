import Link from 'next/link'
import React from 'react'

/**
 * Lišta pro přihlášeného správce (a pro náhled konceptů), když je zapnutý
 * režim údržby.
 *
 * Brána v root layoutu přihlášené **pouští dál** — správce musí web vidět
 * i zavřený, jinak by neměl jak zkontrolovat, co po údržbě nasazuje. Bez
 * téhle lišty ale zapnutý přepínač vypadá z jeho prohlížeče jako rozbitý:
 * vidí normální web, protože je přihlášený, a nemá jak to poznat.
 */
export function MaintenanceNotice() {
  return (
    <div className="bg-lime text-ink relative z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-caption font-bold">
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
