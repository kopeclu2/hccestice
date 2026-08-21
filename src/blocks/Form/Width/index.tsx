import * as React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Obal pole formuláře s procentuální šířkou z adminu (form-builder).
 *
 * Procento se uplatní **až od `md`**. Dřív jelo přes inline `maxWidth` na
 * všech šířkách, takže pole nastavené na 50 % bylo na 320px široké 136px —
 * dvousloupcový desktopový layout stlačený do mobilu. Hodnota jde do
 * custom property, aby ji mohla přečíst responzivní utilita.
 */
export const Width: React.FC<{
  children: React.ReactNode
  className?: string
  width?: number | string
}> = ({ children, className, width }) => {
  return (
    <div
      className={cn('w-full md:max-w-[var(--field-width)]', className)}
      style={width ? ({ '--field-width': `${width}%` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  )
}
