'use client'

import {
  COUNTDOWN_LIVE_TEXT,
  useCountdown,
} from '@/landing/features/matches/components/useCountdown'
import { cn } from '@/lib/utils'

/**
 * Odpočet do buly pro varianty hlavičky. Logiku drží `useCountdown` (tatáž
 * jako v `components/Countdown`), vzhled si volí varianta:
 *
 * - `tiles`  — čtyři „LED" dlaždice (Aréna),
 * - `plain`  — čísla oddělená vlasovou linkou na světlé ploše (Editorial),
 * - `inline` — jeden řádek „58 d 06:12:33" (Kompaktní aplikace).
 */
export function VariantCountdown({
  targetISO,
  look,
  className,
}: {
  targetISO: string
  look: 'tiles' | 'plain' | 'inline'
  className?: string
}) {
  const { units, live } = useCountdown(targetISO)

  if (live) {
    return (
      <p
        className={cn(
          'flex items-center gap-2 font-semibold text-balance',
          look === 'tiles' ? 'text-lg text-white' : 'text-sm text-ink',
          className,
        )}
        role="status"
      >
        <span className="size-2 flex-none rounded-full bg-lime shadow-ring-lime" />
        {COUNTDOWN_LIVE_TEXT}
      </p>
    )
  }

  if (look === 'inline') {
    const [days, ...clock] = units
    return (
      <p className={cn('font-mono text-sm font-medium tabular-nums', className)}>
        <span className="sr-only">Do začátku zbývá </span>
        {days!.value}
        <span className="text-faint"> d </span>
        {clock.map((unit) => unit.value).join(':')}
      </p>
    )
  }

  if (look === 'plain') {
    return (
      <dl className={cn('flex divide-x divide-line tabular-nums', className)}>
        {units.map((unit) => (
          <div
            className="flex min-w-0 flex-1 flex-col px-2.5 first:pl-0 last:pr-0 md:px-5"
            key={unit.label}
          >
            <dt className="order-2 text-xs font-medium text-faint">{unit.label}</dt>
            <dd className="text-3xl leading-none font-extrabold tracking-[-0.03em] text-ink md:text-5xl">
              {unit.value}
            </dd>
          </div>
        ))}
      </dl>
    )
  }

  return (
    <dl className={cn('grid grid-cols-4 gap-1.5 tabular-nums md:gap-2.5', className)}>
      {units.map((unit, index) => (
        <div
          className="flex flex-col items-center rounded-field border border-white/10 bg-pine-deep/70 px-1 py-2 md:py-3"
          key={unit.label}
        >
          <dt className="order-2 mt-1 text-eyebrow font-semibold tracking-[0.12em] text-white/50 uppercase">
            {unit.label}
          </dt>
          <dd
            className={cn(
              'font-mono text-2xl leading-none font-bold md:text-3xl',
              index === units.length - 1 ? 'text-lime' : 'text-white',
            )}
          >
            {unit.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
