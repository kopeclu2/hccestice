import React from 'react'

import { PageHeader } from '../components/PageHeader'
import { Highlight } from '../components/Kicker'
import { CONTACT, CONTACT_PAGE } from '../content'

/**
 * Hlavička `/kontakt`: drobečky, watermark, titulek a perex — na rozdíl od
 * `/treninky` nese hlavní claim i perex tady, ne panel pod ní. Panel
 * (`KontaktPanel`) je „vizitka + formulář" vedle sebe, ne druhá vystředěná
 * hero karta, takže by si o stejný pár textů neřekl.
 */
export function KontaktHeader() {
  return (
    <PageHeader
      perex={CONTACT.perex}
      title={
        <>
          Pojďme se <Highlight>domluvit</Highlight>.
        </>
      }
      trail={[{ label: CONTACT_PAGE.breadcrumb }]}
      watermark={CONTACT_PAGE.watermark}
    />
  )
}
