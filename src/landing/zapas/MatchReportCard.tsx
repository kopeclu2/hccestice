import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

import { CardTitle } from '../components/Heading'
import { Eyebrow } from '../components/Kicker'
import { PillLink } from '../components/PillLink'
import type { MatchDetail } from '../types'

/**
 * Reportáž ze zápasu a odkaz na jeho fotogalerii. Kartu tvoří obě věci
 * dohromady, protože jsou to dvě cesty od čísel k příběhu zápasu a obě
 * jsou volitelné — bez jedné se vykreslí zbytek, bez obou nic.
 *
 * `wide` je karta bez časové osy vedle sebe: stojí přes celou šířku
 * hlavičky, takže od `md` jde fotka doleva a text doprava — na výšku by
 * fotka v plné šířce 1320 px zabrala celou obrazovku.
 *
 * `sizes` kopíruje layout stránky, proto ho předává page: do `lg` je karta
 * přes celou šířku, od `lg` pravý sloupec mřížky (zhruba 40vw); `wide` má
 * fotku od `md` v polovině karty. Výchozí je varianta se sloupcem.
 */
export function MatchReportCard({
  gallery,
  report,
  sizes = '(max-width: 1023px) 100vw, 40vw',
  wide = false,
}: Pick<MatchDetail, 'gallery' | 'report'> & { sizes?: string; wide?: boolean }) {
  if (!report && !gallery) return null

  return (
    <section
      aria-label="Reportáž a fotky"
      className={cn(
        'border-line-soft min-w-0 overflow-hidden rounded-tile border bg-surface',
        wide && report?.photo && 'md:grid md:grid-cols-2 md:items-center',
      )}
    >
      {report && (
        <>
          {report.photo && (
            <div
              className={cn(
                'relative aspect-[16/10] w-full overflow-hidden bg-chip',
                wide ? 'md:h-full md:min-h-72 md:aspect-auto' : 'md:aspect-[2/1] lg:aspect-[16/10]',
              )}
            >
              <Image
                alt=""
                className="object-cover"
                fill
                sizes={sizes}
                src={getMediaUrl(report.photo.url, report.photo.updatedAt)}
              />
            </div>
          )}
          <div className="p-4.5 md:p-7 lg:p-9">
            <Eyebrow tone="club">Reportáž ze zápasu</Eyebrow>
            <CardTitle as="h2" className="mt-2 text-pretty [overflow-wrap:anywhere]" size="sm">
              {report.title}
            </CardTitle>
            {report.excerpt && (
              <p className="text-ink-soft mt-3 text-body leading-[1.55] text-pretty">
                {report.excerpt}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2.5">
              <PillLink href={report.href} size="md" variant="dark" withArrow>
                Číst reportáž
              </PillLink>
              {gallery && (
                <PillLink href={gallery.href} size="md" variant="outline">
                  Fotogalerie
                </PillLink>
              )}
            </div>
          </div>
        </>
      )}
      {!report && gallery && (
        <div className="p-4.5 md:p-7 lg:p-9">
          <Eyebrow tone="club">Fotky ze zápasu</Eyebrow>
          <CardTitle as="h2" className="mt-2 text-pretty [overflow-wrap:anywhere]" size="sm">
            {gallery.title}
          </CardTitle>
          <div className="mt-5">
            <PillLink href={gallery.href} size="md" variant="dark" withArrow>
              Otevřít fotogalerii
            </PillLink>
          </div>
        </div>
      )}
    </section>
  )
}
