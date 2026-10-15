'use client'

import React from 'react'

import { cn } from '@/lib/utils'

/**
 * Odpočet do buly pro varianty hlavičky. Logika je tatáž jako
 * v `features/matches/components/Countdown` (hodnoty až po mountu, server kreslí „--",
 * po uplynutí věta místo nul), jen vzhled si volí varianta:
 *
 * - `tiles`  — čtyři „LED" dlaždice (Aréna),
 * - `plain`  — čísla oddělená vlasovou linkou na světlé ploše (Editorial),
 * - `inline` — jeden řádek „58 d 06:12:33" (Kompaktní aplikace).
 */
type Unit = { label: string; value: string }

const useRemaining = (targetISO: string): number | null => {
  const [remainingMs, setRemainingMs] = React.useState<number | null>(null)
  React.useEffect(() => {
    const target = new Date(targetISO).getTime()
    const tick = () => setRemainingMs(Math.max(0, target - Date.now()))
    tick()
    const interval = setInterval(tick, 1_000)
    return () => clearInterval(interval)
  }, [targetISO])
  return remainingMs
}

const pad = (value: number) => String(value).padStart(2, '0')

const toUnits = (remainingMs: number | null): Unit[] =>
  remainingMs === null
    ? [
        { label: 'dní', value: '--' },
        { label: 'hod', value: '--' },
        { label: 'min', value: '--' },
        { label: 'sek', value: '--' },
      ]
    : [
        { label: 'dní', value: pad(Math.floor(remainingMs / 86_400_000)) },
        { label: 'hod', value: pad(Math.floor(remainingMs / 3_600_000) % 24) },
        { label: 'min', value: pad(Math.floor(remainingMs / 60_000) % 60) },
        { label: 'sek', value: pad(Math.floor(remainingMs / 1_000) % 60) },
      ]

const LIVE_TEXT = 'Zápas právě probíhá nebo čeká na výsledek'

export function VariantCountdown({
  targetISO,
  look,
  className,
}: {
  targetISO: string
  look: 'tiles' | 'plain' | 'inline'
  className?: string
}) {
  const remainingMs = useRemaining(targetISO)
  const units = toUnits(remainingMs)

  if (remainingMs === 0) {
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
        {LIVE_TEXT}
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
