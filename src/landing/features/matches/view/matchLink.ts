import type { MatchCardData } from '@/landing/features/matches/types'
import { CLUB_NAME } from '@/lib/club'

/**
 * Titulek zápasu pro odkaz v textu: „HC Čestice × HC Zdar" v pořadí
 * domácí × hosté (stejně jako `matchTitle`, ale z karty zápasu).
 */
export const matchLinkTitle = (card: Pick<MatchCardData, 'home' | 'opponentName'>): string =>
  card.home ? `${CLUB_NAME} × ${card.opponentName}` : `${card.opponentName} × ${CLUB_NAME}`
