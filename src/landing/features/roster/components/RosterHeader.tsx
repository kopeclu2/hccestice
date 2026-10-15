import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Highlight } from '@/landing/ui/Kicker'
import { PageHeader } from '@/landing/ui/PageHeader'

/**
 * Hlavička soupisky: drobečky, titulek s lime ročníkem sezóny, perex,
 * kotvicí pilulky na sekce postů (s počty) a souhrn vpravo.
 */
export function RosterHeader({
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
        <Button asChild key={pill.href} size="sm" variant="outline">
          <Link href={pill.href}>
            {pill.label} <span className="font-medium text-faint">{pill.count}</span>
          </Link>
        </Button>
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
