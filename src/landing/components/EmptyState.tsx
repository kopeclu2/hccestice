import React from 'react'

import { cn } from '@/utilities/ui'

import { CardTitle } from './Heading'
import { Watermark } from './Watermark'

/**
 * Prázdný stav — vkládá se místo mřížky karet, když filtr nic nevrátil nebo
 * se sekce ještě nemá čím naplnit (handoff „HC Cestice Systemove Stranky",
 * sekce Prázdné stavy).
 *
 * Nahrazuje pět různých jednořádkových odstavců, které měl každý výpis
 * vlastní. Slepá ulička („Zatím tu žádné články nejsou.") je totiž nejhorší
 * možná odpověď na aktivní filtr — proto má komponenta povinné `actions`:
 * z prázdného stavu musí vždy vést cesta dál.
 *
 * Uppercase popisky pod kartami v handoffu (`Aktuality · filtr bez výsledků`)
 * se **nepřenášejí** — to jsou anotace pro čtenáře designu, ne text pro
 * návštěvníka. Žijí jen v katalogu `/vzory`.
 */
export function EmptyState({
  actions,
  children,
  className,
  frame = 'card',
  icon,
  title,
  titleAs = 'h2',
  watermark,
}: {
  /** Cesty dál — typicky `PillLink`. Vždy alespoň jedna. */
  actions: React.ReactNode
  /** Perex pod nadpisem. */
  children?: React.ReactNode
  className?: string
  /**
   * `bare` = bez rámečku a pozadí, pro vložení do karty, která už svůj
   * rámeček má (widget Zápasy). Karta v kartě by jinak zdvojila okraj.
   */
  frame?: 'card' | 'bare'
  icon?: EmptyStateIconName
  title: React.ReactNode
  /**
   * Úroveň nadpisu. `h2` (výchozí) když je prázdný stav celým obsahem sekce
   * pod titulkem stránky, `h3` když nad ním už stojí hlavička sekce.
   */
  titleAs?: 'h2' | 'h3'
  /** Obrysové slovo na pozadí karty („VČHL") — jen desktop. */
  watermark?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'relative z-1 flex flex-col items-center overflow-hidden text-center',
        frame === 'card'
          ? 'border-line-mid rounded-section border bg-surface p-[clamp(2rem,5vw,4.5rem)]'
          : 'py-6',
        className,
      )}
    >
      {watermark && (
        <Watermark className="top-1/2 -right-7.5 -translate-y-1/2 text-club/8 text-watermark-sm">
          {watermark}
        </Watermark>
      )}

      {icon && <EmptyStateIcon name={icon} />}

      <CardTitle as={titleAs} className={cn(icon && 'mt-5.5')} size="lg">
        {title}
      </CardTitle>

      {children && (
        <p className="text-ink-soft mt-3 max-w-110 text-body leading-[1.55] text-pretty">
          {children}
        </p>
      )}

      <div className="mt-6.5 flex flex-wrap items-center justify-center gap-2.5">{actions}</div>
    </div>
  )
}

export type EmptyStateIconName = 'search' | 'schedule' | 'photos'

/**
 * Ikony prázdných stavů. Vlastní SVG, ne `lucide-react`: handoff je má
 * tříbarevné (obrys ink + zelený akcent + lime detail) a lucide kreslí
 * jednou barvou, takže by z nich zmizela polovina významu.
 */
function EmptyStateIcon({ name }: { name: EmptyStateIconName }) {
  const shared = { 'aria-hidden': true, fill: 'none', height: 56, width: 56, viewBox: '0 0 64 64' }

  if (name === 'search') {
    return (
      <svg {...shared}>
        <circle className="stroke-club" cx="28" cy="28" r="16" strokeWidth="3" />
        <path
          className="stroke-contrast"
          d="M40 40 L54 54"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <path className="stroke-lime" d="M21 28 H35" strokeLinecap="round" strokeWidth="4" />
      </svg>
    )
  }

  if (name === 'schedule') {
    return (
      <svg {...shared}>
        <rect className="stroke-contrast" height="44" rx="6" strokeWidth="3" width="48" x="8" y="12" />
        <path className="stroke-contrast" d="M8 26 H56" strokeWidth="3" />
        <path
          className="stroke-club"
          d="M20 6 V16 M44 6 V16"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <circle className="fill-lime" cx="32" cy="41" r="7" />
      </svg>
    )
  }

  return (
    <svg {...shared}>
      <rect className="stroke-contrast" height="40" rx="6" strokeWidth="3" width="52" x="6" y="16" />
      <path
        className="stroke-contrast"
        d="M22 16 L26 8 H38 L42 16"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <circle className="stroke-club" cx="32" cy="36" r="11" strokeWidth="3" />
      <circle className="fill-lime" cx="32" cy="36" r="4" />
    </svg>
  )
}
