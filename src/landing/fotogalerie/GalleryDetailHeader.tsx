import React from 'react'

import { Badge } from '../components/Badge'
import { PageHeader } from '../components/PageHeader'
import { countLabel } from '../data/format'

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
          {dateLabel && <span className="text-faint text-caption font-bold">{dateLabel}</span>}
          <span className="text-faint text-caption font-bold">
            · {countLabel(photoCount, ['fotka', 'fotky', 'fotek'])}
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
