import {
  ARENA_ADDRESS,
  ARENA_GEO,
  ARENA_NAME,
  CLUB_ADDRESS,
  CLUB_ALTERNATE_NAME,
  CLUB_FOUNDING_YEAR,
  CLUB_ICO,
  CLUB_LEGAL_NAME,
  CLUB_LOGO,
  CLUB_NAME,
  LEAGUE_NAME,
} from './club'

/**
 * Společné díly strukturovaných dat (schema.org JSON-LD) — identifikátory
 * entit a uzly, které se na webu objevují na víc stránkách.
 *
 * Izomorfní a čisté (žádné `process.env`, žádné `new Date()`): základ adresy
 * (`getServerSideURL()`) předává volající, takže je to snadno testovatelné.
 * Každý výstup se do stránky dostává přes `serializeJsonLd`.
 *
 * Pravidlo `@id`: entita je v rámci **jednoho** dokumentu definovaná jednou
 * a ostatní výskyty jsou odkazy `{ '@id': … }`. Entity klubu mají stabilní
 * `@id` na domovské adrese (`<origin>/#team`), takže se spojí i napříč
 * stránkami, i když je plná definice jen na home.
 */

export const schemaIds = (baseUrl: string) => ({
  team: `${baseUrl}/#team`,
  org: `${baseUrl}/#org`,
  arena: `${baseUrl}/#arena`,
  website: `${baseUrl}/#website`,
})

/** Odkaz na entitu podle `@id`. */
export const idRef = (id: string) => ({ '@id': id })

/**
 * Domácí hala — jediná definice `Place` s `@id`. `StadiumOrArena` je podtyp
 * `Place`, takže projde i jako `SportsEvent.location`.
 */
export const arenaNode = (baseUrl: string) => ({
  '@type': 'StadiumOrArena',
  '@id': schemaIds(baseUrl).arena,
  name: ARENA_NAME,
  address: { '@type': 'PostalAddress', ...ARENA_ADDRESS },
  geo: { '@type': 'GeoCoordinates', ...ARENA_GEO },
})

export type HomeGraphInput = {
  baseUrl: string
  email: string
  /** Profily klubu na sítích — prázdné/`null` se vynechají. */
  sameAs: Array<string | null | undefined>
}

/**
 * Tým HC Čestice (`#team`). `sameAs` jde z administrace (ne natvrdo), aby
 * změna profilu na sítích byla otázkou správce. `address` nese plnou
 * poštovní adresu spolku. `location` je odkaz na halu, ne její kopie.
 */
export const teamNode = ({ baseUrl, email, sameAs }: HomeGraphInput) => {
  const links = sameAs.filter((link): link is string => Boolean(link))
  return {
    '@type': 'SportsTeam',
    '@id': schemaIds(baseUrl).team,
    name: CLUB_NAME,
    alternateName: CLUB_ALTERNATE_NAME,
    sport: 'Ice Hockey',
    foundingDate: CLUB_FOUNDING_YEAR,
    url: baseUrl,
    logo: `${baseUrl}${CLUB_LOGO}`,
    email,
    ...(links.length ? { sameAs: links } : {}),
    address: { '@type': 'PostalAddress', ...CLUB_ADDRESS },
    location: idRef(schemaIds(baseUrl).arena),
    // HC je oddíl spolku TJ Sokol Čestice; právní osobu popisuje `orgNode`.
    parentOrganization: idRef(schemaIds(baseUrl).org),
    // Spádová oblast pro nábor. Sídlo spolku je v Česticích, ale hraje se
    // v Rychnově — bez `areaServed` nemá vyhledávač jak poznat, že klub
    // obsluhuje celý okres a ne jen obec z poštovní adresy.
    areaServed: { '@type': 'AdministrativeArea', name: 'okres Rychnov nad Kněžnou' },
    memberOf: { '@type': 'SportsOrganization', name: LEAGUE_NAME },
  }
}

/**
 * Spolek TJ Sokol Čestice, z.s. (`#org`) — právní osoba, jejímž oddílem je HC.
 * `identifier` je IČO (schema.org pro české IČO vlastní vlastnost nemá,
 * `PropertyValue` je doporučený způsob). Telefon se záměrně neuvádí.
 */
export const orgNode = (baseUrl: string) => ({
  '@type': 'SportsOrganization',
  '@id': schemaIds(baseUrl).org,
  name: CLUB_ALTERNATE_NAME,
  legalName: CLUB_LEGAL_NAME,
  identifier: { '@type': 'PropertyValue', propertyID: 'IČO', value: CLUB_ICO },
  address: { '@type': 'PostalAddress', ...CLUB_ADDRESS },
  subOrganization: idRef(schemaIds(baseUrl).team),
})

/**
 * `WebSite` je bez `potentialAction`/`SearchAction` **záměrně**: web nemá
 * veřejné vyhledávací pole (kolekce `search` je interní index pro
 * `/llms.txt`), takže by šlo o nepravdivá strukturovaná data.
 */
export const websiteNode = (baseUrl: string) => ({
  '@type': 'WebSite',
  '@id': schemaIds(baseUrl).website,
  name: CLUB_NAME,
  url: baseUrl,
  inLanguage: 'cs-CZ',
  publisher: idRef(schemaIds(baseUrl).team),
})

/** Home: jeden `@graph` s entitami klubu, na které se odkazují ostatní stránky. */
export const toHomeGraph = (input: HomeGraphInput) => ({
  '@context': 'https://schema.org',
  '@graph': [
    teamNode(input),
    orgNode(input.baseUrl),
    arenaNode(input.baseUrl),
    websiteNode(input.baseUrl),
  ],
})

export type WebPageKind = 'CollectionPage' | 'AboutPage' | 'ContactPage'

export type WebPageInput = {
  baseUrl: string
  kind: WebPageKind
  /** Cesta stránky bez filtrů a stránkování (`/sponzori`) — shodná s canonical. */
  path: string
  name: string
  description: string
  /** Stránka je o klubu (`about` / u kontaktu `mainEntity`) — ne u čistých výpisů. */
  aboutClub?: boolean
}

/**
 * Typ stránky podstránky: `AboutPage` (historie), `ContactPage` (kontakt),
 * `CollectionPage` (výpisy a přehledy). Jen z toho, co stránka sama říká
 * (název, popis, cesta) — žádné vymyšlené položky. `ContactPage` ukazuje na
 * klub jako `mainEntity` (kontakt je jeho), ostatní přes `about`.
 */
export function toWebPage({ aboutClub, baseUrl, description, kind, name, path }: WebPageInput) {
  const ids = schemaIds(baseUrl)
  return {
    '@context': 'https://schema.org',
    '@type': kind,
    name,
    description,
    url: `${baseUrl}${path}`,
    inLanguage: 'cs-CZ',
    isPartOf: idRef(ids.website),
    ...(aboutClub
      ? kind === 'ContactPage'
        ? { mainEntity: idRef(ids.team) }
        : { about: idRef(ids.team) }
      : {}),
  }
}

/** Nejvíc fotek, které `ImageGallery` vypíše; galerie mívají desítky snímků. */
export const GALLERY_IMAGE_LIMIT = 12

export type ImageGalleryInput = {
  baseUrl: string
  /** Cesta detailu (`/fotogalerie/<slug>`). */
  path: string
  name: string
  /** Den akce (`YYYY-MM-DD`), pokud ho galerie zná. */
  dateCreated: string | null
  /** Všechny fotky galerie (absolutní URL) — vypíše se prvních `GALLERY_IMAGE_LIMIT`. */
  photos: Array<{ url: string; caption: string | null }>
}

/**
 * Detail fotogalerie. `numberOfItems` je skutečný počet fotek, `image`
 * jen prvních několik (JSON-LD s padesáti snímky by byl zbytečně dlouhý).
 * Datum galerie je den akce, proto `dateCreated`, ne `datePublished`.
 */
export function toImageGallery({ baseUrl, dateCreated, name, path, photos }: ImageGalleryInput) {
  const ids = schemaIds(baseUrl)
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name,
    url: `${baseUrl}${path}`,
    inLanguage: 'cs-CZ',
    ...(dateCreated ? { dateCreated } : {}),
    numberOfItems: photos.length,
    publisher: idRef(ids.team),
    isPartOf: idRef(ids.website),
    ...(photos.length
      ? {
          image: photos.slice(0, GALLERY_IMAGE_LIMIT).map((photo) => ({
            '@type': 'ImageObject',
            contentUrl: photo.url,
            ...(photo.caption ? { caption: photo.caption } : {}),
          })),
        }
      : {}),
  }
}
