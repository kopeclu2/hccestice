'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, LoaderCircle } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RECAPTCHA_ACTIONS } from '@/utilities/recaptcha/config'
import { useRecaptcha } from '@/utilities/recaptcha/useRecaptcha'
import { cn } from '@/utilities/ui'

import { CardTitle } from '../../components/Heading'
import { PillButton } from '../../components/PillButton'

import { sendContactMessage } from './action'
import { contactSchema, type ContactValues } from './schema'

/** Vzhled polí na tmavém panelu (přepis shadcn defaultů pro dark kartu). */
const darkFieldClasses =
  'rounded-field border-white/18 bg-white/8 text-white placeholder:text-white/40 focus-visible:ring-lime/60 min-h-11.5 px-4'

/**
 * Kontaktní formulář (tmavá karta „Poslat zprávu").
 *
 * react-hook-form + zod (`contactSchema`); téma zprávy se vybírá
 * pill přepínači (nabídka `topics` přichází z landing globalu).
 * Odesílá server action `sendContactMessage`, která zprávu uloží
 * jako form-submission do Payload.
 */
export function ContactForm({ topics }: { topics: string[] }) {
  const [status, setStatus] = React.useState<'idle' | 'sent' | 'error'>('idle')
  const [serverError, setServerError] = React.useState<string | null>(null)
  const { execute: executeRecaptcha } = useRecaptcha()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', topic: topics[0] ?? '', message: '' },
  })

  const selectedTopic = watch('topic')

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    const recaptchaToken = await executeRecaptcha(RECAPTCHA_ACTIONS.contact)
    const result = await sendContactMessage(values, recaptchaToken)
    if (result.ok) {
      setStatus('sent')
    } else {
      setStatus('error')
      setServerError(result.error)
    }
  })

  if (status === 'sent') {
    return (
      <div className="rounded-panel bg-contrast relative mx-auto mt-10 max-w-170 p-8.5 text-left text-on-contrast">
        <div className="bg-lime text-ink mb-4 grid size-11 place-items-center rounded-full [&_svg]:size-5">
          <Check strokeWidth={3} />
        </div>
        <CardTitle size="xs">Díky za zprávu!</CardTitle>
        <p className="mt-2 text-meta text-white/70">
          Ozveme se co nejdřív — obvykle do pár dní. Když to spěchá, zavolejte komukoli ze sekce
          Lidé v klubu.
        </p>
      </div>
    )
  }

  return (
    <form
      className="rounded-panel bg-contrast relative mx-auto mt-10 max-w-170 p-4.5 text-left text-on-contrast md:p-6.5 lg:p-8.5"
      noValidate
      onSubmit={onSubmit}
    >
      <CardTitle className="mb-4.5" size="xs">
        Poslat zprávu
      </CardTitle>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(11.25rem,100%),1fr))] gap-3.5">
        <Field error={errors.name?.message} id="contact-name" label="Jméno">
          <Input
            autoComplete="name"
            className={darkFieldClasses}
            id="contact-name"
            placeholder="Jan Novák"
            type="text"
            {...register('name')}
          />
        </Field>
        <Field error={errors.email?.message} id="contact-email" label="E-mail">
          <Input
            autoComplete="email"
            className={darkFieldClasses}
            id="contact-email"
            placeholder="jan@email.cz"
            type="email"
            {...register('email')}
          />
        </Field>
      </div>

      <fieldset className="mt-4">
        <legend className="mb-1.5 text-caption font-semibold text-white/55">Čeho se to týká</legend>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => {
            const isSelected = selectedTopic === topic
            return (
              <PillButton
                aria-pressed={isSelected}
                className={cn(
                  isSelected && 'border-lime bg-lime text-ink hover:bg-lime hover:text-ink',
                )}
                key={topic}
                onClick={() => setValue('topic', topic, { shouldValidate: true })}
                size="sm"
                variant="inverse"
              >
                {topic}
              </PillButton>
            )
          })}
        </div>
      </fieldset>

      <Field className="mt-4" error={errors.message?.message} id="contact-message" label="Zpráva">
        <Textarea
          className={cn(darkFieldClasses, 'min-h-30 rounded-badge py-3.5')}
          id="contact-message"
          placeholder="Dobrý den, rád bych…"
          {...register('message')}
        />
      </Field>

      {serverError && <p className="mt-3 text-meta font-semibold text-danger-soft">{serverError}</p>}

      <PillButton
        arrowIcon={isSubmitting ? <LoaderCircle className="animate-spin" /> : undefined}
        disabled={isSubmitting}
        size="lg"
        type="submit"
        variant="lime"
        withArrow
      >
        {isSubmitting ? 'Odesílám…' : 'Odeslat zprávu'}
      </PillButton>
    </form>
  )
}

/** Popisek + pole + chybová hláška (jednotný rytmus formuláře). */
function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 text-caption font-semibold text-white/55" htmlFor={id}>
        {label}
      </Label>
      {children}
      {error && (
        <p className="mt-1.5 text-caption font-semibold text-danger-soft" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
