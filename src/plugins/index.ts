import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { navigationPlugin } from 'payload-cms-navigation-plugin'
import reCAPTCHAv3 from 'payload-recaptcha-v3'
import { auditor } from './auditor'
import { navigationOverrides } from './navigationOverrides'
import { notificationAddress } from '@/email/config'
import { wrapFormEmails } from '@/email/templates/formSubmission'
import { APIError, Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { brandTitle } from '@/utilities/brandTitle'
import { getServerSideURL } from '@/utilities/getURL'
import { RECAPTCHA_ACTIONS, RECAPTCHA_SCORE_THRESHOLD } from '@/utilities/recaptcha/config'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  // Suffix drží `brandTitle`, ne tenhle řádek — sdílí ho s `generateMeta`,
  // aby se branding nedosadil dvakrát.
  return brandTitle(doc?.title)
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      admin: { group: 'Systém' },
      labels: { singular: 'Přesměrování', plural: 'Přesměrování' },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    // Klubová šablona + textová alternativa + dorovnání prázdných hlaviček,
    // které plugin posílá dál (viz `src/email/templates/formSubmission.ts`).
    beforeEmail: wrapFormEmails,
    // Když formulář v adminu nemá vyplněné „E-mail komu", nespadne to na
    // `payload.email.defaultFromAddress` (tedy odesílatele), ale míří do klubu.
    defaultToEmail: notificationAddress(),
    formOverrides: {
      admin: { group: 'Systém' },
      labels: { singular: 'Formulář', plural: 'Formuláře' },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
    formSubmissionOverrides: {
      admin: { group: 'Systém' },
      labels: { singular: 'Odeslaný formulář', plural: 'Odeslané formuláře' },
      // Kolekce má z pluginu `access.create: () => true`, tedy veřejně
      // zapisovatelný REST endpoint. Ochranu čte `reCAPTCHAv3` níž z `custom`.
      custom: {
        recaptcha: [{ name: 'create', action: RECAPTCHA_ACTIONS.formSubmission }],
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      admin: { group: 'Systém' },
      labels: { singular: 'Výsledek hledání', plural: 'Výsledky hledání' },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  /**
   * Navigace landing page — kolekce `navigation-containers` a
   * `navigation-items`. Plugin je nezralý (anglické labely, žádné hooky,
   * pole navíc, která nepoužíváme), proto ho hned za ním srovnává
   * `navigationOverrides`. `localization` mu NIKDY nepředávat — doplnil by
   * `config.localization` a přepsal schéma všech kolekcí projektu.
   */
  navigationPlugin({ collections: { pages: true } }),
  // Musí být AŽ ZA navigationPlugin — patchuje kolekce, které přidal.
  // Pluginy se skládají sekvenčně (payload/dist/config/build.js) a řadí se
  // podle `plugin.order ?? 0`; navigationPlugin `order` nemá, takže o pořadí
  // rozhoduje pozice v tomhle poli.
  navigationOverrides(),
  /**
   * Ochrana proti spamu na `form-submissions` (kolekce je veřejně
   * zapisovatelná). Musí být AŽ ZA formBuilderPlugin — čte `custom.recaptcha`
   * z kolekcí, které v tu chvíli už musí v configu být.
   *
   * Plugin hlídá **jen operace přes REST** (`payloadAPI === 'REST'`, viz
   * `payload-recaptcha-v3/dist/hookBuilder.js`), takže pokrývá blok Formulář,
   * ale ne server action landing kontaktu nad local API. Tu ověřuje
   * `verifyRecaptchaToken` (`@/utilities/recaptcha/verify`).
   */
  reCAPTCHAv3({
    secret: process.env.RECAPTCHA_SECRET ?? '',
    scoreThreshold: RECAPTCHA_SCORE_THRESHOLD,
    skip: ({ req }) =>
      // Admin panel jde taky přes REST — bez tohohle by přihlášený správce
      // nemohl s odeslanými formuláři pracovat.
      Boolean(req.user) ||
      // Dev a CI běží bez účtu u Googlu; v produkci se naopak bez secretu
      // odesílání odmítne (`secret: ''` neprojde u siteverify).
      (!process.env.RECAPTCHA_SECRET && process.env.NODE_ENV !== 'production'),
    errorHandler: () => {
      // FormBlock zobrazuje `res.errors[0].message`, proto česky.
      throw new APIError('Nepodařilo se ověřit, že nejste robot. Zkuste to prosím znovu.', 403)
    },
  }),
  /**
   * Auditní log. Musí být POSLEDNÍ — plugin navěšuje hooky na kolekce,
   * které v `config.collections` už existují, takže by jinak minul
   * `redirects`, `forms` i `navigation-*` přidané pluginy nad ním.
   */
  auditor(),
]
