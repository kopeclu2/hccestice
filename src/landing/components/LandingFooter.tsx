import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import type { FooterContent, SiteLinks } from '../types'

import { SectionTitle } from './Heading'
import { Eyebrow } from './Kicker'
import { PillLink } from './PillLink'
import { Watermark } from './Watermark'

/**
 * Footer — zelená plocha s fotkou stadionu v overlay, headline
 * „Uvidíme se na zimáku.", CTA + sítě, sloupce odkazů a © řádek.
 */
export function LandingFooter({ content, site }: { content: FooterContent; site: SiteLinks }) {
  return (
    <footer className="relative z-1 mx-auto mt-21 w-full max-w-[97.5rem] px-[clamp(0.875rem,3vw,2.5rem)] pb-12 md:mt-32 lg:mt-50">
      <div className="bg-club relative overflow-hidden rounded-card p-4.5 text-white md:px-11 md:py-14">
        <Watermark className="-right-10 -bottom-15 text-watermark-3xl tracking-[-0.06em] text-white/12">
          HCČ
        </Watermark>
        {content.photo && (
          <Image
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-cover opacity-22"
            fill
            sizes="100vw"
            src={getMediaUrl(content.photo.url)}
          />
        )}

        {/*
         * `minmax(min(20rem,100%),…)`, ne `minmax(20rem,…)`: dolní hranice
         * dráhy 320px byla širší než vnitřek panelu na 320px displeji
         * (256px po odečtení odsazení patičky a paddingu), takže perex i
         * pilulka „Facebook" přetékaly za pravou hranu a `overflow-hidden`
         * je ustřihl. `min()` nechá dráhu spadnout na šířku kontejneru,
         * když se 20rem nevejde — bez breakpointu a na každé šířce.
         */}
        <div className="relative grid grid-cols-[repeat(auto-fit,minmax(min(20rem,100%),1fr))] items-end gap-12">
          <div>
            <SectionTitle className="text-white" size="xl">
              {content.headline}
            </SectionTitle>
            <p className="mt-4 mb-6.5 max-w-115 text-white/85">{content.perex}</p>
            <div className="flex flex-wrap gap-2.5">
              <PillLink href="#kontakt" variant="light" withArrow>
                Napiš nám
              </PillLink>
              {site.facebook && (
                <PillLink
                  href={site.facebook}
                  rel="noreferrer"
                  size="md"
                  target="_blank"
                  variant="inverse"
                >
                  Facebook
                </PillLink>
              )}
              {site.instagram && (
                <PillLink
                  href={site.instagram}
                  rel="noreferrer"
                  size="md"
                  target="_blank"
                  variant="inverse"
                >
                  Instagram
                </PillLink>
              )}
            </div>
          </div>

          <nav className="grid grid-cols-[repeat(auto-fit,minmax(9.375rem,1fr))] gap-7 text-meta">
            {content.columns.map((column) => (
              <div className="flex flex-col gap-2" key={column.title}>
                <Eyebrow tone="white">{column.title}</Eyebrow>
                {column.links.map((link) => (
                  <Link
                    className="hover:text-lime text-white transition-colors"
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="relative mt-11 flex flex-wrap items-center gap-3.5 border-t border-white/25 pt-5 text-caption text-white/70">
          <Image alt="" aria-hidden height={28} src="/logo-cestice.png" width={28} />
          <span>{`© ${new Date().getFullYear()} HC Čestice — TJ Sokol Čestice`}</span>
          <div className="flex-1" />
          <span>{content.league}</span>
        </div>
      </div>
    </footer>
  )
}
