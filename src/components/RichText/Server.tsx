import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CtaBannerBlockComponent } from '@/landing/blocks/CtaBanner/Component'
import { DownloadsBlockComponent } from '@/landing/blocks/Downloads/Component'
import { GalleryEmbedBlockComponent } from '@/landing/blocks/GalleryEmbed/Component'
import { GalleryLinkBlockComponent } from '@/landing/blocks/GalleryLink/Component'
import { MatchCardBlockComponent } from '@/landing/blocks/MatchCard/Component'
import { MatchesPickerBlockComponent } from '@/landing/blocks/MatchesPicker/Component'
import { MatchesWidgetBlockComponent } from '@/landing/blocks/MatchesWidget/Component'
import { MatchFormBlockComponent } from '@/landing/blocks/MatchForm/Component'
import { MatchLineupBlockComponent } from '@/landing/blocks/MatchLineup/Component'
import { MatchPenaltiesBlockComponent } from '@/landing/blocks/MatchPenalties/Component'
import { MatchScoreboardBlockComponent } from '@/landing/blocks/MatchScoreboard/Component'
import { MatchScorersBlockComponent } from '@/landing/blocks/MatchScorers/Component'
import { MatchSummaryBlockComponent } from '@/landing/blocks/MatchSummary/Component'
import { MatchTimelineBlockComponent } from '@/landing/blocks/MatchTimeline/Component'
import { NextMatchWidgetBlockComponent } from '@/landing/blocks/NextMatchWidget/Component'
import { StandingsWidgetBlockComponent } from '@/landing/blocks/StandingsWidget/Component'
import { MatchLinkRow } from '@/landing/features/matches/components/MatchLinkRow'
import { fetchMatchCard } from '@/landing/features/matches/data/matches'
import { relId } from '@/landing/lib/payload'
import { collectionDocPath } from '@/lib/routes'
import type {
  CtaBannerBlockType,
  DownloadsBlock as DownloadsBlockProps,
  GalleryEmbedBlock as GalleryEmbedBlockProps,
  GalleryLinkBlock as GalleryLinkBlockProps,
  MatchCardBlock,
  MatchesPickerBlock,
  MatchesWidgetBlock,
  MatchFormBlock,
  MatchLineupBlock,
  MatchPenaltiesBlock,
  MatchScoreboardBlock,
  MatchScorersBlock,
  MatchSummaryBlock,
  MatchTimelineBlock,
  NextMatchWidgetBlock,
  StandingsWidgetBlock,
} from '@/payload-types'

import { findLeadMediaBlockId } from './leadMedia'

import {
  baseJSXConverters,
  mediaBlockConverter,
  richTextClassName,
  type BaseNodeTypes,
  type MediaOptions,
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
      | CtaBannerBlockType
      | GalleryEmbedBlockProps
      | GalleryLinkBlockProps
      | DownloadsBlockProps
      | MatchCardBlock
      | MatchScoreboardBlock
      | MatchScorersBlock
      | MatchPenaltiesBlock
      | MatchTimelineBlock
      | MatchSummaryBlock
      | MatchLineupBlock
      | MatchFormBlock
      | NextMatchWidgetBlock
      | StandingsWidgetBlock
      | MatchesPickerBlock
      | MatchesWidgetBlock
    >

/**
 * Konvertor pro `RelationshipFeature` (nástroj „Relace" v editoru) —
 * bez něj Payload takovou relaci v rich textu **potichu nevykreslí vůbec**,
 * `@payloadcms/richtext-lexical` k ní nemá žádný výchozí JSX konvertor.
 * Platilo to pro `pages`/`posts`/`matches`/`galleries` od zavedení
 * `RelationshipFeature`, ne jen pro galerie.
 *
 * Galerie dostávají stejnou kartu jako blok `galleryLink`, zápas řádek
 * s titulkem, datem a skóre (`MatchLinkRow`, odkaz na `/zapasy/[slug]`),
 * ostatní kolekce holý odkaz.
 */
async function RelationshipConverter({ node }: { node: { relationTo: string; value: unknown } }) {
  const { relationTo, value } = node

  if (relationTo === 'galleries') {
    const galleryId = relId(value)
    if (!galleryId) return null
    return (
      <EmbeddedSection>
        <GalleryLinkBlockComponent
          block={{ blockType: 'galleryLink', gallery: galleryId, label: null }}
        />
      </EmbeddedSection>
    )
  }

  if (relationTo === 'matches') {
    // Titulek zápasu z karty: `matches` nemá `title`, jen `displayTitle`
    // (s malým „x" a datem pro admin). Karta je tagovaná cache a vyřeší i
    // nepopulovanou relaci. Zápas bez slugu nemá kam vést → `null`.
    const matchId = relId(value)
    if (!matchId) return null
    const card = await fetchMatchCard(matchId)
    return card ? <MatchLinkRow card={card} /> : null
  }

  const doc =
    typeof value === 'object' && value ? (value as { slug?: string; title?: string }) : null
  if (!doc?.slug) return null
  const href = collectionDocPath(relationTo, doc.slug)
  return (
    <a className="font-semibold text-club underline underline-offset-2" href={href}>
      {doc.title ?? doc.slug}
    </a>
  )
}

const createServerJSXConverters =
  (media: MediaOptions): JSXConvertersFunction<ServerNodeTypes> =>
  (args) => {
    const base = baseJSXConverters(args)
    return {
      ...base,
      relationship: RelationshipConverter,
      blocks: {
        ...base.blocks,
        mediaBlock: mediaBlockConverter(media),
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
        // widgety zápasů — každý vrací `null`, když zápas nebo data chybí
        matchCard: ({ node }) => (
          <EmbeddedSection>
            <MatchCardBlockComponent block={node.fields} />
          </EmbeddedSection>
        ),
        matchScoreboard: ({ node }) => (
          <EmbeddedSection>
            <MatchScoreboardBlockComponent block={node.fields} />
          </EmbeddedSection>
        ),
        matchScorers: ({ node }) => (
          <EmbeddedSection>
            <MatchScorersBlockComponent block={node.fields} />
          </EmbeddedSection>
        ),
        matchPenalties: ({ node }) => (
          <EmbeddedSection>
            <MatchPenaltiesBlockComponent block={node.fields} />
          </EmbeddedSection>
        ),
        matchTimeline: ({ node }) => (
          <EmbeddedSection>
            <MatchTimelineBlockComponent block={node.fields} />
          </EmbeddedSection>
        ),
        matchSummary: ({ node }) => (
          <EmbeddedSection>
            <MatchSummaryBlockComponent block={node.fields} />
          </EmbeddedSection>
        ),
        matchLineup: ({ node }) => (
          <EmbeddedSection>
            <MatchLineupBlockComponent block={node.fields} />
          </EmbeddedSection>
        ),
        matchForm: ({ node }) => (
          <EmbeddedSection>
            <MatchFormBlockComponent block={node.fields} />
          </EmbeddedSection>
        ),
        nextMatchWidget: ({ node }) => (
          <EmbeddedSection>
            <NextMatchWidgetBlockComponent block={node.fields} />
          </EmbeddedSection>
        ),
        standingsWidget: ({ node }) => (
          <EmbeddedSection>
            <StandingsWidgetBlockComponent block={node.fields} />
          </EmbeddedSection>
        ),
        matchesPicker: ({ node }) => (
          <EmbeddedSection>
            <MatchesPickerBlockComponent block={node.fields} />
          </EmbeddedSection>
        ),
        matchesWidget: ({ node }) => (
          <EmbeddedSection>
            <MatchesWidgetBlockComponent block={node.fields} />
          </EmbeddedSection>
        ),
      },
    }
  }

/**
 * Obal pro landing bloky uvnitř textu — ruší velké sekční odsazení.
 *
 * `[&_img]:mt-0!` navíc ruší `.payload-richtext img { margin-top: … }`
 * (`globals.css`) — to pravidlo počítá s běžnou fotkou vloženou do proudu
 * textu (`MediaBlock`), ne s `next/image fill` uvnitř widgetu. Marže se
 * ale počítá do i pro `position:absolute; top:0` potomky (posouvá box
 * pod `top`, ne nad něj), takže bez resetu se fotka v kartě posunula
 * o vlastní margin dolů a nahoře probleskávalo pozadí kontejneru.
 */
function EmbeddedSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 font-display text-ink [&_img]:mt-0! [&_section]:mt-0! [&_section]:px-0!">
      {children}
    </div>
  )
}

export default function RichTextServer(props: Props) {
  const {
    className,
    enableProse = true,
    enableGutter = true,
    eagerLeadMedia = false,
    mediaSizes,
    ...rest
  } = props
  const converters = createServerJSXConverters({
    mediaSizes,
    priorityMediaId: eagerLeadMedia ? findLeadMediaBlockId(rest.data) : undefined,
  })
  return (
    <ConvertRichText
      converters={converters}
      className={richTextClassName({ enableGutter, enableProse }, className)}
      {...rest}
    />
  )
}
