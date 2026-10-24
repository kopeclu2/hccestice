import type { FieldHook } from 'payload'

import { CLUB_NAME } from '@/lib/club'
import { formatFullDate } from '@/lib/datetime'

import { resolveOpponent } from './resolveOpponent'

/**
 * Titulek zápasu pro admin (`useAsTitle`): „HC Čestice x Soupeř" v pořadí
 * domácí x hosté.
 *
 * Odděluje se malým „x", ne „×" jako `matchTitle` na webu: `displayTitle` je
 * uložená hodnota a vidí ji admin i seznamy, takže změna znaku by přepsala
 * data všech zápasů.
 *
 * Update jen s částí polí (např. `{ ahl: … }` ze synchronizace) nenese
 * `opponent` ani `home` — chybějící hodnoty se berou z uloženého dokumentu,
 * jinak by se titulek přepsal na „soupeř x HC Čestice".
 */
export const matchDisplayTitle: FieldHook = async ({ data, originalDoc, req }) => {
  const opponent = await resolveOpponent(req, data?.opponent ?? originalDoc?.opponent)
  const name = opponent?.name ?? 'soupeř'
  const home = data?.home ?? originalDoc?.home
  return home ? `${CLUB_NAME} x ${name}` : `${name} x ${CLUB_NAME}`
}

/**
 * Titulek zápasu s datem pro výběr v adminu: „15. 3. 2026 · HC Čestice x HC Žďár".
 *
 * Soupeř se v sezóně opakuje, takže titulek bez data je v pickeru relace
 * (článek, widgety v rich textu) nerozlišitelný. Datum na začátku se čte
 * dřív než jméno soupeře. Čistá funkce, ať jde testovat bez Payloadu.
 *
 * Idempotentní: titulek, který už datum nese, se nemění (afterRead může
 * doběhnout nad dokumentem opakovaně).
 */
export const withMatchDate = (title: string, date: string | null | undefined): string => {
  const label = date ? formatFullDate(date) : ''
  if (!label || title.startsWith(`${label} · `)) return title
  return `${label} · ${title}`
}

/**
 * `afterRead` pole `displayTitle` — jen zobrazení. Uložená hodnota a
 * `beforeChange` (`matchDisplayTitle`) zůstávají beze změny, takže se
 * nemigrují data. Nikdo mimo admin `displayTitle` nečte (web skládá titulek
 * přes `matchTitle`).
 *
 * Picker relace v adminu dotazuje **jen** pole `useAsTitle` (`select:
 * { displayTitle: true }`), takže dokument v hooku `date` nemá. Tehdy se
 * datum dočte jedním dotazem na dokument (jen v adminu, řádově deset zápasů
 * na stránku pickeru); chyba dotazu titulek nerozbije, vrátí se bez data.
 * Dotaz nejde přes `req`, aby se nepřipojil k cizí transakci ani neřetězil
 * hooky (čte jen `date`, `displayTitle` nevybírá).
 */
export const matchDisplayTitleAfterRead: FieldHook = async ({ value, data, siblingData, req }) => {
  if (typeof value !== 'string' || !value) return value
  let date = (data?.date ?? siblingData?.date) as string | null | undefined
  const id = (data?.id ?? siblingData?.id) as number | string | undefined
  if (!date && id != null) {
    try {
      const doc = await req.payload.findByID({
        collection: 'matches',
        id,
        depth: 0,
        select: { date: true },
        overrideAccess: true,
        disableErrors: true,
      })
      date = doc?.date
    } catch {
      return value
    }
  }
  return withMatchDate(value, date)
}
