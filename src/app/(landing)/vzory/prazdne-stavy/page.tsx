import { X } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { EmptyState } from '@/landing/ui/EmptyState'
import { PageTitle, SectionTitle } from '@/landing/ui/Heading'
import { Kicker } from '@/landing/ui/Kicker'
import { SectionShell } from '@/landing/ui/SectionShell'
import { brandTitle } from '@/lib/brandTitle'

/**
 * Interní náhled prázdných stavů — tři varianty z handoffu „HC Cestice
 * Systemove Stranky" pohromadě, aby se daly porovnat bez vyprázdnění
 * databáze. Sourozenec `/vzory` (galerie vzorů pozadí); vlastní routa proto,
 * že ta stránka je o `PatternBackground`, ne o komponentách stavů.
 *
 * Uppercase popisky pod kartami jsou **jen tady**. V handoffu označují
 * variantu pro čtenáře designu — do produkčních stránek nepatří.
 *
 * Stojí na `SubpageShell` (ne na nahém `PageCanvas`, který si shell skládá
 * sám), takže má navigaci i patičku jako ostatních osm podstránek. Bez nich
 * byla hlavička přilepená pod hranu viewportu a z náhledu nevedla cesta zpět.
 */
export default function EmptyStatesPage() {
  return (
    <SubpageShell hatch={false} surface="paper">
      <header className="mx-auto max-w-page px-gutter pt-16 text-center">
        <Kicker>Interní náhled</Kicker>
        <PageTitle className="mx-auto mt-5 max-w-200" size="sm">
          Prázdné stavy
        </PageTitle>
        <p className="mx-auto mt-4 max-w-160 leading-relaxed text-pretty text-dim">
          Komponenta{' '}
          <code className="rounded-tag bg-chip px-1.5 font-mono text-sm">EmptyState</code> — vkládá
          se místo mřížky karet, když filtr nic nevrátí nebo se sekce nemá čím naplnit.
        </p>
      </header>

      <SectionShell spacing="section">
        <div className="border-b border-line pb-5">
          <SectionTitle>Varianty</SectionTitle>
          <p className="mt-2 max-w-180 leading-relaxed text-pretty text-dim">
            Živé komponenty, ne obrázky. Znění textů a cesty dál si skládá každý výpis sám — závisí
            na tom, jestli je zapnutý filtr.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-5">
          <Demo caption="Aktuality · filtr bez výsledků">
            <EmptyState
              actions={
                <>
                  <Button
                    asChild
                    arrowIcon={<X strokeWidth={2.5} />}
                    size="md"
                    variant="dark"
                    withArrow
                  >
                    <Link href="/aktuality#seznam">Zrušit filtr</Link>
                  </Button>
                  <Button asChild size="md" variant="outline">
                    <Link href="/zapasy">Zápasy</Link>
                  </Button>
                </>
              }
              icon="search"
              title="Tomuhle filtru nic neodpovídá"
            >
              V kategorii <strong className="font-semibold">Soupiska</strong> zatím nejsou žádné
              články. Zkuste jinou kategorii nebo zrušte filtr.
            </EmptyState>
          </Demo>

          <Demo caption="Zápasy · žádné nadcházející">
            <EmptyState
              actions={
                <>
                  <Button asChild size="md" variant="dark" withArrow>
                    <Link href="/aktuality">Sledovat aktuality</Link>
                  </Button>
                  <Button asChild size="md" variant="outline">
                    <Link href="/zapasy#odehrane">Odehrané zápasy</Link>
                  </Button>
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
                  <Button asChild size="md" variant="dark" withArrow>
                    <Link href="/#kontakt">Poslat fotky</Link>
                  </Button>
                  <Button asChild size="md" variant="outline">
                    <Link href="/fotogalerie#seznam">Starší sezóny</Link>
                  </Button>
                </>
              }
              icon="photos"
              title="Z této sezóny zatím nemáme fotky"
            >
              Fotogalerie ze sezóny <strong className="font-semibold">2026/27</strong> se teprve
              plní. Máte fotky ze zápasů? Pošlete nám je, rádi je zveřejníme.
            </EmptyState>
          </Demo>

          <Demo caption='frame="bare" · pro vložení do existující karty'>
            {/* Odsazení má tři stupně, ne dva — `md:p-9` je hodnota z handoffu
                kreslená pro 1440px a patří na `lg`. */}
            <div className="rounded-card bg-surface p-4.5 md:p-6 lg:p-9">
              <EmptyState
                actions={
                  <Button asChild size="sm" variant="dark" withArrow>
                    <Link href="/zapasy">Všechny zápasy</Link>
                  </Button>
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
    </SubpageShell>
  )
}

/** Obal jedné varianty s popiskem — popisky žijí jen v tomhle katalogu. */
function Demo({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <figure className="m-0">
      {children}
      <figcaption className="mt-3 text-center text-eyebrow font-semibold tracking-widest text-faint uppercase">
        {caption}
      </figcaption>
    </figure>
  )
}

export const metadata: Metadata = {
  title: brandTitle('Prázdné stavy — interní náhled'),
  description: 'Interní přehled prázdných stavů (EmptyState) pro výpisy webu HC Čestice.',
  robots: { index: false, follow: false },
}
