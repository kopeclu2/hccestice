import type { FormattedEmail } from '@payloadcms/plugin-form-builder/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { parseSubmitterEmail, wrapFormEmails } from '@/email/templates/formSubmission'

const warn = vi.fn()

/** Parametry `beforeEmail` tak, jak je plugin skládá — jen to, co hook čte. */
function params(submitterEmail: string) {
  return {
    data: {
      form: 1,
      submissionData: [
        { field: 'name', value: 'Jan Novák' },
        { field: 'email', value: submitterEmail },
        { field: 'message', value: 'Dobrý den' },
      ],
    },
    doc: { id: 7 },
    req: {
      payload: {
        findByID: vi.fn(async () => ({ fields: [] })),
        logger: { warn },
      },
    },
  } as unknown as Parameters<typeof wrapFormEmails>[1]
}

/** Notifikace klubu a autoresponder; `to` autoresponderu je `{{email}}` po dosazení. */
const emailsFor = (submitterEmail: string): FormattedEmail[] => [
  {
    from: '',
    to: 'klub@example.cz',
    replyTo: '',
    subject: 'Nová zpráva',
    html: '<div>klub</div>',
    bcc: undefined,
    cc: undefined,
  } as unknown as FormattedEmail,
  {
    from: '',
    to: submitterEmail,
    replyTo: '',
    subject: 'Děkujeme',
    html: '<div>potvrzení</div>',
    bcc: undefined,
    cc: undefined,
  } as unknown as FormattedEmail,
]

beforeEach(() => warn.mockClear())

describe('parseSubmitterEmail', () => {
  it('přijme jednu platnou adresu a normalizuje ji', () => {
    expect(parseSubmitterEmail('  Jan@Example.CZ ')).toBe('jan@example.cz')
  })

  it.each([
    'a@x.cz, b@y.cz',
    'a@x.cz,b@y.cz',
    'a@x.cz; b@y.cz',
    'a@x.cz b@y.cz',
    '"a@x.cz" <b@y.cz>',
    'a@x.cz\r\nBcc: b@y.cz',
    'neni-email',
    '',
  ])('odmítne %j', (raw) => {
    expect(parseSubmitterEmail(raw)).toBeNull()
  })
})

describe('wrapFormEmails — autoresponder', () => {
  it('platná adresa: obě zprávy odejdou, autoresponder jde odesílateli', async () => {
    const result = await wrapFormEmails(emailsFor('jan@example.cz'), params('jan@example.cz'))
    expect(result).toHaveLength(2)
    expect(result.map((email) => email.to)).toEqual(['klub@example.cz', 'jan@example.cz'])
    expect(warn).not.toHaveBeenCalled()
  })

  it('víc adres v poli: autoresponder se zahodí, notifikace klubu zůstane', async () => {
    const raw = 'a@x.cz, b@y.cz'
    const result = await wrapFormEmails(emailsFor(raw), params(raw))
    expect(result).toHaveLength(1)
    expect(result[0]?.to).toBe('klub@example.cz')
    // Odesílatel se nesmí dostat ani do replyTo notifikace.
    expect(result[0]?.replyTo).not.toContain('b@y.cz')
  })

  it('log o zahozeném autoresponderu neobsahuje adresy', async () => {
    const raw = 'a@x.cz, b@y.cz'
    await wrapFormEmails(emailsFor(raw), params(raw))
    expect(warn).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(warn.mock.calls)).not.toMatch(/x\.cz|y\.cz/)
  })

  it('nesmyslná hodnota bez zavináče nezahodí klubovou notifikaci', async () => {
    // „a" je podřetězec klubové adresy; zahození podle `includes` by ji sebralo.
    const result = await wrapFormEmails(emailsFor('a'), params('a'))
    expect(result.map((email) => email.to)).toEqual(['klub@example.cz'])
  })

  it('oddělovač hlavičky v hodnotě se nedostane do hlaviček', async () => {
    const raw = 'a@x.cz\r\nbcc: b@y.cz'
    const result = await wrapFormEmails(emailsFor(raw), params(raw))
    expect(result).toHaveLength(1)
    // Hodnota smí zůstat jen v tabulce odpovědí (tělo), ne v hlavičkách.
    const headers = JSON.stringify(result.map(({ to, replyTo }) => ({ to, replyTo })))
    expect(headers).not.toContain('b@y.cz')
  })
})
