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

import { getServerSideURL } from '@/utilities/getURL'

import { emailBranding, formattedFrom, notificationAddress } from '../config'
import { renderEmail, type EmailRow } from '../render'

/** Pole `email`, které zakládá seed kontaktního formuláře. */
const SUBMITTER_EMAIL_FIELD = 'email'

type SubmissionEntry = { field: string; value?: unknown }

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
  const submitterEmail = String(
    entries.find((entry) => entry.field === SUBMITTER_EMAIL_FIELD)?.value ?? '',
  )
    .trim()
    .toLowerCase()

  const submissionId = (params as typeof params & WithDoc).doc?.id

  const adminUrl = submissionId
    ? `${getServerSideURL()}/admin/collections/form-submissions/${submissionId}`
    : undefined

  const branding = emailBranding()

  const prepared = emails.map((email) => {
    const isAutoresponder =
      Boolean(submitterEmail) && email.to.toLowerCase().includes(submitterEmail)

    const { html, text } = renderEmail({
      ...branding,
      heading: email.subject,
      bodyHtml: email.html,
      rows: isAutoresponder ? undefined : rows,
      button: isAutoresponder || !adminUrl ? undefined : { href: adminUrl, label: 'Otevřít v administraci' },
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
      replyTo: email.replyTo || (isAutoresponder ? notificationAddress() : submitterEmail),
      html,
      text,
    }
  })

  // `FormattedEmail` textovou alternativu nezná, ale plugin výsledek posílá
  // rovnou do `payload.sendEmail`, kde `text` je platná nodemailer volba.
  return prepared as FormattedEmail[]
}
