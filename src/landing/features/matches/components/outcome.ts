import type { Outcome } from '@/landing/features/matches/types'

/**
 * Štítek výsledku z pohledu Čestic — jeden zdroj pro výpis výsledků
 * (`ResultsList`) i hlavičku detailu zápasu (`MatchHeader`), aby se barvy
 * nerozešly. Prohra po prodloužení / nájezdech je „půlená" (`split`):
 * cihlová jako prohra, druhá půlka zelená za získaný bod.
 */
export const OUTCOME_BADGE: Record<
  Outcome,
  { label: string; variant: 'lime' | 'muted' | 'split' | 'loss'; note?: string }
> = {
  win: { label: 'Výhra', variant: 'lime' },
  draw: { label: 'Remíza', variant: 'muted' },
  otLoss: { label: 'Prohra', variant: 'split', note: 'po prodloužení nebo nájezdech, bod' },
  loss: { label: 'Prohra', variant: 'loss' },
}
