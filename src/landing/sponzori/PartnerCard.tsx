import { Globe, Mail, Phone } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { CardTitle } from '../components/Heading'
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

type ContactLink = {
  external: boolean
  href: string
  Icon: typeof Phone
  key: string
  label: string
}

/**
 * Karta partnera v mřížce `/sponzori` — logo v normalizovaném boxu, název
 * s kontaktní osobou a adresou a pod tím řada ikonových odkazů.
 *
 * Dřív to byl plnošířkový řádek s logem `h-31 w-50` a sloupcem textových
 * kontaktů TEL / MAIL / WEB. Patnáct takových řádků dělalo na mobilu stránku
 * přes 7000px vysokou, protože se každý rozpadl do tří pásů pod sebou.
 *
 * Tři věci, na kterých karta stojí:
 *
 * - **Logo má pevný box** (`h-20`, `max-w-32`) s `object-contain` a stejným
 *   paddingem bez ohledu na poměr stran originálu. Loga v kolekci jsou od
 *   čtverců po široké pásy; bez boxu by každá karta začínala jinde.
 * - **Kontakty jsou ikony, ne řádky textu.** Telefon i e-mail byly nejdelší
 *   texty na kartě a v užší dlaždici by se lámaly (`break-all`) na dva až tři
 *   řádky. Hodnota je v `aria-label` i `title`, takže o ni nepřijde ani
 *   odečítač, ani myš.
 * - **Tap target řeší velikost terče** (`size-10`, 40px), ne `min-h-11` na
 *   celém řádku — to dřív dělalo mezi TEL a MAIL ~88px prázdna.
 *
 * Pod `sm` je karta **řádek** (logo vlevo, text vpravo), od `sm` sloupec:
 * mřížka je pod 640px stejně jednosloupcová, takže dlaždice měla přes 350px
 * šířky a logo přes celou hlavu jí přidávalo skoro 100px výšky. Vnitřní obal
 * má proto `sm:contents` — v mobilním řádku drží pravý sloupec, ve sloupcové
 * kartě zmizí a rozestupy řídí jediný `gap` rodiče.
 *
 * Odkazy jsou `text-club-dark`, ne `text-club`: klubová zelená má na bílé
 * jen 3,25:1, což na drobné ikony nestačí.
 */
export function PartnerCard({ sponsor }: { sponsor: Sponsor }) {
  const links: ContactLink[] = [
    ...(sponsor.phone
      ? [
          {
            external: false,
            href: telHref(sponsor.phone),
            Icon: Phone,
            key: 'tel',
            label: `Zavolat ${sponsor.name}: ${sponsor.phone}`,
          },
        ]
      : []),
    ...(sponsor.email
      ? [
          {
            external: false,
            href: `mailto:${sponsor.email}`,
            Icon: Mail,
            key: 'mail',
            label: `Napsat ${sponsor.name}: ${sponsor.email}`,
          },
        ]
      : []),
    ...(sponsor.url
      ? [
          {
            external: true,
            href: sponsor.url,
            Icon: Globe,
            key: 'web',
            label: `Web ${sponsor.name}: ${webLabel(sponsor.url)}`,
          },
        ]
      : []),
  ]

  return (
    <div className="border-line-soft hover:border-club rounded-badge flex h-full gap-3.5 border bg-surface p-4 transition-colors sm:flex-col sm:gap-3 md:p-4.5">
      <div className="grid h-20 w-28 flex-none place-items-center px-2 sm:w-full">
        {sponsor.logo ? (
          <Image
            alt={sponsor.name}
            className="max-h-16 w-auto max-w-full object-contain sm:max-w-32"
            height={sponsor.logo.height}
            sizes="8rem"
            src={getMediaUrl(sponsor.logo.url, sponsor.logo.updatedAt)}
            width={sponsor.logo.width}
          />
        ) : (
          // Obrysový monogram — dekorativní placeholder bez loga, stejně jako
          // watermarky necháváme velikost beze změny.
          <Numeral aria-hidden className="text-club/35 text-stroke select-none" size="lg">
            {monogram(sponsor.name)}
          </Numeral>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:contents">
        <div className="min-w-0">
          <CardTitle as="h3" className="leading-[1.2] tracking-[-0.01em] text-pretty" size="xs">
            {sponsor.name}
          </CardTitle>
          {sponsor.person && (
            <div className="text-ink-soft mt-1 text-caption font-bold">{sponsor.person}</div>
          )}
          {sponsor.address && (
            <div className="text-dim mt-0.75 text-caption leading-[1.45] font-semibold text-pretty">
              {sponsor.address}
            </div>
          )}
        </div>

        {links.length > 0 && (
          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-0.5">
            {links.map(({ external, href, Icon, key, label }) => (
              <a
                aria-label={label}
                className="border-line-soft text-club-dark hover:bg-club hover:border-club hover:text-on-contrast grid size-10 flex-none place-items-center rounded-full border transition-colors md:size-9"
                href={href}
                key={key}
                rel={external ? 'noreferrer' : undefined}
                target={external ? '_blank' : undefined}
                title={label}
              >
                <Icon aria-hidden className="size-4" strokeWidth={2.25} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
