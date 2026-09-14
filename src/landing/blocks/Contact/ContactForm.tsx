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

import { GlowCircle } from '../../components/Decorations'
import { CardTitle } from '../../components/Heading'
import { Eyebrow } from '../../components/Kicker'
import { PillButton } from '../../components/PillButton'

import { sendContactMessage } from './action'
import { contactSchema, type ContactValues } from './schema'

/** Vzhled polí podle tónu karty (přepis shadcn defaultů). */
const fieldClasses = {
  dark: 'rounded-field border-white/18 bg-white/8 text-white placeholder:text-white/40 focus-visible:ring-lime/60 min-h-11.5 px-4',
  light:
    'rounded-field border-line bg-chip text-ink placeholder:text-faint focus-visible:ring-lime/60 min-h-11.5 px-4',
} as const

const labelClasses = { dark: 'text-white/55', light: 'text-ink-soft' } as const

/**
 * Kontaktní formulář — „Poslat zprávu". `tone="dark"` (výchozí) je tmavá
 * karta na homepage; `tone="light"` je bílá varianta pro `/kontakt`, kde
 * formulář stojí samostatně pod dvojicí bílých karet, ne uvnitř tmavého
 * panelu. Rozměry i rozestupy jsou u obou tónů stejné — mění se jen barvy —
 * aby placeholder v `ContactFormLazy` (měřený na tmavé variantě) seděl i tady.
 *
 * react-hook-form + zod (`contactSchema`); téma zprávy se vybírá
 * pill přepínači (nabídka `topics` přichází z landing globalu).
 * Odesílá server action `sendContactMessage`, která zprávu uloží
 * jako form-submission do Payload.
 */
export function ContactForm({
  topics,
  tone = 'dark',
}: {
  topics: string[]
  tone?: 'dark' | 'light'
}) {
  const [status, setStatus] = React.useState<'idle' | 'sent' | 'error'>('idle')
  const [serverError, setServerError] = React.useState<string | null>(null)
  const { execute: executeRecaptcha } = useRecaptcha()
  const fieldClass = fieldClasses[tone]
  const labelClass = labelClasses[tone]
  const errorClass = tone === 'dark' ? 'text-danger-soft' : 'text-danger'

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
      /* Tři stupně odsazení zrcadlí formulář níž — panel po odeslání stojí na
         stejném místě, takže s pevným `p-8.5` si na tabletu bral okraje o dva
         stupně větší než karta, kterou nahradil. */
      <div
        className={cn(
          'rounded-panel relative mx-auto mt-10 max-w-170 p-4.5 text-left md:p-6.5 lg:p-8.5',
          tone === 'dark'
            ? 'bg-contrast text-on-contrast'
            : /* `z-0`, ne jen `relative`: bez vlastního z-indexu karta nezaloží
                 stacking context, takže `-z-1` uvnitř `GlowCircle` propadne až
                 za tuhle kartu v kontextu nadřazeného `SectionShellu` (`z-1`)
                 a její neprůhledné bílé pozadí kruh úplně zakryje. */
              'border-line-soft bg-surface text-ink z-0 overflow-hidden border',
        )}
      >
        {tone === 'light' && <GlowCircle className="-top-20 -right-20 size-60" tone="lime" />}
        <div className="bg-lime text-ink relative mb-4 grid size-11 place-items-center rounded-full [&_svg]:size-5">
          <Check strokeWidth={3} />
        </div>
        <CardTitle className="relative" size="xs">
          Díky za zprávu!
        </CardTitle>
        <p
          className={cn('relative mt-2 text-meta', tone === 'dark' ? 'text-white/70' : 'text-dim')}
        >
          Ozveme se co nejdřív — obvykle do pár dní. Když to spěchá, zavolejte komukoli ze sekce
          Lidé v klubu.
        </p>
      </div>
    )
  }

  return (
    <form
      className={cn(
        'rounded-panel relative mx-auto mt-10 max-w-170 p-4.5 text-left md:p-6.5 lg:p-8.5',
        tone === 'dark'
          ? 'bg-contrast text-on-contrast'
          : 'border-line-soft bg-surface text-ink z-0 overflow-hidden border',
      )}
      noValidate
      onSubmit={onSubmit}
    >
      {tone === 'light' && <GlowCircle className="-top-20 -right-20 size-60" tone="lime" />}

      {tone === 'light' && (
        <Eyebrow className="relative mb-2 block" tone="club">
          Nebo přes formulář
        </Eyebrow>
      )}
      <CardTitle className="relative mb-4.5" size="xs">
        Poslat zprávu
      </CardTitle>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(11.25rem,100%),1fr))] gap-3.5">
        <Field error={errors.name?.message} id="contact-name" label="Jméno" tone={tone}>
          <Input
            autoComplete="name"
            className={fieldClass}
            id="contact-name"
            placeholder="Jan Novák"
            type="text"
            {...register('name')}
          />
        </Field>
        <Field error={errors.email?.message} id="contact-email" label="E-mail" tone={tone}>
          <Input
            autoComplete="email"
            className={fieldClass}
            id="contact-email"
            placeholder="jan@email.cz"
            type="email"
            {...register('email')}
          />
        </Field>
      </div>

      <fieldset className="mt-4">
        <legend className={cn('mb-1.5 text-caption font-semibold', labelClass)}>
          Čeho se to týká
        </legend>
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
                variant={tone === 'dark' ? 'inverse' : 'outline'}
              >
                {topic}
              </PillButton>
            )
          })}
        </div>
      </fieldset>

      <Field
        className="mt-4"
        error={errors.message?.message}
        id="contact-message"
        label="Zpráva"
        tone={tone}
      >
        <Textarea
          className={cn(fieldClass, 'min-h-30 rounded-badge py-3.5')}
          id="contact-message"
          placeholder="Dobrý den, rád bych…"
          {...register('message')}
        />
      </Field>

      {serverError && (
        <p className={cn('mt-3 text-meta font-semibold', errorClass)}>{serverError}</p>
      )}

      <PillButton
        arrowIcon={isSubmitting ? <LoaderCircle className="animate-spin" /> : undefined}
        /* Bez odsazení se tlačítko lepilo na textarea (~4px) — o stupeň víc
           než rytmus polí (16px), aby se odsadilo od bloku formuláře. */
        className="mt-5"
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
  tone,
  children,
}: {
  id: string
  label: string
  error?: string
  className?: string
  tone: 'dark' | 'light'
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <Label className={cn('mb-1.5 text-caption font-semibold', labelClasses[tone])} htmlFor={id}>
        {label}
      </Label>
      {children}
      {error && (
        <p
          className={cn(
            'mt-1.5 text-caption font-semibold',
            tone === 'dark' ? 'text-danger-soft' : 'text-danger',
          )}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
