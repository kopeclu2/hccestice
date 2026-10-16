import React from 'react'

import { RosterWidgetView } from '@/landing/features/roster/components/RosterWidgetView'
import { fetchRoster } from '@/landing/features/roster/data'
import type { RosterWidgetBlock } from '@/payload-types'

/** Widget soupisky — zobrazí všechny aktivní hráče. */
export async function RosterWidgetBlockComponent({ block }: { block: RosterWidgetBlock }) {
  const players = await fetchRoster()
  return <RosterWidgetView players={players} title={block.title ?? null} />
}
