import type { LandingContactBlock } from '@/payload-types'

import { ArrowUpRight } from 'lucide-react'
import React from 'react'

import { Badge } from '../../components/Badge'
import { SectionTitle } from '../../components/Heading'
import { Highlight, Kicker } from '../../components/Kicker'
import { PillLink } from '../../components/PillLink'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { Watermark } from '../../components/Watermark'
import { CONTACT } from '../../content'
import { arrayOr } from '../../data/format'
import { fetchSite } from '../../data/site'
import type { ContactContent, SiteLinks } from '../../types'

import { ContactForm } from './ContactForm'

/** Block data → view-model (fallbacky na content.ts). */
function mapContact(block: LandingContactBlock): ContactContent {
  return {
    kicker: block.kicker ?? CONTACT.kicker,
    perex: block.perex ?? CONTACT.perex,
    pills: arrayOr(block.pills, [...CONTACT.pills], (pill) => pill.text),
    topics: arrayOr(block.topics, [...CONTACT.topics], (topic) => topic.label),
  }
}

/** Kontakt: e-mail a sítě ze `siteConfig`, texty z bloku. */
export async function ContactBlockComponent({ block }: { block: LandingContactBlock }) {
  const site = await fetchSite()
  return <ContactView content={mapContact(block)} site={site} />
}

/**
 * Kontakt — bílá karta s velkým e-mailem, pill údaji a odkazy na sítě,
 * uvnitř tmavá karta s formulářem. Dekorace: šrafování nahoře, rozmazané
 * barevné kruhy, svislé nápisy po stranách, watermark „ZIMÁK".
 */
function ContactView({ content, site }: { content: ContactContent; site: SiteLinks }) {
  return (
    <SectionShell id="kontakt">
      <Watermark
        className="text-club/6 top-70 -right-10 text-watermark-lg tracking-[-0.05em]"
        outlined={false}
      >
        ZIMÁK
      </Watermark>

      <Reveal>
        <div className="relative overflow-hidden rounded-card bg-surface px-4.5 py-10 text-center md:px-13 md:pt-16 md:pb-13">
          {/* dekorace pozadí */}
          <div className="hatch absolute inset-x-0 top-0 h-45 [mask-image:linear-gradient(#000,transparent)]" />
          <div className="pointer-events-none absolute top-50 -left-22 hidden size-85 rounded-full bg-[radial-gradient(circle,--alpha(var(--color-lime)/45%),transparent_65%)] blur-xl md:block" />
          <div className="pointer-events-none absolute top-85 -right-22 hidden size-85 rounded-full bg-[radial-gradient(circle,--alpha(var(--color-club)/20%),transparent_65%)] blur-xl md:block" />
          {/* Kruhy mají pevné pozice od pravé hrany karty. Na tabletu se karta
              zúží, ale nadpis zůstane vycentrovaný, takže lime tečka nasedla
              přímo na tečku za „led". Dekorace proto naskakují až od `lg`. */}
          <div className="border-club/14 pointer-events-none absolute top-17 right-15 hidden size-37.5 rounded-full border-2 lg:block" />
          <div className="bg-lime pointer-events-none absolute top-30 right-27 hidden size-13 rounded-full opacity-55 lg:block" />
          <div className="text-club/22 pointer-events-none absolute top-37 left-11 hidden origin-top-left -rotate-90 text-body font-extrabold tracking-[0.3em] whitespace-nowrap uppercase md:block">
            HC ČESTICE · VČHL
          </div>
          <div className="text-club/22 pointer-events-none absolute right-11 bottom-37 hidden origin-bottom-right rotate-90 text-body font-extrabold tracking-[0.3em] whitespace-nowrap uppercase md:block">
            POJĎME NA LED
          </div>

          <Kicker className="relative">{content.kicker}</Kicker>
          <SectionTitle className="relative mx-auto mt-5 mb-2.5" size="xl">
            Pojďme na <Highlight>led</Highlight>.
          </SectionTitle>
          <p className="text-dim relative mx-auto mb-9 max-w-120 leading-relaxed text-pretty">
            {content.perex}
          </p>

          <a
            /* Dvě změny kvůli 320px: spodní hranice clampu je 20px (při 24px
               se adresa nevešla) a `break-words` místo `overflow-wrap:anywhere`.
               `anywhere` totiž na rozdíl od `break-word` **snižuje max-content**
               boxu, takže shrink-to-fit `inline-flex` vyšel o jeden znak kratší
               a adresa se lámala („hccestice@seznam.c / z") i tam, kde se
               vejde. Záchranná brzda pro dlouhou adresu z CMS zůstává. */
            className="text-ink hover:text-club relative inline-flex items-center gap-2.5 text-[clamp(1.25rem,4vw,3.625rem)] font-extrabold tracking-[-0.03em] break-words transition-colors md:gap-4.5"
            href={`mailto:${site.email}`}
          >
            {site.email}
            <span className="bg-lime text-ink grid size-[0.9em] flex-none place-items-center rounded-full [&_svg]:size-[0.5em]">
              <ArrowUpRight strokeWidth={2.5} />
            </span>
          </a>

          <div className="relative mt-9 flex flex-wrap justify-center gap-2.5">
            {content.pills.map((pill) => (
              <Badge className="font-semibold" key={pill} size="lg" variant="outline">
                {pill}
              </Badge>
            ))}
            {site.facebook && <SocialPill href={site.facebook} label="Facebook" />}
            {site.instagram && <SocialPill href={site.instagram} label="Instagram" />}
          </div>

          <ContactForm topics={content.topics} />
        </div>
      </Reveal>
    </SectionShell>
  )
}

function SocialPill({ href, label }: { href: string; label: string }) {
  return (
    <PillLink href={href} rel="noreferrer" size="sm" target="_blank" variant="club">
      {label} ↗
    </PillLink>
  )
}
