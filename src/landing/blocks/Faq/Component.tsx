import React from 'react'

import { FAQ } from '@/landing/content'
import { arrayOr } from '@/landing/lib/payload'
import type { FaqItem } from '@/landing/types'
import type { LandingFaqBlock } from '@/payload-types'

import { FaqAccordion } from './Accordion'

/** Block data → položky FAQ (fallback na content.ts). */
function mapFaq(block: LandingFaqBlock): FaqItem[] {
  return arrayOr(block.items, [...FAQ], (item) => ({
    question: item.question,
    answer: item.answer,
  }))
}

/** FAQ — server komponenta namapuje položky a předá klientskému accordionu. */
export function FaqBlockComponent({ block }: { block: LandingFaqBlock }) {
  return <FaqAccordion items={mapFaq(block)} />
}
