'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'
import { RECAPTCHA_ACTIONS } from '@/utilities/recaptcha/config'
import { useRecaptcha } from '@/utilities/recaptcha/useRecaptcha'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: DefaultTypedEditorState
}

export const FormBlock: React.FC<
  {
    id?: string
    /**
     * Úvodní text a potvrzovací zpráva přicházejí **hotové ze serveru**
     * (viz `./Server.tsx`), ne jako lexical data k vykreslení.
     *
     * Dřív si je tahle komponenta renderovala sama přes `RichText`. Protože
     * je klientská, stáhla tím `@payloadcms/richtext-lexical/react` (plus
     * `MediaBlock` a `CodeBlock`) do klientského bundlu **každé CMS
     * stránky** — ~32 kB gzip za text, který se nikdy nemění.
     * Serverem vyrenderovaný strom jde do klientské komponenty předat jako
     * `ReactNode` a Lexical zůstane na serveru.
     */
    intro?: React.ReactNode
    confirmation?: React.ReactNode
  } & FormBlockType
> = (props) => {
  const {
    confirmation,
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationType, redirect, submitButtonLabel } = {},
    intro,
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()
  const { execute: executeRecaptcha } = useRecaptcha()

  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        setError(undefined)

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

        // delay loading indicator by 1s
        loadingTimerID = setTimeout(() => {
          setIsLoading(true)
        }, 1000)

        try {
          // Ochrana proti spamu — token ověřuje plugin `payload-recaptcha-v3`
          // v `beforeOperation` na kolekci `form-submissions`. Bez site key
          // (lokální dev) je token `null` a hlavička se neposílá.
          const recaptchaToken = await executeRecaptcha(RECAPTCHA_ACTIONS.formSubmission)

          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
              ...(recaptchaToken ? { 'x-recaptcha-v3': recaptchaToken } : {}),
            },
            method: 'POST',
          })

          const res = await req.json()

          clearTimeout(loadingTimerID)

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message: res.errors?.[0]?.message || 'Internal Server Error',
              status: res.status,
            })

            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          if (confirmationType === 'redirect' && redirect) {
            const { url } = redirect

            const redirectUrl = url

            if (redirectUrl) router.push(redirectUrl)
          }
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({
            message: 'Something went wrong.',
          })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType, executeRecaptcha],
  )

  return (
    <div className="container lg:max-w-[48rem]">
      {enableIntro && intro && !hasSubmitted && intro}
      <div className="p-4 lg:p-6 border border-border rounded-field">
        <FormProvider {...formMethods}>
          {!isLoading && hasSubmitted && confirmationType === 'message' && confirmation}
          {isLoading && !hasSubmitted && <p>Loading, please wait...</p>}
          {error && <div>{`${error.status || '500'}: ${error.message || ''}`}</div>}
          {/* Mobilní tap targety: vendorované shadcn primitivy mají `h-9`
              (36px) a submit `h-10` (40px). Výška se zvedá na 44px jen pod
              `md`, od tabletu výš zůstává původní kompaktní vzhled. Řeší se
              tady jednou přes `data-slot`, ne v osmi souborech polí. */}
          {!hasSubmitted && (
            <form
              className="[&_[data-slot=input]]:h-11 [&_[data-slot=select-trigger]]:h-11 md:[&_[data-slot=input]]:h-9 md:[&_[data-slot=select-trigger]]:h-9"
              id={formID}
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="mb-4 last:mb-0">
                {formFromProps &&
                  formFromProps.fields &&
                  formFromProps.fields?.map((field, index) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
                    if (Field) {
                      return (
                        <div className="mb-6 last:mb-0" key={index}>
                          <Field
                            form={formFromProps}
                            {...field}
                            {...formMethods}
                            control={control}
                            errors={errors}
                            register={register}
                          />
                        </div>
                      )
                    }
                    return null
                  })}
              </div>

              <Button
                className="h-11 w-full md:h-10 md:w-auto"
                form={formID}
                type="submit"
                variant="default"
              >
                {submitButtonLabel}
              </Button>
            </form>
          )}
        </FormProvider>
      </div>
    </div>
  )
}
