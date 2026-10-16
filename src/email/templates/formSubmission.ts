/**
 * Obálka e-mailů z form-builderu (`beforeEmail`).
 *
 * Plugin sám poskládá jen `<div>` se serializovaným Lexicalem z admina.
 * Tenhle hook z toho udělá klubový e-mail, doplní textovou alternativu,
 * tabulku odpovědí a odkaz do administrace — a hlavně dorovná hlavičky,
 * které plugin nechává prázdné.
 *
 * Rozlišují se dva druhy e-mailu podle adresáta:
 *
 * - **notifikace klubu** — plná tabulka odpovědí + tlačítko do adminu,
 *   `replyTo` na odesílatele, takže odpověď z Seznamu jde přímo jemu;
 * - **autoresponder odesílateli** — jen text z admina, `replyTo` na klub.
 */
import type { BeforeEmail, FormattedEmail } from '@payloadcms/plugin-form-builder/types'
import { z } from 'zod'

import { getServerSideURL } from '@/lib/getURL'

import { emailBranding, formattedFrom, notificationAddress } from '../config'
import { renderEmail, type EmailRow } from '../render'

/** Pole `email`, které zakládá seed kontaktního formuláře. */
const SUBMITTER_EMAIL_FIELD = 'email'

type SubmissionEntry = { field: string; value?: unknown }

const singleEmail = z.email()

/**
 * Adresa odesílatele, nebo `null`, když to není **právě jedna platná**
 * adresa. Hodnota pole `email` jde přes `POST /api/form-submissions`
 * nevalidovaná a plugin ji dosazuje do `to` autoresponderu (`{{email}}`),
 * takže `a@x.cz, b@y.cz` by potvrzení poslalo oběma — klubová schránka by
 * sloužila jako open relay pro cizí adresy.
 */
export const parseSubmitterEmail = (raw: string): string | null => {
  const parsed = singleEmail.safeParse(raw.trim())
  return parsed.success ? parsed.data.toLowerCase() : null
}

/** Adresy v poli `to` — plugin je rozděluje čárkou, nodemailer i středníkem. */
const recipientsOf = (to: string): string[] =>
  to
    .split(/[,;]/)
    .map((part) =>
      part
        .replace(/^.*<(.+)>.*$/, '$1')
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean)

/**
 * `beforeEmail` se volá z **afterChange** hooku
 * (`plugin-form-builder/dist/collections/FormSubmissions/hooks/sendEmail.js`),
 * takže `doc` na parametrech reálně je — typ `BeforeChangeParams`, kterým je
 * plugin deklaruje, je jen jeho nepřesnost.
 */
type WithDoc = { doc?: { id: number | string } }

/** Štítky polí z definice formuláře, aby tabulka nebyla `topic: Mládež`. */
const fieldLabels = (fields: unknown): Record<string, string> => {
  if (!Array.isArray(fields)) return {}
  const labels: Record<string, string> = {}
  for (const field of fields) {
    if (field && typeof field === 'object' && 'name' in field && typeof field.name === 'string') {
      const label = 'label' in field && typeof field.label === 'string' ? field.label : field.name
      labels[field.name] = label
    }
  }
  return labels
}

const toRows = (entries: SubmissionEntry[], labels: Record<string, string>): EmailRow[] =>
  entries
    // `formSubmissionID` do tabulky nepatří — je to interní ID pro {{curlys}}.
    .filter((entry) => entry.field !== 'formSubmissionID')
    .filter((entry) => entry.value !== undefined && entry.value !== null && entry.value !== '')
    .map((entry) => ({
      label: labels[entry.field] ?? entry.field,
      value: String(entry.value),
    }))

export const wrapFormEmails: BeforeEmail = async (emails, params) => {
  const { data, req } = params
  const { payload } = req
  const entries: SubmissionEntry[] = Array.isArray(data?.submissionData) ? data.submissionData : []

  const formId =
    data?.form && typeof data.form === 'object' && 'id' in data.form ? data.form.id : data?.form

  let labels: Record<string, string> = {}
  if (formId) {
    try {
      const form = await payload.findByID({ collection: 'forms', id: formId, depth: 0, req })
      labels = fieldLabels(form?.fields)
    } catch (err) {
      // Bez štítků se pošle tabulka s názvy polí — horší, ale ne rozbité.
      payload.logger.warn({ err, msg: 'Nepodařilo se načíst štítky polí formuláře' })
    }
  }

  const rows = toRows(entries, labels)
  const rawSubmitter = String(
    entries.find((entry) => entry.field === SUBMITTER_EMAIL_FIELD)?.value ?? '',
  )
    .trim()
    .toLowerCase()
  const submitterEmail = parseSubmitterEmail(rawSubmitter) ?? ''
  // Vyplněné, ale nepoužitelné (víc adres, nesmysl): z e-mailů, které by na
  // takovou hodnotu šly, se nepošle nic.
  const submitterRejected = Boolean(rawSubmitter) && !submitterEmail
  // Míří hlavička na vadnou hodnotu? Rovnost pro `{{email}}` samotné, `includes`
  // jen u hodnoty s `@` — „a" by jinak „našlo" i klubovou adresu.
  const carriesRejected = (header: string | undefined): boolean => {
    const value = (header ?? '').trim().toLowerCase()
    return (
      submitterRejected &&
      (value === rawSubmitter || (rawSubmitter.includes('@') && value.includes(rawSubmitter)))
    )
  }

  const submissionId = (params as typeof params & WithDoc).doc?.id

  const adminUrl = submissionId
    ? `${getServerSideURL()}/admin/collections/form-submissions/${submissionId}`
    : undefined

  const branding = emailBranding()

  const deliverable = emails.filter((email) => {
    if (!carriesRejected(email.to)) return true
    // Bez adres a bez textu — v logu je PII zbytečné, stačí, že se to stalo.
    payload.logger.warn({
      msg: 'Autoresponder zahozen: pole e-mail není právě jedna platná adresa',
    })
    return false
  })

  const prepared = deliverable.map((email) => {
    const isAutoresponder =
      Boolean(submitterEmail) && recipientsOf(email.to).includes(submitterEmail)

    const { html, text } = renderEmail({
      ...branding,
      heading: email.subject,
      bodyHtml: email.html,
      rows: isAutoresponder ? undefined : rows,
      button:
        isAutoresponder || !adminUrl
          ? undefined
          : { href: adminUrl, label: 'Otevřít v administraci' },
      footnote: isAutoresponder
        ? 'Na tento e-mail můžete odpovědět — odpověď dorazí do klubu.'
        : submitterEmail
          ? `Odpověď na tento e-mail míří přímo odesílateli (${submitterEmail}).`
          : undefined,
    })

    return {
      ...email,
      // Plugin skládá `from` z pole „E-mail od" a když je prázdné, pošle
      // prázdný string. Resend si default dosadí sám, ale nodemailer dělá
      // `{ from: default, ...message }`, takže prázdná hodnota default
      // PŘEPÍŠE a SMTP odmítne mail bez odesílatele.
      from: email.from || formattedFrom(),
      to: email.to || notificationAddress(),
      replyTo:
        (carriesRejected(email.replyTo) ? '' : email.replyTo) ||
        (isAutoresponder ? notificationAddress() : submitterEmail),
      html,
      text,
    }
  })

  // `FormattedEmail` textovou alternativu nezná, ale plugin výsledek posílá
  // rovnou do `payload.sendEmail`, kde `text` je platná nodemailer volba.
  return prepared as FormattedEmail[]
}
