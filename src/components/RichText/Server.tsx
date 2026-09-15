import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import type {
  CtaBannerBlockType,
  DownloadsBlock as DownloadsBlockProps,
  GalleryEmbedBlock as GalleryEmbedBlockProps,
  GalleryLinkBlock as GalleryLinkBlockProps,
} from '@/payload-types'
import { CtaBannerBlockComponent } from '@/landing/blocks/CtaBanner/Component'
import { DownloadsBlockComponent } from '@/landing/blocks/Downloads/Component'
import { GalleryEmbedBlockComponent } from '@/landing/blocks/GalleryEmbed/Component'
import { GalleryLinkBlockComponent } from '@/landing/blocks/GalleryLink/Component'
import { relId } from '@/landing/data/format'

import {
  baseJSXConverters,
  richTextClassName,
  type BaseNodeTypes,
  type Props,
} from './index'

/**
 * Serverový render rich textu — základní konvertory + landing bloky,
 * které fetchují data přes Payload (CTA banner, vložená galerie,
 * dokumenty ke stažení). Používají ho server komponenty: detail
 * článku a blok Textová sekce. NEimportovat z klientských komponent.
 */

type ServerNodeTypes =
  | BaseNodeTypes
  | SerializedBlockNode<
      CtaBannerBlockType | GalleryEmbedBlockProps | GalleryLinkBlockProps | DownloadsBlockProps
    >

/** Cesta na podstránku podle kolekce — `pages` nemá vlastní prefix, žije na `/[slug]`. */
const RELATION_PREFIX: Partial<Record<string, string>> = { posts: '/aktuality' }

/**
 * Konvertor pro `RelationshipFeature` (nástroj „Relace" v editoru) —
 * bez něj Payload takovou relaci v rich textu **potichu nevykreslí vůbec**,
 * `@payloadcms/richtext-lexical` k ní nemá žádný výchozí JSX konvertor.
 * Platilo to pro `pages`/`posts`/`matches`/`galleries` od zavedení
 * `RelationshipFeature`, ne jen pro galerie.
 *
 * `matches` v `enabledCollections` (`defaultLexical.ts`) proto zmizely —
 * zápas nemá vlastní detailní stránku, na kterou by se dalo odkázat.
 * Galerie dostávají stejnou kartu jako blok `galleryLink`, ne holý odkaz.
 */
async function RelationshipConverter({
  node,
}: {
  node: { relationTo: string; value: unknown }
}) {
  const { relationTo, value } = node

  if (relationTo === 'galleries') {
    const galleryId = relId(value)
    if (!galleryId) return null
    return (
      <EmbeddedSection>
        <GalleryLinkBlockComponent block={{ blockType: 'galleryLink', gallery: galleryId, label: null }} />
      </EmbeddedSection>
    )
  }

  const doc = typeof value === 'object' && value ? (value as { slug?: string; title?: string }) : null
  if (!doc?.slug) return null
  const href = `${RELATION_PREFIX[relationTo] ?? ''}/${doc.slug}`
  return (
    <a className="text-club font-semibold underline underline-offset-2" href={href}>
      {doc.title ?? doc.slug}
    </a>
  )
}

const serverJSXConverters: JSXConvertersFunction<ServerNodeTypes> = (args) => {
  const base = baseJSXConverters(args as never)
  return {
    ...base,
    relationship: RelationshipConverter as never,
    blocks: {
      ...base.blocks,
      ctaBanner: ({ node }) => (
        <EmbeddedSection>
          <CtaBannerBlockComponent block={node.fields} />
        </EmbeddedSection>
      ),
      galleryEmbed: ({ node }) => (
        <EmbeddedSection>
          <GalleryEmbedBlockComponent block={node.fields} />
        </EmbeddedSection>
      ),
      galleryLink: ({ node }) => (
        <EmbeddedSection>
          <GalleryLinkBlockComponent block={node.fields} />
        </EmbeddedSection>
      ),
      downloads: ({ node }) => (
        <EmbeddedSection>
          <DownloadsBlockComponent block={node.fields} />
        </EmbeddedSection>
      ),
    },
  }
}

/** Obal pro landing bloky uvnitř textu — ruší velké sekční odsazení. */
function EmbeddedSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose font-display text-ink my-6 [&_section]:mt-0! [&_section]:px-0!">
      {children}
    </div>
  )
}

export default function RichTextServer(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={serverJSXConverters}
      className={richTextClassName({ enableGutter, enableProse }, className)}
      {...rest}
    />
  )
}
