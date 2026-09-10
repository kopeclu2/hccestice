import React from 'react'

import { PageHeader } from '../components/PageHeader'
import { TRAININGS_PAGE } from '../content'

/**
 * Hlavička `/treninky`: jen drobečky, watermark a obecný titulek. Perex
 * a hlavní nadpis nese sám blok `landingTrainings` níž na stránce — druhý
 * pár by byl duplicitní.
 */
export function TreninkyHeader() {
  return (
    <PageHeader
      title="Tréninky"
      trail={[{ label: TRAININGS_PAGE.breadcrumb }]}
      watermark={TRAININGS_PAGE.watermark}
    />
  )
}
