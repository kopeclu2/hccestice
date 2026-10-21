import { MapPin } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { CONTACT_MAP } from '@/landing/content'
import { ClickToLoadEmbed } from '@/landing/ui/ClickToLoadEmbed'
import { GlowCircle } from '@/landing/ui/Decorations'
import { CardTitle } from '@/landing/ui/Heading'
import { Eyebrow } from '@/landing/ui/Kicker'

/**
 * Mapa zimního stadionu na `/kontakt`.
 *
 * Stránka dřív nesla jen adresu spolku v Česticích, kde klub led nemá —
 * návštěvník neměl jak zjistit, kam na domácí zápas jet. Vlastní CMS blok
 * `mapEmbed` tu použít nejde (stránka není dokument v Payloadu), proto
 * vlastní karta s obsahem z `content.ts`.
 *
 * Karta je dvojče formuláře vedle ní (`ContactForm tone="light"`): stejný
 * obal, odsazení a dvojice popisek + nadpis, aby spolu na `lg` působily jako
 * pár. `lg:pt-10` vyrovnává `mt-10` formuláře, takže horní hrany lícují a
 * mřížka (`items-stretch`) srovná i spodní. Mapa si bere zbývající výšku
 * karty; pod `lg` má pevnou, aby nevytlačila obsah pod sebou.
 *
 * Mapa i zástupný rámeček před kliknutím jsou `absolute inset-0` v kontejneru
 * s výškou — nespoléhá se na procentuální výšku uvnitř flexu, která se
 * v Safari chová nespolehlivě.
 */
export function ContactMap() {
  const query = encodeURIComponent(CONTACT_MAP.query)

  return (
    <div className="flex flex-col lg:pt-10">
      <section
        aria-labelledby="kontakt-mapa-nadpis"
        className="relative z-0 flex flex-1 flex-col overflow-hidden rounded-panel border border-line-soft bg-surface p-4.5 text-ink md:p-6.5 lg:p-8.5"
      >
        <GlowCircle className="-top-20 -right-20 size-60" tone="lime" />

        <Eyebrow className="relative mb-2 block" tone="club">
          {CONTACT_MAP.title}
        </Eyebrow>
        <CardTitle className="relative mb-4.5" id="kontakt-mapa-nadpis" size="xs">
          {CONTACT_MAP.venue}
        </CardTitle>

        <div className="relative h-75 md:h-100 lg:h-auto lg:min-h-75 lg:flex-1">
          <ClickToLoadEmbed
            allowFullScreen
            frameClassName="absolute inset-0 size-full rounded-section"
            icon={<MapPin strokeWidth={2.25} />}
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${query}&output=embed`}
            title="Mapa zimního stadionu"
          />
        </div>

        <div className="relative mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
          <p className="text-sm text-dim">{CONTACT_MAP.address}</p>
          <Button asChild size="sm" variant="club" withArrow>
            <Link
              href={`https://www.google.com/maps/dir/?api=1&destination=${query}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              Navigovat
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
