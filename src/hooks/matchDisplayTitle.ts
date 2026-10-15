import type { FieldHook } from 'payload'

import { CLUB_NAME } from '@/lib/club'

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
