import type { Photo } from '@/landing/types'

/** View-modely sponzorů. */

/** Sponzor z CMS — marquee pás na homepage i řádková karta na /sponzori. */
export type Sponsor = {
  id: number
  name: string
  url: string | null
  logo: Photo | null
  /** Kontaktní osoba — jen u partnerů, kde ji klub eviduje. */
  person: string | null
  address: string | null
  phone: string | null
  email: string | null
}
