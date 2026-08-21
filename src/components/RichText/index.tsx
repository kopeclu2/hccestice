import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'

import type {
  BannerBlock as BannerBlockProps,
  DataTableBlockType,
  MediaBlock as MediaBlockProps,
  StatCardsBlockType,
  YouTubeBlock as YouTubeBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { YouTubeBlock } from '@/blocks/YouTube/Component'
import { TEXT_STATE } from '@/fields/textStateColors'
import { DataTableBlockComponent } from '@/landing/blocks/DataTable/Component'
import { StatCardsBlockComponent } from '@/landing/blocks/StatCards/Component'
import { cn } from '@/utilities/ui'

/**
 * Základní (klient-safe) render rich textu.
 *
 * ⚠️ Sem patří jen konvertory bez server-only závislostí — komponentu
 * importují i klientské komponenty (formuláře, hero). Bloky, které
 * fetchují data přes Payload (galerie, dokumenty, CTA banner), řeší
 * serverová varianta `@/components/RichText/Server`.
 */

export type BaseNodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      | MediaBlockProps
      | BannerBlockProps
      | CodeBlockProps
      | YouTubeBlockProps
      | DataTableBlockType
      | StatCardsBlockType
    >

/** CSS z konfigurace stavů (kebab-case) → React style objekt (camelCase). */
const toReactStyle = (css: Record<string, string>): React.CSSProperties => {
  const style: Record<string, string> = {}
  for (const [property, value] of Object.entries(css)) {
    style[property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())] = value
  }
  return style
}

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/aktuality/${slug}` : `/${slug}`
}

/** Klient-safe konvertory — sdílí je i serverová varianta. */
export const baseJSXConverters: JSXConvertersFunction<BaseNodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  // Barvy a zvýraznění z TextStateFeature — výchozí converter stav
  // v `$` ignoruje (funguje jen v adminu), proto ho tu aplikujeme sami.
  text: (args) => {
    const rendered =
      typeof defaultConverters.text === 'function'
        ? defaultConverters.text(args as never)
        : args.node.text
    const state = (args.node as { $?: Record<string, string> }).$
    if (!state) return rendered

    const css: Record<string, string> = {}
    for (const [stateKey, stateValue] of Object.entries(state)) {
      Object.assign(css, TEXT_STATE[stateKey]?.[stateValue]?.css)
    }
    if (Object.keys(css).length === 0) return rendered

    return <span style={toReactStyle(css)}>{rendered}</span>
  },
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    youtube: ({ node }) => (
      <div className="not-prose my-6 [&_.container]:px-0">
        <YouTubeBlock {...node.fields} />
      </div>
    ),
    // tabulka v textu — bez sekčních rozestupů a bočního paddingu
    dataTable: ({ node }) => (
      <div className="not-prose font-display text-ink my-6 [&_section]:mt-0! [&_section]:px-0!">
        <DataTableBlockComponent block={node.fields} />
      </div>
    ),
    // statistické karty v článku („Co říkají čísla")
    statCards: ({ node }) => (
      <div className="not-prose font-display text-ink">
        <StatCardsBlockComponent block={node.fields} />
      </div>
    ),
  },
})

export type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

/** Třídy obalu rich textu (sdílené se serverovou variantou). */
export const richTextClassName = (
  { enableGutter, enableProse }: { enableGutter: boolean; enableProse: boolean },
  className?: string,
) =>
  cn(
    'payload-richtext',
    {
      container: enableGutter,
      'max-w-none': !enableGutter,
      'mx-auto prose md:prose-md dark:prose-invert': enableProse,
    },
    className,
  )

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={baseJSXConverters}
      className={richTextClassName({ enableGutter, enableProse }, className)}
      {...rest}
    />
  )
}
