import type { Page } from '@/payload-types'

import React from 'react'

import { AlbumBlockComponent } from './blocks/Album/Component'
import { AnnouncementBlockComponent } from './blocks/Announcement/Component'
import { ClubBlockComponent } from './blocks/Club/Component'
import { ContactBlockComponent } from './blocks/Contact/Component'
import { CtaBannerBlockComponent } from './blocks/CtaBanner/Component'
import { DataTableBlockComponent } from './blocks/DataTable/Component'
import { DownloadsBlockComponent } from './blocks/Downloads/Component'
import { ExternalEmbedBlockComponent } from './blocks/ExternalEmbed/Component'
import { FaqBlockComponent } from './blocks/Faq/Component'
import { FeatureGridBlockComponent } from './blocks/FeatureGrid/Component'
import { GalleriesGridBlockComponent } from './blocks/GalleriesGrid/Component'
import { GalleryEmbedBlockComponent } from './blocks/GalleryEmbed/Component'
import { HeroBlockComponent } from './blocks/Hero/Component'
import { HeroModernBlockComponent } from './blocks/HeroModern/Component'
import { HistoryBlockComponent } from './blocks/History/Component'
import { MapEmbedBlockComponent } from './blocks/MapEmbed/Component'
import { MatchCardBlockComponent } from './blocks/MatchCard/Component'
import { MatchesPickerBlockComponent } from './blocks/MatchesPicker/Component'
import { MatchesWidgetBlockComponent } from './blocks/MatchesWidget/Component'
import { NewsBlockComponent } from './blocks/News/Component'
import { NextMatchWidgetBlockComponent } from './blocks/NextMatchWidget/Component'
import { PeopleBlockComponent } from './blocks/People/Component'
import { PersonCardBlockComponent } from './blocks/PersonCard/Component'
import { PhotoCardsBlockComponent } from './blocks/PhotoCards/Component'
import { PlayerCardBlockComponent } from './blocks/PlayerCard/Component'
import { PlayersPickerBlockComponent } from './blocks/PlayersPicker/Component'
import { PostFeatureBlockComponent } from './blocks/PostFeature/Component'
import { PostsGridBlockComponent } from './blocks/PostsGrid/Component'
import { ProductCardBlockComponent } from './blocks/ProductCard/Component'
import { ProductsGridBlockComponent } from './blocks/ProductsGrid/Component'
import { PricingCardsBlockComponent } from './blocks/PricingCards/Component'
import { RosterWidgetBlockComponent } from './blocks/RosterWidget/Component'
import { SeasonBlockComponent } from './blocks/Season/Component'
import { SectionHeadingBlockComponent } from './blocks/SectionHeading/Component'
import { SponsorCardBlockComponent } from './blocks/SponsorCard/Component'
import { SponsorsBlockComponent } from './blocks/Sponsors/Component'
import { StandingsWidgetBlockComponent } from './blocks/StandingsWidget/Component'
import { StatsBlockComponent } from './blocks/Stats/Component'
import { TestimonialsBlockComponent } from './blocks/Testimonials/Component'
import { TextSectionBlockComponent } from './blocks/TextSection/Component'
import { TrainingsBlockComponent } from './blocks/Trainings/Component'

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

/** Render layoutu landing stránky (home). */
export function RenderLandingBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  return (
    <>
      {blocks.map((block, index) =>
        renderLandingBlock(block, block.id ?? `${block.blockType}-${index}`),
      )}
    </>
  )
}
