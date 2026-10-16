'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { type VariantProps, cva } from 'class-variance-authority'
import { Check, LoaderCircle } from 'lucide-react'
import React from 'react'
import {
  type Control,
  Controller,
  type ControllerRenderProps,
  useForm,
  useWatch,
} from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { sendContactMessage } from '@/landing/features/contact/action'
import { contactSchema, type ContactValues } from '@/landing/features/contact/schema'
import { GlowCircle } from '@/landing/ui/Decorations'
import { CardTitle } from '@/landing/ui/Heading'
import { Eyebrow } from '@/landing/ui/Kicker'
import { RECAPTCHA_ACTIONS } from '@/lib/recaptcha/config'
import { useRecaptcha } from '@/lib/recaptcha/useRecaptcha'
import { cn } from '@/lib/utils'

/*
 * Vzhled podle tónu karty. `dark` je tmavá karta na homepage, `light` bílá
 * na `/kontakt`; mění se jen barvy, rozměry jsou společné (placeholder
 * v `ContactFormLazy` je měřený na jedné variantě).
 */
const contactCard = cva(
  'relative mx-auto mt-10 max-w-170 rounded-panel p-4.5 text-left md:p-6.5 lg:p-8.5',
  {
    variants: {
      tone: {
        dark: 'bg-contrast text-on-contrast',
        /* `z-0`, ne jen `relative`: bez vlastního z-indexu karta nezaloží
           stacking context, takže `-z-1` uvnitř `GlowCircle` propadne až
           za tuhle kartu v kontextu nadřazeného `SectionShellu` (`z-1`)
           a její neprůhledné bílé pozadí kruh úplně zakryje. */
        light: 'z-0 overflow-hidden border border-line-soft bg-surface text-ink',
      },
    },
    defaultVariants: { tone: 'dark' },
  },
)

/** Vstupní pole a textarea (přepis shadcn defaultů). */
const field = cva('min-h-11.5 rounded-field px-4 focus-visible:ring-lime/60', {
  variants: {
    tone: {
      dark: 'border-on-contrast-glass bg-on-contrast-wash text-on-contrast placeholder:text-on-contrast-ghost',
      light: 'border-line bg-chip text-ink placeholder:text-faint',
    },
  },
  defaultVariants: { tone: 'dark' },
})

/** Popisek pole a legenda přepínače tématu. */
const fieldLabel = cva('text-xs font-medium', {
  variants: {
    tone: { dark: 'text-on-contrast-subtle', light: 'text-ink-soft' },
  },
  defaultVariants: { tone: 'dark' },
})

/** Chyba pole i chyba odeslání ze serveru. */
const fieldError = cva('text-xs font-medium', {
  variants: {
    tone: { dark: 'text-danger-soft', light: 'text-danger' },
  },
  defaultVariants: { tone: 'dark' },
})

/** Odstavec v potvrzení po odeslání. */
const cardNote = cva('relative mt-2 text-sm', {
  variants: {
    tone: { dark: 'text-on-contrast-muted', light: 'text-dim' },
  },
  defaultVariants: { tone: 'dark' },
})

type Tone = NonNullable<VariantProps<typeof contactCard>['tone']>

/** Tlačítka témat: na tmavé kartě obrys pro tmavé plochy, na bílé běžný obrys. */
const TOPIC_VARIANT = { dark: 'inverse', light: 'outline' } as const

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
export function ContactForm({ topics, tone = 'dark' }: { topics: string[]; tone?: Tone }) {
  const [status, setStatus] = React.useState<'idle' | 'sent' | 'error'>('idle')
  const [serverError, setServerError] = React.useState<string | null>(null)
  const { execute: executeRecaptcha } = useRecaptcha()

  const {
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', topic: topics[0] ?? '', message: '' },
  })

  // `useWatch` místo `watch()`: ten se nedá bezpečně memoizovat, takže ho
  // React Compiler u komponenty přeskakoval.
  const selectedTopic = useWatch({ control, name: 'topic' })

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

  /*
   * `role="status" aria-live="polite"` na trvalém obalu, ne na jednotlivých
   * variantách — přepnutí formuláře na potvrzení jinak proběhne tiše.
   * Čtečka oznámí novou variantu jen tehdy, když samotný region (tenhle
   * `div`) v DOM zůstane a měnil se jen jeho obsah, ne když se region
   * sám nahradí jiným elementem.
   */
  return (
    <div role="status">
      {status === 'sent' ? (
        /* Tři stupně odsazení zrcadlí formulář níž — panel po odeslání stojí
           na stejném místě, takže s pevným `p-8.5` si na tabletu bral okraje
           o dva stupně větší než karta, kterou nahradil. */
        <div className={contactCard({ tone })}>
          {tone === 'light' && <GlowCircle className="-top-20 -right-20 size-60" tone="lime" />}
          <div className="relative mb-4 grid size-11 place-items-center rounded-full bg-lime text-ink [&_svg]:size-5">
            <Check strokeWidth={3} />
          </div>
          <CardTitle className="relative" size="xs">
            Díky za zprávu!
          </CardTitle>
          <p className={cardNote({ tone })}>
            Ozveme se co nejdřív — obvykle do pár dní. Když to spěchá, zavolejte komukoli ze sekce
            Lidé v klubu.
          </p>
        </div>
      ) : (
        <form className={contactCard({ tone })} noValidate onSubmit={onSubmit}>
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
            <ContactField control={control} id="contact-name" label="Jméno" name="name" tone={tone}>
              {(controlProps) => (
                <Input
                  {...controlProps}
                  autoComplete="name"
                  className={field({ tone })}
                  placeholder="Jan Novák"
                  type="text"
                />
              )}
            </ContactField>
            <ContactField
              control={control}
              id="contact-email"
              label="E-mail"
              name="email"
              tone={tone}
            >
              {(controlProps) => (
                <Input
                  {...controlProps}
                  autoComplete="email"
                  className={field({ tone })}
                  placeholder="jan@email.cz"
                  type="email"
                />
              )}
            </ContactField>
          </div>

          <fieldset className="mt-4">
            <legend className={cn('mb-1.5', fieldLabel({ tone }))}>Čeho se to týká</legend>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => {
                const isSelected = selectedTopic === topic
                return (
                  <Button
                    aria-pressed={isSelected}
                    className={cn(
                      isSelected && 'border-lime bg-lime text-ink hover:bg-lime hover:text-ink',
                    )}
                    key={topic}
                    onClick={() => setValue('topic', topic, { shouldValidate: true })}
                    size="sm"
                    variant={TOPIC_VARIANT[tone]}
                  >
                    {topic}
                  </Button>
                )
              })}
            </div>
          </fieldset>

          <ContactField
            className="mt-4"
            control={control}
            id="contact-message"
            label="Zpráva"
            name="message"
            tone={tone}
          >
            {(controlProps) => (
              <Textarea
                {...controlProps}
                className={cn(field({ tone }), 'min-h-30 rounded-badge py-3.5')}
                placeholder="Dobrý den, rád bych…"
              />
            )}
          </ContactField>

          {serverError && (
            <p className={cn('mt-3 text-sm', fieldError({ tone }))} role="alert">
              {serverError}
            </p>
          )}

          <Button
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
          </Button>
        </form>
      )}
    </div>
  )
}

type ControlProps = ControllerRenderProps<ContactValues, keyof ContactValues> & {
  id: string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

/**
 * Popisek + pole + chybová hláška (jednotný rytmus formuláře) nad shadcn
 * `Field` a react-hook-form `Controller` — doporučený vzor shadcn pro RHF.
 *
 * Trojici `aria-invalid` / `aria-describedby` / chybová hláška (`id`
 * `<id>-error`, `role="alert"`) skládá tahle komponenta na jednom místě a
 * předává ji ovládacímu prvku jako `controlProps`, takže ji nikdo
 * z volajících nemůže zapomenout ani rozpojit. `Field` (`data-invalid`)
 * nese stav neplatného pole.
 *
 * Všechna pole formuláře jsou povinná (`contactSchema`), proto hvězdička
 * u popisku bez vlastního propu.
 *
 * `Field` je tu `block` a popisek `inline`, ne výchozí flex sloupec shadcn:
 * řádek s inline popiskem měl vždy výšku 24 px (řádek okolního textu) a
 * ve flex sloupci by popisek byl blok s vlastní výškou 16 px. Formulář by
 * povyrostl o pár pixelů a placeholder v `ContactFormLazy` (měřený na výšku)
 * by přestal sedět — vznikl by posun obsahu (CLS).
 */
function ContactField({
  className,
  children,
  control,
  id,
  label,
  name,
  tone,
}: {
  className?: string
  children: (controlProps: ControlProps) => React.ReactNode
  control: Control<ContactValues>
  id: string
  label: string
  name: keyof ContactValues
  tone: Tone
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: controlField, fieldState }) => {
        const errorId = `${id}-error`
        return (
          <Field className={cn('block', className)} data-invalid={fieldState.invalid}>
            <FieldLabel className={cn(fieldLabel({ tone }), 'inline leading-none')} htmlFor={id}>
              {label} <span aria-hidden="true">*</span>
            </FieldLabel>
            {children({
              ...controlField,
              id,
              'aria-invalid': fieldState.invalid,
              'aria-describedby': fieldState.invalid ? errorId : undefined,
            })}
            {fieldState.invalid && (
              <FieldError
                className={cn('mt-1.5', fieldError({ tone }))}
                errors={[fieldState.error]}
                id={errorId}
              />
            )}
          </Field>
        )
      }}
    />
  )
}
