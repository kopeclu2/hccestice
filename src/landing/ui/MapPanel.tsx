import React from 'react'

import { Badge } from './Badge'
import { SectionTitle } from './Heading'
import { Highlight } from './Kicker'
import { PillLink } from './PillLink'
import { Reveal } from './Reveal'
import type { SectionShellProps } from './SectionShell'
import { SectionShell } from './SectionShell'

export type MapPanelProps = {
  className?: string
  /** Volitelný proklik „Navigovat" vedle pilulek. */
  directionsHref?: string
  directionsLabel?: string
  /** `src` iframe mapy (Mapy.cz „Vložit na web" nebo Google Maps embed). */
  embedUrl: string
  id?: string
  /**
   * Přístupný název mapy pro `title`/`aria-label` iframe. Default je `title`;
   * u mapy bez nadpisu je potřeba ho dodat ručně, jinak zůstane obecné „Mapa".
   */
  mapLabel?: string
  /** Neklikací pilulky pod mapou — adresa, praktické info. */
  pills?: readonly string[]
  /** Svislý rytmus sekce — viz `SectionShell`. */
  spacing?: SectionShellProps['spacing']
  /** Nadpis sekce; prázdný = mapa bez nadpisu (pak je potřeba `mapLabel`). */
  title?: null | string
}

/**
 * Mapa — vložená mapa v zaoblené kartě, pilulky s adresou a volitelný
 * proklik do navigace.
 *
 * Vizuální část je schválně mimo `blocks/MapEmbed`: kromě CMS bloku ji
 * používá i ručně psaná stránka `/kontakt`, kde žádný dokument v Payloadu
 * (a tedy ani typ `MapEmbedBlock`) není. Blok si odsud komponentu jen
 * obaluje a překládá na ni svá pole.
 */
export function MapPanel({
  className,
  directionsHref,
  directionsLabel = 'Navigovat',
  embedUrl,
  id,
  mapLabel,
  pills = [],
  spacing,
  title,
}: MapPanelProps) {
  const label = mapLabel ?? title ?? 'Mapa'
  const hasFooter = pills.length > 0 || Boolean(directionsHref)

  return (
    <SectionShell className={className} id={id} spacing={spacing}>
      <Reveal>
        {title && (
          <SectionTitle className="mb-6">
            <Highlight>{title}</Highlight>
          </SectionTitle>
        )}
        <div className="overflow-hidden rounded-card bg-surface p-2">
          {/*
            Výška má tři stupně, ne dva: na mobilu 300px (mapa nevytlačí
            obsah pod sebou), na tabletu 400px, desktopová hodnota z handoffu
            (480px) až od `lg`.
          */}
          <iframe
            allowFullScreen
            aria-label={label}
            className="h-75 w-full rounded-section border-0 md:h-100 lg:h-120"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={embedUrl}
            title={label}
          />
        </div>
        {hasFooter && (
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {pills.map((pill, index) => (
              <Badge className="bg-surface" key={index} size="md" variant="outline">
                {pill}
              </Badge>
            ))}
            {directionsHref && (
              <PillLink
                href={directionsHref}
                rel="noopener noreferrer"
                size="sm"
                target="_blank"
                variant="club"
                withArrow
              >
                {directionsLabel}
              </PillLink>
            )}
          </div>
        )}
      </Reveal>
    </SectionShell>
  )
}
