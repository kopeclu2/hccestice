import {
  ARENA_ADDRESS,
  ARENA_NAME,
  CLUB_ADDRESS,
  CLUB_ALTERNATE_NAME,
  CLUB_FOUNDING_YEAR,
  CLUB_ICO,
  CLUB_LEGAL_NAME,
  CLUB_NAME,
  LEAGUE_NAME,
} from './club'
import { routes } from './routes'

/**
 * Skládání `llms.txt` z hotových dat — čisté funkce bez I/O, aby šly testovat
 * bez Payloadu (`src/app/llms.txt/route.ts` je jen naplní z databáze).
 *
 * Konvence llmstxt.org: H1 s názvem, citace se shrnutím, pak sekce odkazů.
 * Shrnutí je záměrně na začátku — model, který přečte jen prvních pár řádků,
 * má vědět, kdo klub je, kde hraje a jak ho zastihnout.
 */

/** Odkaz s popisem; `note` je volitelná jednořádková poznámka za dvojtečkou. */
export type LlmsLink = { path: string; title: string; note?: string | null }

export type LlmsInput = {
  siteUrl: string
  /** Kontaktní e-mail z `siteConfig`. */
  email: string
  pages: LlmsLink[]
  /** Nejnovější články; hotový výběr a pořadí, strop si hlídá volající. */
  posts: LlmsLink[]
  galleries: LlmsLink[]
  /** Naposledy odehrané zápasy (nejnovější první). */
  results: LlmsLink[]
  /** Nejbližší naplánované zápasy (nejbližší první). */
  fixtures: LlmsLink[]
}

/** Zdroj oficiálních výsledků a tabulky soutěže. */
export const LEAGUE_SITE = 'https://www.ahl.cz'

const line = (siteUrl: string, { path, title, note }: LlmsLink): string =>
  `- [${title}](${siteUrl}${path})${note ? `: ${note}` : ''}`

/**
 * Úvodní blok. Všechna fakta jsou z `lib/club.ts` (a tedy tatáž jako ve
 * strukturovaných datech a patičce); nic se tu nepíše ručně.
 */
export const clubSummary = (email: string): string[] => [
  `> ${CLUB_NAME} je hokejový oddíl spolku ${CLUB_ALTERNATE_NAME}, založený v roce ${CLUB_FOUNDING_YEAR}. ` +
    `Muži hrají soutěž ${LEAGUE_NAME} (VČHL). Domácí zápasy se hrají na hale ${ARENA_NAME}, ` +
    `${ARENA_ADDRESS.streetAddress}, ${ARENA_ADDRESS.postalCode} ${ARENA_ADDRESS.addressLocality}. ` +
    `Web obsahuje zápasy a výsledky, soupisku, aktuality, fotogalerie, historii klubu, sponzory a rozpis tréninků.`,
  '',
  `- Spolek: ${CLUB_LEGAL_NAME}, ${CLUB_ADDRESS.streetAddress}, ${CLUB_ADDRESS.postalCode} ${CLUB_ADDRESS.addressLocality}, IČO ${CLUB_ICO}`,
  `- Kontakt: ${email}`,
  `- Oficiální výsledky a tabulka soutěže: ${LEAGUE_SITE}`,
  '',
]

export function buildLlmsTxt({
  siteUrl,
  email,
  pages,
  posts,
  galleries,
  results,
  fixtures,
}: LlmsInput): string {
  const lines = [`# ${CLUB_NAME}`, '', ...clubSummary(email)]
  const link = (item: LlmsLink) => line(siteUrl, item)

  // Ručně psané Next stránky nejsou dokumenty v CMS, takže je žádný dotaz
  // nevrátí — a přitom jsou to nejnavštěvovanější sekce webu.
  lines.push(
    '## Sekce webu',
    '',
    link({
      path: routes.list.matches,
      title: 'Zápasy',
      note: 'rozpis a výsledky zápasů aktuální sezóny',
    }),
    link({ path: '/soupiska', title: 'Soupiska', note: 'hráči a realizační tým' }),
    link({ path: routes.list.posts, title: 'Aktuality', note: 'výpis všech článků' }),
    link({
      path: routes.list.galleries,
      title: 'Fotogalerie',
      note: 'fotky ze zápasů a akcí klubu',
    }),
    link({ path: '/historie-klubu', title: 'Historie klubu', note: 'milníky a lidé klubu' }),
    link({ path: '/sponzori', title: 'Sponzoři', note: 'partneři klubu' }),
    link({ path: '/treninky', title: 'Tréninky', note: 'rozpis ledových hodin' }),
    link({ path: routes.contact, title: 'Kontakt', note: 'e-mail, adresa a kontaktní formulář' }),
    '',
  )

  if (fixtures.length) {
    lines.push('## Nejbližší zápasy', '', ...fixtures.map(link), '')
  }

  if (results.length) {
    lines.push(
      '## Poslední výsledky',
      '',
      'Skóre je z pohledu HC Čestice (naše branky : branky soupeře).',
      '',
      ...results.map(link),
      '',
    )
  }

  if (pages.length) {
    lines.push('## Další stránky', '', ...pages.map(link), '')
  }

  if (posts.length) {
    lines.push(
      '## Aktuality',
      '',
      `Posledních ${posts.length} článků s popisem; celý archiv je na ${siteUrl}${routes.list.posts}.`,
      '',
      ...posts.map(link),
      '',
    )
  }

  if (galleries.length) {
    lines.push(
      '## Fotoalba',
      '',
      `Nejnovějších ${galleries.length} alb; všechna jsou na ${siteUrl}${routes.list.galleries}.`,
      '',
      ...galleries.map(link),
      '',
    )
  }

  return lines.join('\n')
}
