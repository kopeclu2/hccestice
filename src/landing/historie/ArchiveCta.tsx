import React from 'react'

import { CtaStrip } from '../components/CtaStrip'
import { PillLink } from '../components/PillLink'
import { HISTORY_PAGE } from '../content'

/**
 * Tmavý CTA pás pod timeline — odkaz na fotoalbum s archivními fotkami.
 *
 * Odsazení je o půl kroku menší než u ostatních CTA pásů (handoff historie),
 * proto override místo výchozí varianty `cta`.
 */
export function ArchiveCta() {
  const { cta } = HISTORY_PAGE

  return (
    <CtaStrip className="mt-27.5" headline={cta.headline} perex={cta.perex}>
      <PillLink href={cta.href} variant="lime" withArrow>
        {cta.label}
      </PillLink>
    </CtaStrip>
  )
}
