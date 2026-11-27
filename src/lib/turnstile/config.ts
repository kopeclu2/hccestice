/**
 * Společná konfigurace Cloudflare Turnstile pro klient i server.
 *
 * Soubor je záměrně izomorfní (žádný `server-only`, žádný Payload import) —
 * importuje ho klientský hook, Payload hook i server action, aby se název
 * hlavičky a adresa skriptu nikdy nerozešly.
 */

/** Prázdný string = klíč není nastavený, ověření se v devu přeskakuje. */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

/** Hlavička, kterou klient posílá na `POST /api/form-submissions`. */
export const TURNSTILE_HEADER = 'x-turnstile-token'

export const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

export const TURNSTILE_SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
