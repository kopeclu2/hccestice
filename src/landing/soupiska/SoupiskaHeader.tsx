import React from 'react'

import { Highlight } from '@/landing/ui/Kicker'
import { PageHeader } from '@/landing/ui/PageHeader'
import { PillLink } from '@/landing/ui/PillLink'

/**
 * Hlavička soupisky: drobečky, titulek s lime ročníkem sezóny, perex,
 * kotvicí pilulky na sekce postů (s počty) a souhrn vpravo.
 */
export function SoupiskaHeader({
  seasonLabel,
  pills,
  summary,
}: {
  seasonLabel: string | null
  pills: Array<{ href: string; label: string; count: number }>
  summary: string
}) {
  return (
    <PageHeader
      filters={pills.map((pill) => (
        <PillLink href={pill.href} key={pill.href} size="sm" variant="outline">
          {pill.label} <span className="font-medium text-faint">{pill.count}</span>
        </PillLink>
      ))}
      meta={summary}
      perex="A-tým mužů ve Východočeské hokejové lize. Kluci z Čestic a okolních vesnic — žádné přestupy za miliony, jen chuť hrát."
      title={
        <>
          Soupiska
          {seasonLabel && (
            <>
              {' '}
              <Highlight>{seasonLabel}</Highlight>
            </>
          )}
        </>
      }
      trail={[{ label: 'Soupiska' }]}
      watermark="TÝM"
    />
  )
}
