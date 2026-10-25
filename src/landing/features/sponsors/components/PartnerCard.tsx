import { Globe, Mail, Phone } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { webLabel } from '@/landing/features/sponsors/format'
import type { Sponsor } from '@/landing/features/sponsors/types'
import { CardTitle } from '@/landing/ui/Heading'
import { Numeral } from '@/landing/ui/Numeral'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { telHref } from '@/lib/phone'
import { initials } from '@/lib/teamName'

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
 * - **Logo má pevný box** (`h-32`, `max-w-60`) s `object-contain` a stejným
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
 * Karta je záměrně velká (mřížka je přes celou šířku obsahu, ne v pruhu
 * 1080px): logo `h-32`, název `text-xl`, vedlejší údaje `text-sm`.
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
    <div className="flex h-full gap-3.5 rounded-tile border border-line-soft bg-surface p-5 transition-colors hover:border-club sm:flex-col sm:gap-4 md:p-6">
      <div className="grid h-24 w-32 flex-none place-items-center px-2 sm:h-32 sm:w-full">
        {sponsor.logo ? (
          <Image
            alt={sponsor.name}
            className="max-h-20 w-auto max-w-full object-contain sm:max-h-28 sm:max-w-60"
            height={sponsor.logo.height}
            sizes="(min-width: 640px) 15rem, 8rem"
            src={getMediaUrl(sponsor.logo.url, sponsor.logo.updatedAt)}
            width={sponsor.logo.width}
          />
        ) : (
          // Obrysový monogram — dekorativní placeholder bez loga, stejně jako
          // watermarky necháváme velikost beze změny.
          <Numeral aria-hidden className="text-club/35 select-none text-stroke" size="lg">
            {initials(sponsor.name)}
          </Numeral>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:contents">
        <div className="min-w-0">
          <CardTitle as="h3" className="leading-[1.2] tracking-snug text-pretty" size="sm">
            {sponsor.name}
          </CardTitle>
          {sponsor.person && (
            <div className="mt-1.5 text-sm font-semibold text-ink-soft">{sponsor.person}</div>
          )}
          {sponsor.address && (
            <div className="mt-1 text-sm leading-[1.45] font-medium text-pretty text-dim">
              {sponsor.address}
            </div>
          )}
        </div>

        {links.length > 0 && (
          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-0.5">
            {links.map(({ external, href, Icon, key, label }) => (
              <a
                aria-label={label}
                className="grid size-11 flex-none place-items-center rounded-full border border-line-soft text-club-dark transition-colors hover:border-club hover:bg-club hover:text-on-contrast md:size-10"
                href={href}
                key={key}
                rel={external ? 'noreferrer' : undefined}
                target={external ? '_blank' : undefined}
                title={label}
              >
                <Icon aria-hidden className="size-4.5" strokeWidth={2.25} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
