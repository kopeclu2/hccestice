/** České datumy a časy (Europe/Prague) pro view-modely landing stránek. */

export const CZECH_LOCALE = 'cs-CZ'

export const TIMEZONE = 'Europe/Prague'

/** „8. 3." */
export const formatDay = (iso: string): string =>
  new Date(iso).toLocaleDateString(CZECH_LOCALE, {
    day: 'numeric',
    month: 'numeric',
    timeZone: TIMEZONE,
  })

/** „8. března 17:00" */
export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleDateString(CZECH_LOCALE, {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  })

/** „ne 8. 3." */
/** „so" — zkratka dne v týdnu (Europe/Prague). */
export const formatWeekday = (iso: string): string =>
  new Date(iso).toLocaleDateString(CZECH_LOCALE, { weekday: 'short', timeZone: TIMEZONE })

export const formatWeekdayDay = (iso: string): string =>
  new Date(iso).toLocaleDateString(CZECH_LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    timeZone: TIMEZONE,
  })

/** „17:00" */
export const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString(CZECH_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  })

/** „8. 3. 2026" */
export const formatFullDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(CZECH_LOCALE, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: TIMEZONE,
  })

/** „8. března 2026" */
export const formatLongDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(CZECH_LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIMEZONE,
  })
