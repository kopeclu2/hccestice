import type { SponsorCardBlock } from '@/payload-types'

import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import type { Photo } from '../../types'

import { CardTitle } from '../../components/Heading'
import { Kicker } from '../../components/Kicker'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { relId, toPhoto } from '../../data/format'
import { fetchSponsor } from '../../data/sponsors'

/** Karta sponzora — logo, jméno, poděkování a odkaz na web. */
export async function SponsorCardBlockComponent({ block }: { block: SponsorCardBlock }) {
  const sponsorId = relId(block.sponsor)
  if (!sponsorId) return null
  const sponsor = await fetchSponsor(sponsorId)
  if (!sponsor) return null

  return (
    <SponsorCardView
      kicker={block.kicker ?? null}
      logo={typeof sponsor.logo === 'object' && sponsor.logo ? toPhoto(sponsor.logo) : null}
      name={sponsor.name}
      note={block.note ?? null}
      url={sponsor.url ?? null}
    />
  )
}

function SponsorCardView({
  name,
  logo,
  url,
  kicker,
  note,
}: {
  name: string
  logo: Photo | null
  url: string | null
  kicker: string | null
  note: string | null
}) {
  return (
    <SectionShell>
      <Reveal>
        <div className="mx-auto flex max-w-140 flex-col items-center gap-4 rounded-card bg-surface p-4.5 text-center md:p-7.5 lg:p-10">
          {kicker && <Kicker>{kicker}</Kicker>}
          <div className="bg-chip grid h-28 w-56 place-items-center rounded-badge px-6">
            {logo ? (
              <Image
                alt={name}
                className="max-h-20 w-auto max-w-44 object-contain"
                height={80}
                src={getMediaUrl(logo.url)}
                width={176}
              />
            ) : (
              <span className="text-lead font-extrabold">{name}</span>
            )}
          </div>
          <CardTitle as="h3" size="md">
            {name}
          </CardTitle>
          {note && <p className="text-dim max-w-100 leading-relaxed text-pretty">{note}</p>}
          {url && (
            <a
              className="text-club hover:text-club-dark inline-flex items-center gap-2 text-meta font-bold"
              href={url}
              rel="noreferrer"
              target="_blank"
            >
              Web partnera <ArrowUpRight className="size-4" strokeWidth={2.5} />
            </a>
          )}
        </div>
      </Reveal>
    </SectionShell>
  )
}
