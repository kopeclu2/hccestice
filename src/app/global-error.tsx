'use client'

import React from 'react'

import { LANDING_COLORS } from '@/landing/tokens'

/**
 * Poslední záchranná síť: chyba v **root layoutu** samotném. Běžné chyby
 * v obsahu bere `(landing)/error.tsx`, který má plný klubový design.
 *
 * Tahle stránka nahrazuje root layout, takže k ní nedoteče `globals.css`
 * (a tím ani `@theme`) ani `next/font` s Archivem — proto inline styly
 * z hex zrcadla `LANDING_COLORS` a systémový font. Ze stejného důvodu tu
 * není `export const metadata`: v Client Component nefunguje, titulek se
 * nastavuje Reactovým `<title>`.
 *
 * Kompozici 500 stránky **nekopíruje záměrně**. Bez tokenů by z ní byl druhý,
 * ručně dopisovaný duplikát, který by se s designem rozešel při první změně —
 * a zobrazí se jen když je rozbitý layout, tedy skoro nikdy.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html data-theme="light" lang="cs">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          background: LANDING_COLORS.ink,
          color: '#fff',
          fontFamily: 'Archivo, system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <title>Chyba serveru | HC Čestice</title>
        <div style={{ maxWidth: '28rem' }}>
          <div
            style={{
              fontSize: '4rem',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              color: LANDING_COLORS.lime,
            }}
          >
            500
          </div>
          <h1
            style={{
              margin: '1.25rem 0 0',
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Technická přestávka na naší straně
          </h1>
          <p
            style={{
              margin: '0.75rem 0 0',
              fontSize: '1rem',
              lineHeight: 1.55,
              color: LANDING_COLORS['faint-dark'],
            }}
          >
            Web HC Čestice se nepodařilo načíst. Zkuste to prosím za chvíli znovu.
          </p>
          <button
            onClick={() => retry()}
            style={{
              marginTop: '1.75rem',
              border: 0,
              borderRadius: '999px',
              padding: '0.75rem 1.5rem',
              background: LANDING_COLORS.lime,
              color: LANDING_COLORS.ink,
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            type="button"
          >
            Obnovit stránku
          </button>
          {error.digest && (
            <p
              style={{
                margin: '1.75rem 0 0',
                fontSize: '0.75rem',
                color: LANDING_COLORS.faint,
              }}
            >
              Kód chyby: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
