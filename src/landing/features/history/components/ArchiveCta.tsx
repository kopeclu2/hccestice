import React from 'react'

import { HISTORY_PAGE } from '@/landing/content'
import { CtaStrip } from '@/landing/ui/CtaStrip'
import { PillLink } from '@/landing/ui/PillLink'

/**
 * Tmavý CTA pás pod timeline — odkaz na fotoalbum s archivními fotkami.
 *
 * Odsazení je o půl kroku menší než u ostatních CTA pásů (handoff historie),
 * proto override místo výchozí varianty `cta`.
 */
export function ArchiveCta() {
  const { cta } = HISTORY_PAGE

  return (
    <CtaStrip className="mt-18 md:mt-24 lg:mt-27.5" headline={cta.headline} perex={cta.perex}>
      <PillLink href={cta.href} variant="lime" withArrow>
        {cta.label}
      </PillLink>
    </CtaStrip>
  )
}
