'use client'

import { Banner, toast } from '@payloadcms/ui'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

import { errorMessage } from '@/lib/errors'

import { fetchStatus, runSync, setSyncEnabled } from './api'
import { describeChanges } from './format'
import { History } from './History'
import { Overview, type OverviewBusy } from './Overview'
import { Settings } from './Settings'
import s from './styles.module.css'
import type { RunPayload, StatusPayload } from './types'
import { useBusyAction } from './useBusyAction'

const TABS = [
  { key: 'overview', label: 'Přehled' },
  { key: 'history', label: 'Historie běhů' },
  { key: 'settings', label: 'Nastavení' },
] as const
type TabKey = (typeof TABS)[number]['key']

export const VchlSyncPanel: React.FC<{ sentryOrg: string | null }> = ({ sentryOrg }) => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const tabParam = params.get('tab')
  const tab: TabKey = TABS.some((t) => t.key === tabParam) ? (tabParam as TabKey) : 'overview'

  const [data, setData] = useState<StatusPayload | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [dry, setDry] = useState<RunPayload | null>(null)
  const { busy, perform } = useBusyAction<OverviewBusy>()

  const load = useCallback(async () => {
    try {
      setData(await fetchStatus())
      setLoadError(null)
    } catch (e) {
      setLoadError(errorMessage(e))
    }
  }, [])

  useEffect(() => {
    // Načtení z API po připojení stránky; setState proběhne až po odpovědi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const setTab = (key: TabKey) => {
    const next = new URLSearchParams(params.toString())
    next.set('tab', key)
    router.replace(`${pathname}?${next.toString()}`)
  }

  const run = (dryRun: boolean) =>
    perform(dryRun ? 'dry' : 'run', async () => {
      const result = await runSync(dryRun)
      if (dryRun) {
        setDry(result)
        toast.success(`Nanečisto hotovo: ${describeChanges(result.changes)}.`)
      } else if (result.status === 'error') {
        toast.error(`Synchronizace selhala: ${result.error ?? 'neznámá chyba'}`)
      } else {
        toast.success(`Synchronizace dokončena: ${describeChanges(result.changes)}.`)
      }
      await load()
    })

  const toggle = async () => {
    if (!data) return
    const enabled = !data.status.enabled
    if (
      !enabled &&
      !window.confirm(
        'Opravdu vypnout automatickou synchronizaci? Zápasy a statistiky se přestanou aktualizovat samy.',
      )
    ) {
      return
    }
    await perform('toggle', async () => {
      await setSyncEnabled(enabled)
      toast.success(
        enabled ? 'Automatická synchronizace je zapnutá.' : 'Automatická synchronizace je vypnutá.',
      )
      await load()
    })
  }

  return (
    <div className={s.root}>
      <div className={s.header}>
        <h1>Synchronizace VČHL</h1>
        <p>Automatické přebírání rozlosování, výsledků, sestav a tabulky z ahl.cz.</p>
      </div>

      <div className={s.tabs} role="tablist">
        {TABS.map((t) => (
          <button
            aria-selected={tab === t.key}
            className={`${s.tab} ${tab === t.key ? s.tabActive : ''}`}
            key={t.key}
            onClick={() => setTab(t.key)}
            role="tab"
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {loadError && <Banner type="error">Nepodařilo se načíst stav: {loadError}</Banner>}

      {tab === 'overview' && (
        <Overview busy={busy} data={data} dry={dry} onRun={run} onToggle={toggle} />
      )}
      {tab === 'history' && <History runs={data?.runs ?? null} sentryOrg={sentryOrg} />}
      {tab === 'settings' && <Settings />}
    </div>
  )
}
