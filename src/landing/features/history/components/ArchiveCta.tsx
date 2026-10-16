import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { HISTORY_PAGE } from '@/landing/content'
import { CtaStrip } from '@/landing/ui/CtaStrip'

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
      <Button asChild variant="lime" withArrow>
        <Link href={cta.href}>{cta.label}</Link>
      </Button>
    </CtaStrip>
  )
}
