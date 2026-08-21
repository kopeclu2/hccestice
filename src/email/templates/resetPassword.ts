/**
 * E-mail „obnovení hesla do administrace".
 *
 * Výchozí Payload mail je anglický a bez vizuálu — pro klub, kde admin
 * dostane přihlášení jednou za rok, je to hlavní důvod, proč to nedopadne
 * dobře. Registruje se v `src/collections/Users/index.ts`.
 *
 * Payload umí u forgotPassword nastavit jen `generateEmailHTML`, textovou
 * alternativu tam předat nelze — proto se `renderEmailText` nepoužívá.
 */
import type { User } from '@/payload-types'

import { getServerSideURL } from '@/utilities/getURL'

import { CLUB_NAME, emailBranding } from '../config'
import { renderEmailHtml } from '../render'

/** Platnost odkazu — musí zůstat v souladu s `forgotPassword.expiration`. */
export const RESET_TOKEN_HOURS = 1

export const resetPasswordSubject = (): string => `Obnovení hesla do administrace ${CLUB_NAME}`

export const resetPasswordHtml = (args?: { token?: string; user?: unknown }): string => {
  const token = args?.token ?? ''
  const user = args?.user as Partial<User> | undefined
  const greeting = user?.firstName ? `Dobrý den, ${user.firstName},` : 'Dobrý den,'

  return renderEmailHtml({
    ...emailBranding(),
    heading: 'Obnovení hesla',
    preheader: `Odkaz na nastavení nového hesla platí ${RESET_TOKEN_HOURS} hodinu.`,
    paragraphs: [
      greeting,
      'někdo (nejspíš vy) požádal o obnovení hesla do administrace webu. Nové heslo si nastavíte přes tlačítko níž.',
    ],
    button: {
      href: `${getServerSideURL()}/admin/reset/${token}`,
      label: 'Nastavit nové heslo',
    },
    footnote: `Odkaz platí ${RESET_TOKEN_HOURS} hodinu a použít ho lze jednou. Pokud jste o obnovení nežádali, tento e-mail ignorujte — heslo zůstává beze změny.`,
  })
}
