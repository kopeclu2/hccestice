/**
 * Založí formulář „Kontakt — landing page" (plugin form-builder),
 * do kterého ukládá zprávy server action `sendContactMessage`.
 *
 * Idempotentní: existující formulář se přeskočí. Pokud ale nemá nastavené
 * odchozí e-maily (starší verze seedu je neuměla), doplní se — jinak zpráva
 * skončí jen v adminu a nikdo se o ní nedozví.
 *
 * Spuštění: bun --env-file=.env migration/seed-contact-form.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { notificationAddress } from '../src/email/config'

const TITLE = 'Kontakt — landing page'

/** Odstavce v Lexicalu — tvar, který čeká `richText` pole form-builderu. */
const lexical = (...paragraphs: string[]) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: null,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      version: 1,
      children: [{ type: 'text', text, version: 1 }],
    })),
  },
})

/**
 * Dva e-maily na jedno odeslání: notifikace do klubu a potvrzení odesílateli.
 *
 * `emailFrom` zůstává PRÁZDNÉ záměrně — odesílatele dorovná `wrapFormEmails`
 * z `EMAIL_FROM_ADDRESS`, takže změna adresy je otázka env proměnné a ne
 * editace dokumentu v databázi. `{{pole}}` doplňuje plugin z odeslaných dat.
 */
const emails = [
  {
    emailTo: notificationAddress(),
    replyTo: '{{email}}',
    subject: 'Nová zpráva z webu: {{topic}}',
    message: lexical(
      'Přes kontaktní formulář na webu přišla nová zpráva. Odpověď na tento e-mail míří přímo odesílateli.',
    ),
  },
  {
    emailTo: '{{email}}',
    subject: 'Máme vaši zprávu — HC Čestice',
    // Záměrně bez {{name}}: pole je celé jméno, takže „Dobrý den Jana
    // Nováková" znělo šroubovaně.
    message: lexical(
      'Dobrý den, děkujeme za zprávu. Přečteme si ji a ozveme se co nejdřív.',
      'Tohle je automatické potvrzení, že zpráva došla — odpovídat na něj nemusíte.',
    ),
  },
]

const payload = await getPayload({ config })

const existing = await payload.find({
  collection: 'forms',
  where: { title: { equals: TITLE } },
  limit: 1,
  depth: 0,
})

const current = existing.docs[0]

if (current) {
  if (current.emails?.length) {
    console.log(`Formulář „${TITLE}" už existuje včetně e-mailů (id ${current.id})`)
    process.exit(0)
  }

  await payload.update({
    collection: 'forms',
    id: current.id,
    data: { emails } as never,
    context: { disableRevalidate: true },
  })
  console.log(`Formuláři „${TITLE}" (id ${current.id}) doplněny odchozí e-maily`)
  process.exit(0)
}

const form = await payload.create({
  collection: 'forms',
  data: {
    title: TITLE,
    fields: [
      { blockType: 'text', name: 'name', label: 'Jméno', required: true },
      { blockType: 'email', name: 'email', label: 'E-mail', required: true },
      {
        blockType: 'select',
        name: 'topic',
        label: 'Čeho se to týká',
        required: true,
        options: [
          { label: 'Chci hrát', value: 'Chci hrát' },
          { label: 'Mládež', value: 'Mládež' },
          { label: 'Sponzoring', value: 'Sponzoring' },
          { label: 'Jiné', value: 'Jiné' },
        ],
      },
      { blockType: 'textarea', name: 'message', label: 'Zpráva', required: true },
    ],
    emails,
    confirmationType: 'message',
    confirmationMessage: lexical('Díky za zprávu! Ozveme se co nejdřív.'),
    submitButtonLabel: 'Odeslat zprávu',
  } as any,
  context: { disableRevalidate: true },
})

console.log(`Formulář „${TITLE}" založen (id ${form.id})`)
process.exit(0)
