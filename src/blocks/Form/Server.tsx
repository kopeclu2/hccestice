import React from 'react'

import RichText from '@/components/RichText'

import type { FormBlockType } from './Component'
import { FormBlockLazy } from './FormBlockLazy'

/**
 * Serverový obal formulářového bloku.
 *
 * Vykreslí rich-text části (úvod a potvrzovací zprávu) **na serveru** a
 * pošle je do klientského `FormBlock` jako hotové `ReactNode`.
 *
 * Bez tohohle mezikroku si je renderoval sám `FormBlock`, který je
 * `'use client'` — a stahoval tím `@payloadcms/richtext-lexical/react`
 * (~32 kB gzip) do klientského bundlu každé CMS stránky. Lexical přitom
 * jen převádí neměnná data na HTML; na klientu nemá co dělat.
 *
 * Cena je pár set bajtů v RSC payloadu navíc: potvrzovací zpráva se
 * vyrenderuje i pro návštěvníka, který formulář nikdy neodešle. Proti
 * 32 kB JavaScriptu je to výhodná výměna.
 */
export const FormBlockServer: React.FC<{ id?: string } & FormBlockType> = (props) => {
  const { enableIntro, form, introContent } = props

  return (
    <FormBlockLazy
      {...props}
      confirmation={
        form?.confirmationMessage ? <RichText data={form.confirmationMessage} /> : null
      }
      intro={
        enableIntro && introContent ? (
          <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
        ) : null
      }
    />
  )
}
