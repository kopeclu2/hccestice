/**
 * Identita klubu — jediný zdroj pro jméno, logo a předpony názvů.
 *
 * Bez importů a bez serverových závislostí: používá to frontend, e-maily,
 * synchronizace VČHL i admin (klient).
 */

/** Název klubu, jak se píše v titulcích, e-mailech a v zápasech. */
export const CLUB_NAME = 'HC Čestice'

/**
 * Druhé jméno klubu — název spolku bez právní formy („TJ Sokol Čestice").
 * V patičce, titulcích a v JSON-LD (`alternateName`) se píše vždy takhle.
 */
export const CLUB_ALTERNATE_NAME = 'TJ Sokol Čestice'

/** Rok založení oddílu ledního hokeje při TJ Sokol (první milník `/historie-klubu`). */
export const CLUB_FOUNDING_YEAR = '1954'

/**
 * Poštovní adresa spolku — jediný zdroj pro JSON-LD. Hodnotu (zvlášť
 * `addressLocality`) měnit jen po potvrzení klubem, na webu i v rejstříku
 * musí být tatáž.
 */
export const CLUB_ADDRESS = {
  streetAddress: 'Čestice 112',
  addressLocality: 'Kostelec nad Orlicí',
  addressRegion: 'Královéhradecký kraj',
  postalCode: '517 41',
  addressCountry: 'CZ',
} as const

/** Soutěž, ve které klub hraje (pořadatel zápasů, `memberOf`). */
export const LEAGUE_NAME = 'Východočeská hokejová liga'

/** Název webu — v titulku stránky za svislítkem (`brandTitle`). Dnes shodný s klubem. */
export const SITE_NAME = CLUB_NAME

/** Logo klubu jako cesta v `public/` (absolutní URL si skládá volající). */
export const CLUB_LOGO = '/logo-cestice.png'

/**
 * Předpony názvů klubů, které o týmu nic neříkají („HC Zdar", „SK Žamberk").
 * Velkými písmeny; porovnává se bez ohledu na velikost (`teamName.ts`).
 *
 * Sjednocená sada ze tří dřívějších seznamů: monogram na tabuli měl šest,
 * hlavičky detailu osm a párování soupeřů v synchronizaci pět předpon.
 */
export const CLUB_PREFIXES = ['HC', 'HK', 'SK', 'TJ', 'HHK', 'ZH', 'HCM', 'SKP'] as const

/**
 * Domácí hala — jediný zdroj jména a adresy pro strukturovaná data (JSON-LD).
 *
 * V CMS i v textech se tatáž hala píše třikrát jinak („Zimní stadion Rychnov
 * nad Kněžnou", „ZS Rychnov nad Kněžnou", „Rychnov n. K."), ve schema.org je
 * ale jedna entita — zbylé podoby jen rozpoznává `resolveVenue`
 * (`matches/view/matchSchema.ts`).
 */
export const ARENA_NAME = 'Zimní stadion Rychnov nad Kněžnou'

export const ARENA_ADDRESS = {
  streetAddress: 'Javornická 1648',
  addressLocality: 'Rychnov nad Kněžnou',
  postalCode: '516 01',
  addressCountry: 'CZ',
} as const

/**
 * Průměrná délka zápasu pro `endDate` události. AHL konec zápasu nezná;
 * 3 × 20 min čistého času + přestávky a rozbruslení vychází na ~2,5 h.
 * Je to odhad — vždy se počítá od začátku, nikdy od „teď".
 */
export const MATCH_DURATION_MINUTES = 150
