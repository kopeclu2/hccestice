import React from 'react'

import { CONTACT, CONTACT_PAGE } from '@/landing/content'
import { Highlight } from '@/landing/ui/Kicker'
import { PageHeader } from '@/landing/ui/PageHeader'

/**
 * Hlavička `/kontakt`: drobečky, watermark, titulek a perex — na rozdíl od
 * `/treninky` nese hlavní claim i perex tady, ne panel pod ní. Panel
 * (`ContactPanel`) je „vizitka + formulář" vedle sebe, ne druhá vystředěná
 * hero karta, takže by si o stejný pár textů neřekl.
 */
export function ContactHeader() {
  return (
    <PageHeader
      perex={CONTACT.perex}
      title={
        <>
          Pojďme se <Highlight dot>domluvit</Highlight>
        </>
      }
      trail={[{ label: CONTACT_PAGE.breadcrumb }]}
      watermark={CONTACT_PAGE.watermark}
    />
  )
}
