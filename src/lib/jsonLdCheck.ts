/**
 * Kontrola JSON-LD proti povinným polím, které chce Google (Event, Article,
 * Breadcrumb) a proti vnitřní konzistenci dokumentu (`@id`, data).
 *
 * Náhrada za Rich Results Test tam, kde nejde spustit (CI, lokální vývoj):
 * zná jen pravidla z dokumentace Google, ne celý validátor, takže „0 chyb"
 * tady neznamená „0 chyb v Rich Results Testu" — viz `phases/03-schema-entita`.
 * Čisté a izomorfní; používá ho `scripts/check-jsonld.ts` i unit testy.
 *
 * Odkazy `{ "@id": … }` se hledají v témže dokumentu (včetně vnořených uzlů
 * s `@id`). Odkaz mimo dokument (`#team` na stránce zápasu) je **varování**,
 * ne chyba: stránka ho nedefinuje, platí jen díky tomu, že ho definuje home.
 */

export type JsonLdReport = { errors: string[]; warnings: string[] }

type Node = Record<string, unknown>

const VALID_EVENT_STATUS = new Set([
  'EventScheduled',
  'EventCancelled',
  'EventMovedOnline',
  'EventPostponed',
  'EventRescheduled',
])

/** ISO 8601 datum a čas se zónou (`Z` nebo `±hh:mm`). */
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const LOCAL_OFFSET = /[+-]\d{2}:\d{2}$/

const isNode = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const asList = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : value === undefined || value === null ? [] : [value]

const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value : null

const typesOf = (node: Node): string[] =>
  asList(node['@type']).filter((type): type is string => typeof type === 'string')

const hasType = (node: Node, ...names: string[]): boolean =>
  typesOf(node).some((type) => names.includes(type))

/** Uzly nejvyšší úrovně dokumentu (`@graph` rozbalený, pole dokumentů sloučené). */
export function topLevelNodes(doc: unknown): Node[] {
  const nodes: Node[] = []
  for (const item of asList(doc)) {
    if (!isNode(item)) continue
    if ('@graph' in item) nodes.push(...topLevelNodes(item['@graph']))
    else nodes.push(item)
  }
  return nodes
}

/** `@id` → uzel pro všechny uzly dokumentu, které nejsou jen odkazem. */
function indexById(nodes: Node[]): { index: Map<string, Node>; duplicates: string[] } {
  const index = new Map<string, Node>()
  const duplicates: string[] = []
  const visit = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(visit)
    if (!isNode(value)) return
    const id = text(value['@id'])
    if (id && Object.keys(value).some((key) => key !== '@id')) {
      if (index.has(id)) duplicates.push(id)
      else index.set(id, value)
    }
    Object.values(value).forEach(visit)
  }
  nodes.forEach(visit)
  return { index, duplicates }
}

type Context = { index: Map<string, Node>; report: JsonLdReport; label: string }

const error = (ctx: Context, message: string) => ctx.report.errors.push(`${ctx.label}: ${message}`)
const warn = (ctx: Context, message: string) => ctx.report.warnings.push(`${ctx.label}: ${message}`)

/** Hodnota vlastnosti jako uzel; odkaz `{ "@id" }` se dohledá v dokumentu. */
function resolve(value: unknown, ctx: Context): { node: Node | null; external: string | null } {
  const first = asList(value)[0]
  if (!isNode(first)) return { node: null, external: null }
  const id = text(first['@id'])
  const isRefOnly = id !== null && Object.keys(first).length === 1
  if (!isRefOnly) return { node: first, external: null }
  const found = ctx.index.get(id)
  return found ? { node: found, external: null } : { node: null, external: id }
}

function checkDate(node: Node, key: string, ctx: Context, { required = false } = {}) {
  const value = node[key]
  if (value === undefined) {
    if (required) error(ctx, `chybí ${key}`)
    return
  }
  if (typeof value !== 'string' || !(ISO_DATETIME.test(value) || ISO_DATE.test(value))) {
    error(ctx, `${key} není ISO 8601 (${JSON.stringify(value)})`)
  }
}

function checkAddress(place: Node, ctx: Context) {
  const { node: address, external } = resolve(place.address, ctx)
  if (!address) {
    error(ctx, external ? `address odkazuje mimo dokument (${external})` : 'location.address chybí')
    return
  }
  if (!hasType(address, 'PostalAddress')) error(ctx, 'address není PostalAddress')
  if (!text(address.addressCountry)) error(ctx, 'address.addressCountry chybí')
  if (!text(address.addressLocality) && !text(address.streetAddress)) {
    warn(ctx, 'address je jen země (bez města a ulice) — Google ji bere, ale je to slabé')
  }
}

function checkEvent(node: Node, ctx: Context) {
  if (!text(node.name)) error(ctx, 'chybí name')
  checkDate(node, 'startDate', ctx, { required: true })
  checkDate(node, 'endDate', ctx)
  if (typeof node.startDate === 'string' && !LOCAL_OFFSET.test(node.startDate)) {
    warn(ctx, 'startDate bez lokálního offsetu (Google doporučuje čas se zónou)')
  }
  if (node.endDate === undefined) warn(ctx, 'chybí endDate (doporučené)')
  if (asList(node.image).length === 0) warn(ctx, 'chybí image (doporučené)')

  const status = text(node.eventStatus)
  if (status && !VALID_EVENT_STATUS.has(status.replace('https://schema.org/', ''))) {
    error(ctx, `eventStatus „${status}" není hodnota schema.org (např. EventCompleted neexistuje)`)
  }

  const { node: location, external } = resolve(node.location, ctx)
  if (!location) {
    error(ctx, external ? `location odkazuje mimo dokument (${external})` : 'chybí location')
    return
  }
  if (!text(location.name)) error(ctx, 'location.name chybí')
  checkAddress(location, ctx)
}

function checkArticle(node: Node, ctx: Context) {
  const headline = text(node.headline)
  if (!headline) error(ctx, 'chybí headline')
  else if (headline.length > 110) warn(ctx, 'headline je delší než 110 znaků')
  if (asList(node.image).length === 0) error(ctx, 'chybí image')
  checkDate(node, 'datePublished', ctx, { required: true })
  checkDate(node, 'dateModified', ctx)

  const { node: author, external: authorRef } = resolve(node.author, ctx)
  if (!author && !authorRef) warn(ctx, 'chybí author')
  else if (author && !text(author.name)) warn(ctx, 'author bez name')
  else if (authorRef) warn(ctx, `author odkazuje mimo dokument (${authorRef}) a nemá name`)

  const { node: publisher, external: publisherRef } = resolve(node.publisher, ctx)
  if (!publisher && !publisherRef) warn(ctx, 'chybí publisher')
  else if (publisherRef) warn(ctx, `publisher je odkaz mimo dokument (${publisherRef})`)
}

function checkBreadcrumbs(node: Node, ctx: Context) {
  const items = asList(node.itemListElement).filter(isNode)
  if (items.length < 2) error(ctx, 'BreadcrumbList má méně než dvě položky')
  items.forEach((item, position) => {
    if (item.position !== position + 1) error(ctx, `položka ${position + 1} má špatný position`)
    if (!text(item.name)) error(ctx, `položka ${position + 1} nemá name`)
    if (position < items.length - 1 && !text(item.item)) {
      error(ctx, `položka ${position + 1} nemá item (URL)`)
    }
  })
}

function checkPage(node: Node, ctx: Context) {
  if (!text(node.name)) error(ctx, 'chybí name')
  const url = text(node.url)
  if (!url) error(ctx, 'chybí url')
  else if (!/^https?:\/\//.test(url)) error(ctx, `url není absolutní (${url})`)
}

/** Zkontroluje jeden JSON-LD dokument; `label` se předřadí ke každé hlášce. */
export function checkJsonLd(doc: unknown, label = 'dokument'): JsonLdReport {
  const report: JsonLdReport = { errors: [], warnings: [] }
  const nodes = topLevelNodes(doc)
  const { index, duplicates } = indexById(nodes)
  const ctx: Context = { index, report, label }

  if (nodes.length === 0) error(ctx, 'prázdný dokument')

  const context = asList(doc).filter(isNode)[0]?.['@context']
  if (context !== 'https://schema.org') error(ctx, '@context není https://schema.org')
  for (const id of duplicates) error(ctx, `@id ${id} je definované víckrát`)

  for (const node of nodes) {
    const nodeCtx: Context = { ...ctx, label: `${label} › ${typesOf(node).join('/') || '?'}` }
    if (hasType(node, 'SportsEvent', 'Event')) checkEvent(node, nodeCtx)
    else if (hasType(node, 'NewsArticle', 'Article', 'BlogPosting')) checkArticle(node, nodeCtx)
    else if (hasType(node, 'BreadcrumbList')) checkBreadcrumbs(node, nodeCtx)
    else if (hasType(node, 'ImageGallery', 'CollectionPage', 'AboutPage', 'ContactPage')) {
      checkPage(node, nodeCtx)
    }
  }

  return report
}

/** Vytáhne a naparsuje všechny `<script type="application/ld+json">` z HTML. */
export function extractJsonLd(html: string): unknown[] {
  const found: unknown[] = []
  const pattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  for (const match of html.matchAll(pattern)) found.push(JSON.parse(match[1]))
  return found
}
