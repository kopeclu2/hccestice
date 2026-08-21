import type { FeatureGridBlock } from '@/payload-types'

import {
  Calendar,
  Clock,
  Flame,
  GraduationCap,
  Handshake,
  Heart,
  Medal,
  Shield,
  Snowflake,
  Trophy,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import React from 'react'

import { CardTitle, SectionTitle } from '../../components/Heading'
import { Highlight } from '../../components/Kicker'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'

const FEATURE_ICONS: Record<string, LucideIcon> = {
  snowflake: Snowflake,
  trophy: Trophy,
  medal: Medal,
  users: Users,
  heart: Heart,
  shield: Shield,
  calendar: Calendar,
  clock: Clock,
  flame: Flame,
  handshake: Handshake,
  'graduation-cap': GraduationCap,
  wallet: Wallet,
}

/** Feature grid — dlaždice s ikonou, titulkem a textem („Proč k nám"). */
export function FeatureGridBlockComponent({ block }: { block: FeatureGridBlock }) {
  const items = block.items ?? []
  if (items.length === 0) return null

  return (
    <SectionShell>
      {block.title && (
        <Reveal>
          <SectionTitle className="mb-8">
            <Highlight>{block.title}</Highlight>
          </SectionTitle>
        </Reveal>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const Icon = FEATURE_ICONS[item.icon ?? 'snowflake'] ?? Snowflake
          return (
            <Reveal delay={index * 0.06} key={item.id ?? index}>
              <div className="h-full rounded-tile bg-surface p-6.5">
                <span className="bg-lime text-ink grid size-11 place-items-center rounded-2xl [&_svg]:size-5.5">
                  <Icon strokeWidth={2.25} />
                </span>
                <CardTitle className="mt-4" size="xs">
                  {item.title}
                </CardTitle>
                <p className="text-dim mt-1.5 text-meta leading-relaxed text-pretty">{item.text}</p>
              </div>
            </Reveal>
          )
        })}
      </div>
    </SectionShell>
  )
}
