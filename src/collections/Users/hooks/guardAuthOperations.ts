import { APIError, ValidationError, type CollectionBeforeOperationHook } from 'payload'

import { passwordPolicyError } from '@/lib/passwordPolicy'
import { getClientIp, isRateLimited } from '@/lib/rateLimit'

/** Přihlášení: 10 pokusů za 10 minut z jedné IP. */
export const LOGIN_LIMIT = { windowMs: 10 * 60 * 1000, max: 10 }

/** Zapomenuté heslo: 3 žádosti za 15 minut z jedné IP (každá posílá e-mail). */
export const FORGOT_PASSWORD_LIMIT = { windowMs: 15 * 60 * 1000, max: 3 }

/**
 * `beforeOperation` kolekce `users`: ochrana přihlašovacích operací a pravidlo
 * pro nové heslo. Obojí platí jen pro REST / GraphQL (`payloadAPI !== 'local'`);
 * Local API (seed skripty, e2e helper) je důvěryhodné a nesmí se zablokovat.
 *
 * - **Rate limit podle IP** doplňuje `maxLoginAttempts` / `lockTime` v configu:
 *   ten zamyká jednotlivý účet (hrubá síla na jedno heslo), tohle brzdí
 *   střílení na víc účtů naráz a zahlcení odesílání e-mailů při
 *   `forgotPassword`. Limiter je in-memory (jeden proces, viz `rateLimit.ts`).
 *   Klíče login a forgot-password jsou oddělené, aby se nevyčerpávaly navzájem.
 * - **Heslo** se kontroluje při `create`, `update` a `resetPassword`, a jen
 *   když je v datech — existující uživatelé nejsou dotčení, dokud si heslo
 *   nezmění. Chyba jde jako `ValidationError` s cestou `password`, takže ji
 *   admin ukáže u pole.
 */
export const guardAuthOperations: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if (req.payloadAPI === 'local') return

  if (operation === 'login' || operation === 'forgotPassword') {
    const limit = operation === 'login' ? LOGIN_LIMIT : FORGOT_PASSWORD_LIMIT
    const key = `${operation === 'login' ? 'login' : 'forgot-password'}:${getClientIp(req.headers)}`
    if (isRateLimited(key, limit)) {
      throw new APIError('Příliš mnoho pokusů. Zkuste to prosím za chvíli znovu.', 429)
    }
    return
  }

  if (operation === 'create' || operation === 'update' || operation === 'resetPassword') {
    // Typ `args` je unie všech operací; heslo nese `data` u těchhle tří.
    const data = (args as { data?: { password?: unknown } }).data
    const message = passwordPolicyError(data?.password)
    if (message) {
      throw new ValidationError({
        collection: 'users',
        errors: [{ message, path: 'password' }],
      })
    }
  }
}
