'use client'

import type { LandingTrainingsBlock } from '@/payload-types'
import type { RowLabelProps } from '@payloadcms/ui'

import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

/**
 * Label sbaleného řádku rozpisu („Út · 16:15 – 17:15 — Muži + mládež").
 * Bez něj je v adminu u sbalených hodin jen „Hodina 1..4" a správce musí
 * každou rozklikávat, aby našel tu, kterou chce přesunout nebo změnit.
 */
export const TrainingRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<NonNullable<LandingTrainingsBlock['rows']>[number]>()

  const head = [data?.day, data?.time].filter(Boolean).join(' · ')
  const label = [head || `Hodina ${(rowNumber ?? 0) + 1}`, data?.group]
    .filter(Boolean)
    .join(' — ')

  return <div>{data?.hiddenOnWeb ? `${label} (skryto)` : label}</div>
}
