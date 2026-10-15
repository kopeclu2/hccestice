import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { fetchSponsor } from '@/landing/features/sponsors/data'
import { toPhoto } from '@/landing/lib/media'
import { relId } from '@/landing/lib/payload'
import type { Photo } from '@/landing/types'
import { CardTitle } from '@/landing/ui/Heading'
import { Kicker } from '@/landing/ui/Kicker'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import { getMediaUrl } from '@/lib/getMediaUrl'
import type { SponsorCardBlock } from '@/payload-types'

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
          <div className="grid h-28 w-56 place-items-center rounded-badge bg-chip px-6">
            {logo ? (
              <Image
                alt={name}
                className="max-h-20 w-auto max-w-44 object-contain"
                height={80}
                src={getMediaUrl(logo.url, logo.updatedAt)}
                width={176}
              />
            ) : (
              <span className="text-lg font-bold">{name}</span>
            )}
          </div>
          <CardTitle as="h3" size="md">
            {name}
          </CardTitle>
          {note && <p className="max-w-100 leading-relaxed text-pretty text-dim">{note}</p>}
          {url && (
            <a
              className="inline-flex items-center gap-2 text-sm font-semibold text-club-dark hover:text-club"
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
