'use server'

import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { RECAPTCHA_ACTIONS } from '@/utilities/recaptcha/config'
import { verifyRecaptchaToken } from '@/utilities/recaptcha/verify'

import { contactSchema, type ContactResult, type ContactValues } from './schema'

/** Slug formuláře v CMS (zakládá `migration/seed-contact-form.ts`). */
const CONTACT_FORM_TITLE = 'Kontakt — landing page'

/**
 * Uloží zprávu z kontaktního formuláře jako form-submission v Payload.
 *
 * Vstup se validuje znovu na serveru (klientská validace je jen UX) —
 * do CMS nikdy nesmí projít nevalidní payload.
 *
 * Ochranu proti spamu tu musíme řešit sami: plugin `payload-recaptcha-v3`
 * hlídá jen REST operace, tahle action jde přes local API.
 */
export async function sendContactMessage(
  values: ContactValues,
  recaptchaToken: string | null,
): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(values)
  if (!parsed.success) {
    return { ok: false, error: 'Zkontrolujte prosím vyplněné údaje.' }
  }

  const payload = await getPayload({ config: configPromise })

  const verified = await verifyRecaptchaToken({
    token: recaptchaToken,
    action: RECAPTCHA_ACTIONS.contact,
    remoteIp: (await headers()).get('x-forwarded-for'),
  })
  if (!verified.ok) {
    payload.logger.warn(
      { reason: verified.reason },
      'reCAPTCHA odmítla odeslání kontaktního formuláře',
    )
    return { ok: false, error: 'Nepodařilo se ověřit, že nejste robot. Zkuste to prosím znovu.' }
  }

  const form = (
    await payload.find({
      collection: 'forms',
      where: { title: { equals: CONTACT_FORM_TITLE } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]

  if (!form) {
    payload.logger.error(`Kontaktní formulář „${CONTACT_FORM_TITLE}" v CMS neexistuje`)
    return { ok: false, error: 'Formulář je dočasně nedostupný. Napište nám prosím e-mail.' }
  }

  try {
    await payload.create({
      collection: 'form-submissions',
      data: {
        form: form.id,
        submissionData: Object.entries(parsed.data).map(([field, value]) => ({ field, value })),
      },
    })
    return { ok: true }
  } catch (error) {
    payload.logger.error({ err: error }, 'Uložení kontaktního formuláře selhalo')
    return { ok: false, error: 'Odeslání se nepovedlo. Zkuste to prosím znovu.' }
  }
}
