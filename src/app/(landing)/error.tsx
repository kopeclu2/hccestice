'use client'

import { RotateCcw } from 'lucide-react'
import React, { useEffect } from 'react'

import { ErrorCode, ErrorMeta } from '@/landing/components/ErrorCode'
import { PageTitle } from '@/landing/components/Heading'
import { LogoStamp } from '@/landing/components/LogoStamp'
import { PillButton } from '@/landing/components/PillButton'
import { PillLink } from '@/landing/components/PillLink'

/**
 * Stránka 500 podle handoffu „HC Cestice Systemove Stranky" — tmavá plocha,
 * lime šrafování, obří obrysové „500".
 *
 * Nestojí na `SubpageShell` ani `PageCanvas` **záměrně**: error boundary musí
 * být Client Component (podmínka Reactu), takže sem nesmí `SubpageShell` —
 * je `async` a tahá Payload. To je zároveň jediná správná volba pro chybovou
 * stránku: kdyby se navigace a patička načítaly z databáze, spadly by na
 * stejné chybě, která nás sem poslala. Handoff to potvrzuje — jeho 500
 * obrazovka má nahoře jen logo, žádnou nav a žádnou patičku.
 *
 * Pozor na API: Next 16 předává **`retry`**, ne `reset`. `reset` sice pořád
 * existuje, ale jen překreslí boundary bez nového fetche, takže by uživatel
 * u serverové chyby zmáčkl „Obnovit stránku" a nic by se nestalo.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    /* `digest` je jediná nitka k serverovému logu — v produkci se `message`
       ze Server Component na klienta nedostane. */
    console.error(error)
  }, [error])

  return (
    <main className="text-on-contrast relative flex min-h-screen flex-col overflow-x-clip bg-contrast px-[clamp(0.625rem,1.4vw,1.25rem)] pt-3.5">
      <div aria-hidden className="hatch-lime pointer-events-none absolute inset-0" />

      <nav className="relative z-2 mx-auto flex w-full max-w-[97.5rem] items-center px-[clamp(0.5rem,2vw,1.5rem)] py-2">
        <LogoStamp href="/" tone="glass" />
      </nav>

      <div className="relative z-1 mx-auto flex w-full max-w-[97.5rem] flex-1 flex-col justify-center px-[clamp(0.875rem,3vw,2.5rem)] pt-10 pb-16">
        <ErrorCode tone="dark">500</ErrorCode>

        <PageTitle className="mt-6.5 max-w-190" size="system">
          Technická přestávka <span className="text-lime">na naší straně</span>
        </PageTitle>

        <p className="mt-4.5 max-w-130 text-lead leading-[1.55] text-white/72 text-pretty">
          Na serveru se něco pokazilo. Už na tom pracujeme — zkuste stránku za chvíli obnovit.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          <PillButton
            arrowIcon={<RotateCcw strokeWidth={2.5} />}
            onClick={() => retry()}
            size="lg"
            variant="lime"
            withArrow
          >
            Obnovit stránku
          </PillButton>
          <PillLink href="/" size="md" variant="inverse">
            Hlavní stránka
          </PillLink>
        </div>

        <ErrorMeta className="mt-14" tone="dark">
          Chyba 500 · Interní chyba serveru
        </ErrorMeta>
      </div>
    </main>
  )
}
