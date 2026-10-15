import React from 'react'

import { Badge } from '@/landing/ui/Badge'
import { PageHeader } from '@/landing/ui/PageHeader'
import { countLabel } from '@/lib/plural'

/**
 * Hlavička detailu galerie: drobečky, titulek a meta řádek
 * (sezóna, datum, počet fotek). Design detailu nemá vlastní handoff —
 * drží layoutový systém výpisu, jen s menším titulkem a hustším meta řádkem.
 */
export function GalleryDetailHeader({
  title,
  dateLabel,
  seasonLabel,
  photoCount,
}: {
  title: string
  dateLabel: string | null
  seasonLabel: string | null
  photoCount: number
}) {
  return (
    <PageHeader
      filters={
        <>
          {seasonLabel && (
            <Badge size="xs" variant="lime">
              {seasonLabel}
            </Badge>
          )}
          {dateLabel && <span className="text-xs font-semibold text-faint">{dateLabel}</span>}
          {/* Oddělovač je samostatný element, ne součást posledního popisku:
              natvrdo v textu se sčítal s `gap-2.5` do dvojité mezery a bez
              data zůstávala úvodní tečka viset před počtem fotek. */}
          {dateLabel && (
            <span aria-hidden className="text-xs font-semibold text-faint">
              ·
            </span>
          )}
          <span className="text-xs font-semibold text-faint">
            {countLabel(photoCount, ['fotka', 'fotky', 'fotek'])}
          </span>
        </>
      }
      rowClassName="mt-5 gap-2.5"
      spacer={false}
      title={title}
      titleClassName="max-w-260"
      titleSize="md"
      trail={[{ href: '/fotogalerie', label: 'Fotoalbum' }, { label: title }]}
      watermark="FOTO"
    />
  )
}
