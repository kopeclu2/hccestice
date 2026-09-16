import type { MapEmbedBlock } from '@/payload-types'

import React from 'react'

import { MapPanel } from '../../components/MapPanel'

/**
 * Mapa — vložená mapa v zaoblené kartě + adresní pilulky.
 *
 * Markup drží `MapPanel` v `components/`, aby ho mohla použít i ručně psaná
 * stránka `/kontakt`; tenhle soubor je jen překlad polí bloku na její props.
 */
export function MapEmbedBlockComponent({ block }: { block: MapEmbedBlock }) {
  return (
    <MapPanel
      embedUrl={block.embedUrl}
      pills={(block.pills ?? []).map((pill) => pill.text)}
      title={block.title}
    />
  )
}
