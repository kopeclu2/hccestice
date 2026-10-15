import React, { Fragment } from 'react'

import { AlbumBlockComponent } from '@/landing/blocks/Album/Component'
import { AnnouncementBlockComponent } from '@/landing/blocks/Announcement/Component'
import { ClubBlockComponent } from '@/landing/blocks/Club/Component'
import { ContactBlockComponent } from '@/landing/blocks/Contact/Component'
import { CtaBannerBlockComponent } from '@/landing/blocks/CtaBanner/Component'
import { DataTableBlockComponent } from '@/landing/blocks/DataTable/Component'
import { DownloadsBlockComponent } from '@/landing/blocks/Downloads/Component'
import { ExternalEmbedBlockComponent } from '@/landing/blocks/ExternalEmbed/Component'
import { FaqBlockComponent } from '@/landing/blocks/Faq/Component'
import { FeatureGridBlockComponent } from '@/landing/blocks/FeatureGrid/Component'
import { FormBlockServer } from '@/landing/blocks/Form/Server'
import { GalleriesGridBlockComponent } from '@/landing/blocks/GalleriesGrid/Component'
import { GalleryEmbedBlockComponent } from '@/landing/blocks/GalleryEmbed/Component'
import { HeroBlockComponent } from '@/landing/blocks/Hero/Component'
import { HeroModernBlockComponent } from '@/landing/blocks/HeroModern/Component'
import { HistoryBlockComponent } from '@/landing/blocks/History/Component'
import { MapEmbedBlockComponent } from '@/landing/blocks/MapEmbed/Component'
import { MatchCardBlockComponent } from '@/landing/blocks/MatchCard/Component'
import { MatchesPickerBlockComponent } from '@/landing/blocks/MatchesPicker/Component'
import { MatchesWidgetBlockComponent } from '@/landing/blocks/MatchesWidget/Component'
import { NewsBlockComponent } from '@/landing/blocks/News/Component'
import { NextMatchWidgetBlockComponent } from '@/landing/blocks/NextMatchWidget/Component'
import { PeopleBlockComponent } from '@/landing/blocks/People/Component'
import { PersonCardBlockComponent } from '@/landing/blocks/PersonCard/Component'
import { PhotoCardsBlockComponent } from '@/landing/blocks/PhotoCards/Component'
import { PlayerCardBlockComponent } from '@/landing/blocks/PlayerCard/Component'
import { PlayersPickerBlockComponent } from '@/landing/blocks/PlayersPicker/Component'
import { PostFeatureBlockComponent } from '@/landing/blocks/PostFeature/Component'
import { PostsGridBlockComponent } from '@/landing/blocks/PostsGrid/Component'
import { PricingCardsBlockComponent } from '@/landing/blocks/PricingCards/Component'
import { ProductCardBlockComponent } from '@/landing/blocks/ProductCard/Component'
import { ProductsGridBlockComponent } from '@/landing/blocks/ProductsGrid/Component'
import { RawHtmlBlock } from '@/landing/blocks/RawHtml/Component'
import { RosterWidgetBlockComponent } from '@/landing/blocks/RosterWidget/Component'
import { SeasonBlockComponent } from '@/landing/blocks/Season/Component'
import { SectionHeadingBlockComponent } from '@/landing/blocks/SectionHeading/Component'
import { SponsorCardBlockComponent } from '@/landing/blocks/SponsorCard/Component'
import { SponsorsBlockComponent } from '@/landing/blocks/Sponsors/Component'
import { StandingsWidgetBlockComponent } from '@/landing/blocks/StandingsWidget/Component'
import { StatsBlockComponent } from '@/landing/blocks/Stats/Component'
import { TestimonialsBlockComponent } from '@/landing/blocks/Testimonials/Component'
import { TextSectionBlockComponent } from '@/landing/blocks/TextSection/Component'
import { TrainingsBlockComponent } from '@/landing/blocks/Trainings/Component'
import type { Page } from '@/payload-types'

type LayoutBlock = Page['layout'][number]

/**
 * Mapa `blockType → komponenta bloku` (každý blok = složka v `blocks/`
 * s configem a komponentou; komponenta si vlastní data načítá sama).
 */
const blockComponents: Record<string, React.FC<{ block: never }>> = {
  landingHero: HeroBlockComponent,
  landingHeroModern: HeroModernBlockComponent,
  landingNews: NewsBlockComponent,
  landingSeason: SeasonBlockComponent,
  landingStats: StatsBlockComponent,
  landingTrainings: TrainingsBlockComponent,
  landingClub: ClubBlockComponent,
  landingAlbum: AlbumBlockComponent,
  landingHistory: HistoryBlockComponent,
  landingPeople: PeopleBlockComponent,
  landingSponsors: SponsorsBlockComponent,
  landingFaq: FaqBlockComponent,
  landingContact: ContactBlockComponent,
  sectionHeading: SectionHeadingBlockComponent,
  textSection: TextSectionBlockComponent,
  photoCards: PhotoCardsBlockComponent,
  ctaBanner: CtaBannerBlockComponent,
  dataTable: DataTableBlockComponent,
  matchesWidget: MatchesWidgetBlockComponent,
  nextMatchWidget: NextMatchWidgetBlockComponent,
  postsGrid: PostsGridBlockComponent,
  galleriesGrid: GalleriesGridBlockComponent,
  rosterWidget: RosterWidgetBlockComponent,
  standingsWidget: StandingsWidgetBlockComponent,
  productsGrid: ProductsGridBlockComponent,
  productCard: ProductCardBlockComponent,
  playerCard: PlayerCardBlockComponent,
  playersPicker: PlayersPickerBlockComponent,
  matchCard: MatchCardBlockComponent,
  matchesPicker: MatchesPickerBlockComponent,
  personCard: PersonCardBlockComponent,
  galleryEmbed: GalleryEmbedBlockComponent,
  postFeature: PostFeatureBlockComponent,
  sponsorCard: SponsorCardBlockComponent,
  featureGrid: FeatureGridBlockComponent,
  testimonials: TestimonialsBlockComponent,
  pricingCards: PricingCardsBlockComponent,
  downloads: DownloadsBlockComponent,
  mapEmbed: MapEmbedBlockComponent,
  announcement: AnnouncementBlockComponent,
  externalEmbed: ExternalEmbedBlockComponent,
}

/** True pro bloky, které umí vykreslit `renderLandingBlock`. */
export const isLandingBlock = (blockType: string): boolean => blockType in blockComponents

/** Vykreslí jeden landing blok, nebo `null` pro neznámý typ. */
export function renderLandingBlock(block: LayoutBlock, key: React.Key): React.ReactNode {
  const BlockComponent = blockComponents[block.blockType]
  return BlockComponent ? <BlockComponent block={block as never} key={key} /> : null
}

/** Render layoutu landing stránky (home): jen klubové bloky, bez obalů. */
export function RenderLandingBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  return (
    <>
      {blocks.map((block, index) =>
        renderLandingBlock(block, block.id ?? `${block.blockType}-${index}`),
      )}
    </>
  )
}

/**
 * Bloky mimo klubový design systém: formulář (form builder plugin)
 * a RawHtml (import z eStránek). Vrací `null` pro cokoli jiného.
 */
function renderPlainBlock(block: LayoutBlock): React.ReactNode {
  switch (block.blockType) {
    case 'formBlock':
      // Payload typ nese `form` jako `number | Form`; stránka se čte s
      // `depth`, takže tu je rozbalená relace, kterou `FormBlockServer` čeká.
      return (
        <FormBlockServer {...(block as unknown as React.ComponentProps<typeof FormBlockServer>)} />
      )
    case 'rawHtml':
      return <RawHtmlBlock {...block} />
    default:
      return null
  }
}

/**
 * Render layoutu dynamických stránek (kolekce Stránky mimo homepage).
 *
 * Klubové bloky (viz katalog /widgety) i bloky mimo design systém
 * (formulář, RawHtml) dostávají obal s rytmem obsahové podstránky.
 */
export const RenderBlocks: React.FC<{
  blocks: LayoutBlock[]
}> = ({ blocks }) => {
  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (!hasBlocks) return null

  return (
    <Fragment>
      {blocks.map((block, index) => {
        const { blockType } = block

        // Landing/obecné sekce: typografie Archivo, ořez watermarků a
        // TĚSNĚJŠÍ rytmus než na homepage (200px mezery jsou marketingové,
        // obsahové podstránky potřebují ~1/3).
        // Stupně jsou tři jako v `SectionShell` — s dvěma (`mt-10! md:mt-16!`)
        // dostal tablet rovnou desktopovou hodnotu, tedy přesně to, co škála
        // sekcí odjinud odstranila.
        if (blockType && isLandingBlock(blockType)) {
          return (
            <div
              className="overflow-x-clip font-display text-ink [&_section]:mt-10! md:[&_section]:mt-13! lg:[&_section]:mt-16!"
              key={index}
            >
              {renderLandingBlock(block, index)}
            </div>
          )
        }

        const plain = blockType ? renderPlainBlock(block) : null

        if (plain) {
          return (
            // Nesekční bloky (formulář, legacy HTML) měly ploché 64px
            // i na 320px displeji — odtud ta mezera mezi hlavičkou
            // a prvním odstavcem na `/kontakty`.
            <div className="my-10 md:my-13 lg:my-16" key={index}>
              {plain}
            </div>
          )
        }
        return null
      })}
    </Fragment>
  )
}
