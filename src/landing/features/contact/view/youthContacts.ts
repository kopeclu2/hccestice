import type { PersonCard } from '@/landing/types'

/**
 * Osoby, které odpovídají na dotazy rodičů dětí — poznají se podle role
 * (kolekce `people`, pole „role“): obsahuje „mládež“, „žáci“, „přípravka“
 * nebo „děti“. Čistá funkce bez I/O; bez shody vrací prázdné pole, takže
 * kontaktní karta nic nevymýšlí a správce kontakt doplní v adminu.
 */
const YOUTH_ROLE = /ml[aá]d[eě]ž|žáci|žáků|přípravk|d[eě]ti|dětí/i

export function pickYouthContacts(people: PersonCard[]): PersonCard[] {
  return people.filter((person) => YOUTH_ROLE.test(person.role))
}
