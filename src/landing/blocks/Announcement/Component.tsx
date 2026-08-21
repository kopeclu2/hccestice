import type { AnnouncementBlock } from '@/payload-types'

import React from 'react'

import { SectionShell } from '../../components/SectionShell'

import { AnnouncementBar } from './AnnouncementBar'

/** Oznámení — barevný pruh, volitelně zavíratelný (klient v AnnouncementBar). */
export function AnnouncementBlockComponent({ block }: { block: AnnouncementBlock }) {
  return (
    <SectionShell spacing="bar">
      <AnnouncementBar
        dismissible={Boolean(block.dismissible)}
        linkHref={block.linkHref ?? null}
        linkLabel={block.linkLabel ?? null}
        text={block.text}
        tone={block.tone ?? 'info'}
      />
    </SectionShell>
  )
}
