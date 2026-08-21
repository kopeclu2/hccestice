import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { CardTitle } from '../components/Heading'
import { Eyebrow } from '../components/Kicker'
import { Numeral } from '../components/Numeral'
import { telHref, webLabel } from '../data/format'
import type { Sponsor } from '../types'

/**
 * Monogram partnera bez loga — iniciály prvních dvou slov názvu
 * („CIMIEL s.r.o." → „CS"). Záměrně jiné pravidlo než `initials`
 * na soupisce, kde se zkratky s tečkou zahazují.
 */
const monogram = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase()

/** Řádek kontaktu: mini-label vlevo, zelený odkaz vpravo. */
type ContactRow = { external: boolean; href: string; key: string; label: string }

/**
 * Řádková karta partnera: logo box (nebo obrysový monogram), název
 * s kontaktní osobou a adresou a sloupec kontaktů TEL / MAIL / WEB.
 *
 * Prázdné údaje se nevykreslují — když partner nemá žádný kontakt,
 * vypadne celý pravý sloupec, aby nedržel mezeru.
 *
 * Kontaktní odkazy mají na mobilu `min-h-11` (44px tap target) a místo
 * `truncate` se lámou (`break-words`): dlouhý e-mail se pod 1440px vešel
 * jen s výpustkou, takže návštěvník na mobilu i tabletu neviděl doménu.
 */
export function PartnerRow({ sponsor }: { sponsor: Sponsor }) {
  const rows: ContactRow[] = [
    ...(sponsor.phone
      ? [{ external: false, href: telHref(sponsor.phone), key: 'tel', label: sponsor.phone }]
      : []),
    ...(sponsor.email
      ? [
          {
            external: false,
            href: `mailto:${sponsor.email}`,
            key: 'mail',
            label: sponsor.email,
          },
        ]
      : []),
    ...(sponsor.url
      ? [{ external: true, href: sponsor.url, key: 'web', label: webLabel(sponsor.url) }]
      : []),
  ]

  return (
    <div className="border-line-soft hover:border-club rounded-tile relative flex flex-wrap items-center gap-y-3 overflow-hidden border bg-surface p-3.5 transition-colors md:flex-nowrap md:gap-[clamp(1rem,2.5vw,2rem)]">
      <div className="relative grid h-31 w-50 flex-none place-items-center overflow-hidden rounded-2xl">
        {sponsor.logo ? (
          <Image
            alt={sponsor.name}
            className="relative max-h-[74%] max-w-[78%] object-contain"
            height={sponsor.logo.height}
            sizes="12.5rem"
            src={getMediaUrl(sponsor.logo.url)}
            width={sponsor.logo.width}
          />
        ) : (
          // Obrysový monogram — dekorativní placeholder bez loga, stejně jako
          // watermarky necháváme velikost beze změny.
          <Numeral aria-hidden className="text-club/35 text-stroke relative select-none" size="lg">
            {monogram(sponsor.name)}
          </Numeral>
        )}
      </div>

      <div className="min-w-0 flex-[1_1_16.25rem]">
        <CardTitle as="h4" className="leading-[1.2] tracking-[-0.01em] text-pretty" size="xs">
          {sponsor.name}
        </CardTitle>
        {sponsor.person && (
          <div className="text-ink-soft mt-1 text-caption font-bold">{sponsor.person}</div>
        )}
        {sponsor.address && (
          <div className="text-faint mt-0.75 text-caption leading-[1.5] font-semibold">
            {sponsor.address}
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <div className="flex min-w-50 flex-[0_1_17.5rem] flex-col gap-0 pr-1.5 md:gap-1.5">
          {rows.map((row) => (
            <div
              className="flex min-w-0 items-center gap-2.5 text-meta md:items-baseline"
              key={row.key}
            >
              <Eyebrow className="w-8.5 flex-none" tone="faint">
                {row.key}
              </Eyebrow>
              <a
                className="text-club hover:text-club-dark flex min-h-11 min-w-0 items-center font-bold break-words transition-colors md:min-h-0"
                href={row.href}
                rel={row.external ? 'noreferrer' : undefined}
                target={row.external ? '_blank' : undefined}
              >
                {row.label}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
