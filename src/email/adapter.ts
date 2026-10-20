/**
 * Volba e-mailového adapteru podle prostředí.
 *
 * Priorita je záměrná — od nejsilnější konfigurace k nejslabší:
 *
 * | podmínka                    | adapter                        |
 * |-----------------------------|--------------------------------|
 * | `RESEND_API_KEY`            | `@payloadcms/email-resend`     |
 * | `SMTP_HOST`                 | `@payloadcms/email-nodemailer` |
 * | nic z toho                  | `logAdapter` (jen do konzole)  |
 *
 * Fallback je **vlastní**, ne `nodemailerAdapter()` bez argumentů: ten si
 * zakládá testovací účet na ethereal.email, což znamená síťový request při
 * bootu a `InvalidConfiguration` (tedy spadlý start celé appky) kdykoli je
 * ethereal nedostupný nebo běžíme offline — viz `createMockAccount`
 * v `@payloadcms/email-nodemailer/dist/index.js`.
 */
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { resendAdapter } from '@payloadcms/email-resend'
import type { EmailAdapter } from 'payload'

import { fromAddress, fromName } from './config'

/** Adresáta obsahu jde jen zalogovat, tvar má tři varianty. */
const describeRecipient = (to: unknown): string => {
  if (typeof to === 'string') return to
  if (Array.isArray(to)) return to.map(describeRecipient).join(', ')
  if (to && typeof to === 'object' && 'address' in to) return String(to.address)
  return '(neznámý adresát)'
}

/** Počet adresátů — do produkčního logu se adresy ani tělo nedostanou. */
const countRecipients = (to: unknown): number => {
  if (Array.isArray(to)) return to.reduce<number>((sum, item) => sum + countRecipients(item), 0)
  if (typeof to === 'string') return to.split(/[,;]/).filter((part) => part.trim()).length
  return to && typeof to === 'object' && 'address' in to ? 1 : 0
}

/**
 * Adapter, který e-mail neodešle a vypíše ho do logu.
 *
 * V devu je to feature (žádný účet u providera, nic neodejde skutečnému
 * adresátovi), v produkci chyba — proto se úroveň logu podle prostředí liší.
 *
 * V produkci se loguje **jen předmět a počet adresátů**: tělo reset-password
 * mailu nese platný token (převzetí účtu administrátora) a tělo formuláře
 * osobní údaje, a logy jdou do Coolify i do Sentry. V devu zůstává celé
 * tělo, protože odkaz z mailu je jediný způsob, jak si ho vyzkoušet.
 */
const logAdapter =
  (): EmailAdapter =>
  ({ payload }) => ({
    name: 'log',
    defaultFromAddress: fromAddress(),
    defaultFromName: fromName(),
    sendEmail: async (message) => {
      const msg = 'E-mail se NEODESLAL — chybí RESEND_API_KEY i SMTP_HOST (viz .env.example)'

      if (process.env.NODE_ENV === 'production') {
        payload.logger.error({
          subject: message.subject,
          recipientCount: countRecipients(message.to),
          msg,
        })
      } else {
        payload.logger.warn({
          to: describeRecipient(message.to),
          subject: message.subject,
          text: message.text,
          msg,
        })
      }
      return message
    },
  })

/**
 * `email` v Payload configu bere i `Promise<EmailAdapter>`
 * (`payload/dist/config/types.d.ts`), takže se tahle funkce volá bez `await`
 * a resolvuje se až při inicializaci.
 */
export async function emailAdapter(): Promise<EmailAdapter> {
  const defaultFromAddress = fromAddress()
  const defaultFromName = fromName()
  /** Testovací režim: všechny maily přepošli na jednu adresu. */
  const overrideRecipientAddress = process.env.EMAIL_OVERRIDE_RECIPIENT?.trim() || undefined

  const resendApiKey = process.env.RESEND_API_KEY?.trim()
  if (resendApiKey) {
    return resendAdapter({
      apiKey: resendApiKey,
      defaultFromAddress,
      defaultFromName,
      overrideRecipientAddress,
    })
  }

  const host = process.env.SMTP_HOST?.trim()
  if (host) {
    const port = Number(process.env.SMTP_PORT ?? 587)
    const user = process.env.SMTP_USER?.trim()
    const pass = process.env.SMTP_PASSWORD

    return nodemailerAdapter({
      defaultFromAddress,
      defaultFromName,
      overrideRecipientAddress,
      transportOptions: {
        host,
        port,
        // Port 465 je implicitní TLS, 587 STARTTLS. Nechat rozhodnout port
        // je bezpečnější než další proměnná, kterou někdo zapomene otočit.
        secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
        ...(user ? { auth: { user, pass } } : {}),
      },
    })
  }

  return logAdapter()
}
