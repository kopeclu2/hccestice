import type { CollectionConfig, Field, Plugin, SelectField } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateNavigation, revalidateNavigationDelete } from '@/hooks/revalidateNavigation'

/**
 * Adaptér nad `payload-cms-navigation-plugin`.
 *
 * Plugin přidává kolekce `navigation-containers` a `navigation-items`
 * s anglickými labely, bez `admin.group`, bez hooků a s poli, která tenhle
 * projekt nepoužije. Tohle je srovná do zdejších konvencí, aniž bychom
 * plugin forkovali.
 *
 * Patchuje se záměrně co nejméně — každé upravené pole je závazek při
 * každém updatu pluginu. Přidává se jediné nové pole (`anchor`).
 *
 * Polím se hodnoty **mutují**, ne kopírují spreadem: `Field` je
 * diskriminovaná unie a `{ ...field }` ji rozšíří tak, že přestane být
 * přiřaditelná zpět. Mutace je tady bezpečná — config v tomhle bodě
 * vlastníme a Payload ho sanitizuje až po všech pluginech.
 */

/** Kotvy sekcí, které skutečně existují na homepage (viz `id` v blocích). */
const HOME_ANCHORS = [
  { label: 'Úvod (hero)', value: 'home' },
  { label: 'Aktuality', value: 'aktuality' },
  { label: 'Sezóna', value: 'sezona' },
  { label: 'Tréninky', value: 'treninky' },
  { label: 'O klubu', value: 'klub' },
  { label: 'Fotoalbum', value: 'fotoalbum' },
  { label: 'Historie', value: 'historie' },
  { label: 'Lidé v klubu', value: 'lide' },
  { label: 'Partneři', value: 'sponzori' },
  { label: 'Kontakt', value: 'kontakt' },
]

/** Pole pluginu, která v tomhle projektu nemají smysl. */
const HIDDEN_ITEM_FIELDS = new Set([
  'localeVisibility', // projekt nemá `localization`
  'className', // editor by injektoval CSS třídy do markupu
  'order', // pořadí drží `container.items` (drag & drop)
  'parent', // hierarchii nepoužíváme, menu je ploché
  'children', // dtto — plugin má navíc dvě nesynchronizované reprezentace
])

/** Jediné místo, kde obcházíme typy unie `Field`. */
type MutableField = { label?: unknown; admin?: Record<string, unknown> }

const setLabel = (field: Field, label: string): void => {
  ;(field as MutableField).label = label
}

const setAdmin = (field: Field, patch: Record<string, unknown>): void => {
  const target = field as MutableField
  target.admin = { ...(target.admin ?? {}), ...patch }
}

const byName = (fields: Field[], name: string): Field | undefined =>
  fields.find((field) => 'name' in field && field.name === name)

const ANCHOR_FIELD: Field = {
  name: 'anchor',
  type: 'select',
  label: 'Sekce na homepage',
  options: HOME_ANCHORS,
  admin: {
    description:
      'Na homepage odkaz skočí na tuhle sekci. Nechte prázdné, pokud položka na homepage sekci nemá — pak vede přímo na svou podstránku.',
  },
}

export const navigationOverrides = (): Plugin => (config) => {
  const container = config.collections?.find((c) => c.slug === 'navigation-containers')
  const item = config.collections?.find((c) => c.slug === 'navigation-items')

  // Fail-fast: bez toho by se selhání projevilo jen anglickým adminem
  // a nikdo by nepoznal, že se změnilo API pluginu.
  if (!container || !item) {
    throw new Error(
      'navigationOverrides: kolekce navigation-containers / navigation-items nenalezeny. ' +
        'Změnilo se API payload-cms-navigation-plugin?',
    )
  }

  patchContainer(container)
  patchItem(item)

  return config
}

function patchContainer(container: CollectionConfig): void {
  container.labels = { singular: 'Menu', plural: 'Menu' }
  container.admin = {
    ...container.admin,
    group: 'Nastavení',
    description: 'Sada odkazů v hlavní navigaci. Pořadí položek se přetahuje myší.',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    useAsTitle: 'name',
  }
  container.access = {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  }
  container.hooks = {
    ...container.hooks,
    afterChange: [...(container.hooks?.afterChange ?? []), revalidateNavigation],
    afterDelete: [...(container.hooks?.afterDelete ?? []), revalidateNavigationDelete],
  }

  const fields = container.fields
  const name = byName(fields, 'name')
  if (name) setLabel(name, 'Název menu')

  const slug = byName(fields, 'slug')
  if (slug) {
    setLabel(slug, 'Identifikátor')
    setAdmin(slug, { description: 'Kód pro kód webu — hlavní navigace používá `hlavni`.' })
  }

  const description = byName(fields, 'description')
  if (description) setLabel(description, 'Poznámka')

  const items = byName(fields, 'items')
  if (items) {
    setLabel(items, 'Položky menu')
    setAdmin(items, { description: 'Pořadí odkazů v navigaci — přetáhněte myší.' })
  }

  // `settings` (maxDepth, allowedTypes) je pro ploché menu bez využití
  const settings = byName(fields, 'settings')
  if (settings) setAdmin(settings, { hidden: true })
}

function patchItem(item: CollectionConfig): void {
  item.labels = { singular: 'Položka menu', plural: 'Položky menu' }
  item.admin = {
    ...item.admin,
    group: 'Nastavení',
    description: 'Jeden odkaz v navigaci. Do menu se zařadí v „Menu → Položky menu".',
    defaultColumns: ['title', 'anchor', 'url', 'updatedAt'],
    useAsTitle: 'title',
  }
  item.access = {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  }
  item.hooks = {
    ...item.hooks,
    afterChange: [...(item.hooks?.afterChange ?? []), revalidateNavigation],
    afterDelete: [...(item.hooks?.afterDelete ?? []), revalidateNavigationDelete],
  }

  for (const field of item.fields) {
    if (!('name' in field) || !field.name) continue
    if (HIDDEN_ITEM_FIELDS.has(field.name)) setAdmin(field, { hidden: true })
  }

  const fields = item.fields
  const title = byName(fields, 'title')
  if (title) setLabel(title, 'Text odkazu')

  // „external" znamená v pluginu jen „cíl zadaný textem" — přeznačíme,
  // ať to nevypadá jako odkaz mimo web. Ručně psané Next stránky
  // (/zapasy, /soupiska…) nejsou dokumenty v `pages`, takže „internal"
  // s povinnou relací na ně použít nelze.
  const type = byName(fields, 'type')
  if (type && type.type === 'select') {
    setLabel(type, 'Typ položky')
    setAdmin(type, {
      description: 'Cesta nebo kotva se zadává textem, odkaz na stránku vybírá dokument z CMS.',
    })
    ;(type as SelectField).options = [
      { label: 'Cesta nebo kotva', value: 'external' },
      { label: 'Odkaz na stránku v CMS', value: 'internal' },
      { label: 'Skupina (bez odkazu)', value: 'folder' },
    ]
  }

  const url = byName(fields, 'url')
  if (url) {
    setLabel(url, 'Cesta na podstránku')
    setAdmin(url, {
      description:
        'Např. `/zapasy`. Nechte prázdné, pokud položka žije jen jako sekce na homepage. Ručně psané stránky nejsou v CMS jako dokumenty.',
    })
    // Plugin vyžaduje `url` u každé položky typu „external". V našem modelu
    // je ale legitimní položka, která má jen `anchor` (sekce na homepage bez
    // vlastní podstránky) — proto validaci zvolníme na „aspoň jedno z obou".
    ;(url as { validate?: unknown }).validate = (
      value: unknown,
      { data }: { data?: Record<string, unknown> },
    ) => {
      if (data?.type !== 'external') return true
      if (value || data?.anchor) return true
      return 'Vyplňte cestu na podstránku, nebo vyberte sekci na homepage.'
    }
  }

  // Skupina pro variantu „Odkaz na stránku v CMS" — pro dokumenty
  // v kolekci `pages`. Vnořená pole má plugin taky anglicky.
  const internalLink = byName(fields, 'internalLink')
  if (internalLink) {
    setLabel(internalLink, 'Odkaz na stránku')
    if (internalLink.type === 'group') {
      const reference = byName(internalLink.fields, 'reference')
      if (reference) setLabel(reference, 'Stránka')
      const customPath = byName(internalLink.fields, 'customPath')
      if (customPath) {
        setLabel(customPath, 'Vlastní cesta')
        setAdmin(customPath, { description: 'Přebije cestu odvozenou ze slugu stránky.' })
      }
    }
  }

  const target = byName(fields, 'target')
  if (target) setLabel(target, 'Otevřít v')

  const active = byName(fields, 'active')
  if (active) {
    setLabel(active, 'Zobrazit v navigaci')
    setAdmin(active, { description: 'Vypnutím položku skryjete, aniž byste ji mazali.' })
  }

  // `anchor` hned za `url`, aby dvojice „kam na home / kam na podstránce"
  // stála v adminu vedle sebe.
  const urlIndex = fields.findIndex((field) => 'name' in field && field.name === 'url')
  if (urlIndex === -1) fields.push(ANCHOR_FIELD)
  else fields.splice(urlIndex + 1, 0, ANCHOR_FIELD)
}
