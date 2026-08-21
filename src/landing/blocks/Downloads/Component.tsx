import type { DownloadsBlock, Media } from '@/payload-types'

import { Download } from 'lucide-react'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { CardTitle } from '../../components/Heading'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'

const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const fileExtension = (filename: string | null | undefined): string =>
  filename?.split('.').pop()?.toUpperCase() ?? 'SOUBOR'

/** Dokumenty ke stažení — řádky se štítkem typu, velikostí a šipkou. */
export function DownloadsBlockComponent({ block }: { block: DownloadsBlock }) {
  const items = (block.items ?? []).filter(
    (item): item is typeof item & { file: Media } =>
      typeof item.file === 'object' && item.file !== null,
  )
  if (items.length === 0) return null

  return (
    <SectionShell>
      <Reveal>
        <div className="rounded-card bg-surface p-4.5 md:p-9">
          {block.title && (
            <CardTitle className="mb-3.5" size="md">
              {block.title}
            </CardTitle>
          )}
          {items.map((item, index) => (
            <a
              className="border-line-soft hover:bg-tint-hover -mx-2 flex items-center gap-4 rounded-xl border-b px-2 py-3.5 transition-colors last:border-b-0"
              download
              href={getMediaUrl(item.file.url)}
              key={item.id ?? index}
            >
              <span className="bg-chip text-club rounded-lg px-2.5 py-1.5 text-eyebrow font-extrabold tracking-wide">
                {fileExtension(item.file.filename)}
              </span>
              <span className="flex-1 text-body font-bold">{item.label || item.file.filename}</span>
              <span className="text-faint text-caption font-semibold">
                {formatFileSize(item.file.filesize)}
              </span>
              <span className="bg-lime text-ink grid size-8 flex-none place-items-center rounded-full [&_svg]:size-4">
                <Download strokeWidth={2.5} />
              </span>
            </a>
          ))}
        </div>
      </Reveal>
    </SectionShell>
  )
}
