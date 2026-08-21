import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import type {
  CtaBannerBlockType,
  DownloadsBlock as DownloadsBlockProps,
  GalleryEmbedBlock as GalleryEmbedBlockProps,
} from '@/payload-types'
import { CtaBannerBlockComponent } from '@/landing/blocks/CtaBanner/Component'
import { DownloadsBlockComponent } from '@/landing/blocks/Downloads/Component'
import { GalleryEmbedBlockComponent } from '@/landing/blocks/GalleryEmbed/Component'

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
  | SerializedBlockNode<CtaBannerBlockType | GalleryEmbedBlockProps | DownloadsBlockProps>

const serverJSXConverters: JSXConvertersFunction<ServerNodeTypes> = (args) => {
  const base = baseJSXConverters(args as never)
  return {
    ...base,
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
