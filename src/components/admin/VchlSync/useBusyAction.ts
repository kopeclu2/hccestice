'use client'

import { toast } from '@payloadcms/ui'
import { useCallback, useState } from 'react'

import { errorMessage } from '@/lib/errors'

/**
 * Tlačítko, které spouští dlouhou akci: drží, která právě běží (`busy`),
 * chybu ukáže toastem a na konci vždy uvolní. `perform` vrací výsledek akce,
 * případně `undefined`, když spadla — volající si tak nemusí chybu předávat
 * přes proměnnou uvnitř closure.
 */
export function useBusyAction<K extends string>() {
  const [busy, setBusy] = useState<K | null>(null)

  const perform = useCallback(
    async <T>(key: K, action: () => Promise<T>): Promise<T | undefined> => {
      setBusy(key)
      try {
        return await action()
      } catch (e) {
        toast.error(errorMessage(e))
        return undefined
      } finally {
        setBusy(null)
      }
    },
    [],
  )

  return { busy, perform }
}
