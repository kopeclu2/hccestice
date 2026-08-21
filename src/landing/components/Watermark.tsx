import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Dekorační watermark text na pozadí sekcí („PONÍCI", „1970", „KONTAKT"…).
 *
 * Obrys písma se dědí z `text-*` třídy (utility `text-stroke` kreslí tah
 * barvou `currentColor` a vyplní text průhledně). Na mobilu se skrývá —
 * dekorace nemají soutěžit s obsahem (handoff: `data-m-hide`).
 *
 * Hranice je `lg` (1024px), ne `md`. Velikosti watermarku jsou fixní
 * (110–260px), takže na tabletu zabíral čtvrtinu šířky stránky proti
 * osmině na 1440px a přerůstal text, který měl jen podbarvit — na
 * `/zapasy` prosvítalo „VČHL“ skrz celý perex. Tentýž důvod, proč se
 * skrývá na mobilu, platí na 768px pořád.
 */
export function Watermark({
  children,
  className,
  outlined = true,
}: {
  children: React.ReactNode
  className?: string
  /** `false` = plný, jen velmi světlý text (varianta „ČESTICE", „ŠATNA"). */
  outlined?: boolean
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute -z-1 hidden font-extrabold leading-none tracking-tighter whitespace-nowrap select-none lg:block',
        outlined && 'text-stroke',
        className,
      )}
    >
      {children}
    </div>
  )
}
