'use client'

import React, { useEffect, useState } from 'react'

import { cn } from '@/utilities/ui'

import {
  PatternBackground,
  type PatternFade,
  type PatternTone,
  type PatternVariant,
} from './PatternBackground'

/**
 * DEV přepínač vzorů pozadí — plovoucí lišta dole (vzor: přepínač hero
 * variant z prototypu). Vybraný vzor se promítne přes celou stránku,
 * takže jde posoudit přímo v kontextu obsahu.
 *
 * Montuje se jen ve vývoji (viz layout `(landing)`); volba se drží
 * v localStorage, přežije tedy navigaci mezi stránkami.
 */

const VARIANTS: Array<{ id: PatternVariant | null; label: string }> = [
  { id: null, label: 'vyp' },
  { id: 'grid', label: 'grid' },
  { id: 'grid-dashed', label: 'dash' },
  { id: 'cross', label: 'cross' },
  { id: 'dots', label: 'dots' },
  { id: 'hatch', label: 'hatch' },
  { id: 'circuit', label: 'circuit' },
  { id: 'glow', label: 'glow' },
  { id: 'glow-duo', label: 'duo' },
  { id: 'noise', label: 'noise' },
]

const FADES: PatternFade[] = [
  'none',
  'center',
  'top',
  'bottom',
  'left',
  'right',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
]

const TONES: PatternTone[] = ['club', 'lime', 'ink', 'white']

const STORAGE_KEY = 'dev-pattern-switcher'

type SwitcherState = {
  variant: PatternVariant | null
  fade: PatternFade
  tone: PatternTone
}

const DEFAULT_STATE: SwitcherState = { variant: null, fade: 'center', tone: 'club' }

export function PatternDevSwitcher() {
  const [state, setState] = useState<SwitcherState>(DEFAULT_STATE)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) setState({ ...DEFAULT_STATE, ...JSON.parse(saved) })
    } catch {
      /* poškozený záznam — zůstane výchozí stav */
    }
    setLoaded(true)
  }, [])

  const update = (patch: Partial<SwitcherState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* private mode — volba se neuloží */
      }
      return next
    })
  }

  const cycle = <T,>(list: readonly T[], current: T): T =>
    list[(list.indexOf(current) + 1) % list.length] as T

  if (!loaded) return null

  return (
    <>
      {/* náhledová vrstva vzoru přes celou stránku (pod lištou, nad obsahem — jen dev) */}
      {state.variant && (
        <div className="pointer-events-none fixed inset-0 z-40">
          <PatternBackground fade={state.fade} tone={state.tone} variant={state.variant} />
        </div>
      )}

      <div className="bg-contrast/92 fixed bottom-4.5 left-1/2 z-50 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/14 p-1.5 shadow-overlay backdrop-blur-xl md:flex">
        <span className="px-2 pl-3 text-eyebrow font-extrabold tracking-[0.14em] text-white/50 uppercase">
          Vzor
        </span>

        {VARIANTS.map((item) => (
          <button
            className={cn(
              'cursor-pointer rounded-full px-3 py-2 text-caption font-bold whitespace-nowrap transition-colors',
              state.variant === item.id
                ? 'bg-lime text-ink'
                : 'text-white/80 hover:bg-white/10 hover:text-white',
            )}
            key={item.label}
            onClick={() => update({ variant: item.id })}
            type="button"
          >
            {item.label}
          </button>
        ))}

        <span className="mx-1 h-5 w-px bg-white/15" />

        <button
          className="cursor-pointer rounded-full px-3 py-2 text-caption font-bold whitespace-nowrap text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          onClick={() => update({ fade: cycle(FADES, state.fade) })}
          title="Přepnout fade masku"
          type="button"
        >
          fade: <span className="text-lime">{state.fade}</span>
        </button>

        <button
          className="cursor-pointer rounded-full px-3 py-2 text-caption font-bold whitespace-nowrap text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          onClick={() => update({ tone: cycle(TONES, state.tone) })}
          title="Přepnout barvu vzoru"
          type="button"
        >
          tone: <span className="text-lime">{state.tone}</span>
        </button>
      </div>
    </>
  )
}
