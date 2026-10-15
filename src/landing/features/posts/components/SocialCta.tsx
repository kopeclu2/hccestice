import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import type { SiteLinks } from '@/landing/types'
import { CtaStrip } from '@/landing/ui/CtaStrip'

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
        <Button asChild size="md" variant="inverse">
          <Link href={site.facebook} rel="noreferrer" target="_blank">
            Facebook
          </Link>
        </Button>
      )}
      {site.instagram && (
        <Button asChild variant="lime" withArrow>
          <Link href={site.instagram} rel="noreferrer" target="_blank">
            Instagram
          </Link>
        </Button>
      )}
    </CtaStrip>
  )
}
