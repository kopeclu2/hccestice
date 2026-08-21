import React from 'react'

import { CtaStrip } from '../components/CtaStrip'
import { PillLink } from '../components/PillLink'
import type { SiteLinks } from '../types'

/**
 * Tmavý CTA pás „Nechceš nic propásnout?" pod výpisem — odkazy na sítě
 * ze `siteConfig`; bez vyplněných odkazů se pás nerenderuje.
 */
export function SocialCta({ site }: { site: SiteLinks }) {
  if (!site.facebook && !site.instagram) return null

  return (
    <CtaStrip
      headline="Nechceš nic propásnout?"
      perex="Sleduj nás na sítích — fotky a výsledky tam letí hned po zápase."
    >
      {site.facebook && (
        <PillLink href={site.facebook} rel="noreferrer" size="md" target="_blank" variant="inverse">
          Facebook
        </PillLink>
      )}
      {site.instagram && (
        <PillLink href={site.instagram} rel="noreferrer" target="_blank" variant="lime" withArrow>
          Instagram
        </PillLink>
      )}
    </CtaStrip>
  )
}
