/**
 * Společná konfigurace reCAPTCHA v3 pro klient i server.
 *
 * Soubor je záměrně izomorfní (žádný `server-only`, žádný Payload import) —
 * importuje ho jak klientský hook, tak Payload config a server action, aby
 * se akce a threshold nikdy nerozešly.
 */

/**
 * Názvy akcí posílané do Googlu. Musí přesně odpovídat tomu, co se ověřuje
 * na serveru (plugin i `verifyRecaptchaToken` porovnávají `response.action`).
 * Google povoluje jen znaky `[A-Za-z/_]`, proto podtržítko.
 */
export const RECAPTCHA_ACTIONS = {
  /** `POST /api/form-submissions` z bloku Formulář (hlídá plugin). */
  formSubmission: 'form_submission',
  /** Server action landing kontaktu (hlídá `verifyRecaptchaToken`). */
  contact: 'contact',
} as const

export type RecaptchaAction = (typeof RECAPTCHA_ACTIONS)[keyof typeof RECAPTCHA_ACTIONS]

/**
 * Minimální skóre. Default pluginu je 0.7, což je na klubový web zbytečně
 * ostré — radši pustíme přes síto pár spamů než abychom odmítli návštěvníka.
 */
export const RECAPTCHA_SCORE_THRESHOLD = 0.5

/** Prázdný string = klíč není nastavený, ověření se v devu přeskakuje. */
export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''
