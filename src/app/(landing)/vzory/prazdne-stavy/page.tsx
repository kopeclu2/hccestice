import type { Metadata } from 'next'

import { X } from 'lucide-react'
import React from 'react'

import { EmptyState } from '@/landing/components/EmptyState'
import { PageTitle, SectionTitle } from '@/landing/components/Heading'
import { Kicker } from '@/landing/components/Kicker'
import { PageCanvas } from '@/landing/components/PageCanvas'
import { PillLink } from '@/landing/components/PillLink'
import { SectionShell } from '@/landing/components/SectionShell'

/**
 * Interní náhled prázdných stavů — tři varianty z handoffu „HC Cestice
 * Systemove Stranky" pohromadě, aby se daly porovnat bez vyprázdnění
 * databáze. Sourozenec `/vzory` (galerie vzorů pozadí); vlastní routa proto,
 * že ta stránka je o `PatternBackground`, ne o komponentách stavů.
 *
 * Uppercase popisky pod kartami jsou **jen tady**. V handoffu označují
 * variantu pro čtenáře designu — do produkčních stránek nepatří.
 */
export default function EmptyStatesPage() {
  return (
    <PageCanvas hatch={false} surface="paper">
      <header className="mx-auto max-w-[97.5rem] px-[clamp(0.875rem,3vw,2.5rem)] pt-16 text-center">
        <Kicker>Interní náhled</Kicker>
        <PageTitle className="mx-auto mt-5 max-w-200" size="sm">
          Prázdné stavy
        </PageTitle>
        <p className="text-dim mx-auto mt-4 max-w-160 leading-relaxed text-pretty">
          Komponenta{' '}
          <code className="bg-chip rounded px-1.5 font-mono text-meta">EmptyState</code> — vkládá se
          místo mřížky karet, když filtr nic nevrátí nebo se sekce nemá čím naplnit.
        </p>
      </header>

      <SectionShell spacing="section">
        <div className="border-line border-b pb-5">
          <SectionTitle>Varianty</SectionTitle>
          <p className="text-dim mt-2 max-w-180 leading-relaxed text-pretty">
            Živé komponenty, ne obrázky. Znění textů a cesty dál si skládá každý výpis sám —
            závisí na tom, jestli je zapnutý filtr.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-5">
          <Demo caption="Aktuality · filtr bez výsledků">
            <EmptyState
              actions={
                <>
                  <PillLink
                    arrowIcon={<X strokeWidth={2.5} />}
                    href="/aktuality#seznam"
                    size="md"
                    variant="dark"
                    withArrow
                  >
                    Zrušit filtr
                  </PillLink>
                  <PillLink href="/zapasy" size="md" variant="outline">
                    Zápasy
                  </PillLink>
                </>
              }
              icon="search"
              title="Tomuhle filtru nic neodpovídá"
            >
              V kategorii <strong className="font-bold">Soupiska</strong> zatím nejsou žádné
              články. Zkuste jinou kategorii nebo zrušte filtr.
            </EmptyState>
          </Demo>

          <Demo caption="Zápasy · žádné nadcházející">
            <EmptyState
              actions={
                <>
                  <PillLink href="/aktuality" size="md" variant="dark" withArrow>
                    Sledovat aktuality
                  </PillLink>
                  <PillLink href="/zapasy#odehrane" size="md" variant="outline">
                    Odehrané zápasy
                  </PillLink>
                </>
              }
              icon="schedule"
              title="Žádný zápas na programu"
              watermark="VČHL"
            >
              Rozlosování nové sezóny zveřejní VČHL během léta. Sledujte aktuality — dáme vědět,
              jakmile bude termínovka venku.
            </EmptyState>
          </Demo>

          <Demo caption="Galerie · sezóna bez fotek">
            <EmptyState
              actions={
                <>
                  <PillLink href="/#kontakt" size="md" variant="dark" withArrow>
                    Poslat fotky
                  </PillLink>
                  <PillLink href="/fotogalerie#seznam" size="md" variant="outline">
                    Starší sezóny
                  </PillLink>
                </>
              }
              icon="photos"
              title="Z této sezóny zatím nemáme fotky"
            >
              Fotogalerie ze sezóny <strong className="font-bold">2026/27</strong> se teprve plní.
              Máte fotky ze zápasů? Pošlete nám je, rádi je zveřejníme.
            </EmptyState>
          </Demo>

          <Demo caption="frame=&quot;bare&quot; · pro vložení do existující karty">
            <div className="rounded-card bg-surface p-4.5 md:p-9">
              <EmptyState
                actions={
                  <PillLink href="/zapasy" size="sm" variant="dark" withArrow>
                    Všechny zápasy
                  </PillLink>
                }
                frame="bare"
                icon="schedule"
                title="Zatím žádný odehraný zápas"
                titleAs="h3"
              >
                Jakmile odehrajeme první zápas, najdete tady výsledek.
              </EmptyState>
            </div>
          </Demo>
        </div>
      </SectionShell>
    </PageCanvas>
  )
}

/** Obal jedné varianty s popiskem — popisky žijí jen v tomhle katalogu. */
function Demo({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <figure className="m-0">
      {children}
      <figcaption className="text-faint mt-3 text-center text-eyebrow font-bold tracking-[0.1em] uppercase">
        {caption}
      </figcaption>
    </figure>
  )
}

export const metadata: Metadata = {
  title: 'Prázdné stavy — interní náhled | HC Čestice',
  description: 'Interní přehled prázdných stavů (EmptyState) pro výpisy webu HC Čestice.',
  robots: { index: false, follow: false },
}
