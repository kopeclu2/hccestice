import { z } from 'zod'

/**
 * Validace kontaktního formuláře — sdílená mezi klientem
 * (react-hook-form + zodResolver) a server action (`sendContactMessage`).
 *
 * Téma je volný string — nabídka témat se spravuje v adminu
 * (global Landing page → Kontakt → Témata formuláře).
 */
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Vyplňte prosím jméno.').max(120, 'Jméno je příliš dlouhé.'),
  email: z.email('Zadejte platný e-mail.'),
  topic: z.string().trim().min(1, 'Vyberte, čeho se zpráva týká.').max(60),
  message: z
    .string()
    .trim()
    .min(10, 'Napište nám prosím pár slov (alespoň 10 znaků).')
    .max(5000, 'Zpráva je příliš dlouhá.'),
})

export type ContactValues = z.infer<typeof contactSchema>

/** Výsledek server action — buď úspěch, nebo chyby po polích. */
export type ContactResult =
  | { ok: true }
  | { ok: false; error: string }
