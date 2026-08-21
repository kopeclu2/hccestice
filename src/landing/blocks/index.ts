import type { Block } from 'payload'

import { LandingAlbum } from './Album/config'
import { AnnouncementWidget } from './Announcement/config'
import { LandingClub } from './Club/config'
import { LandingContact } from './Contact/config'
import { CtaBannerBlock } from './CtaBanner/config'
import { DataTableBlock } from './DataTable/config'
import { DownloadsWidget } from './Downloads/config'
import { ExternalEmbedWidget } from './ExternalEmbed/config'
import { LandingFaq } from './Faq/config'
import { FeatureGridWidget } from './FeatureGrid/config'
import { GalleriesGridWidget } from './GalleriesGrid/config'
import { GalleryEmbedWidget } from './GalleryEmbed/config'
import { LandingHero } from './Hero/config'
import { LandingHeroModern } from './HeroModern/config'
import { LandingHistory } from './History/config'
import { MapEmbedWidget } from './MapEmbed/config'
import { MatchCardWidget } from './MatchCard/config'
import { MatchesPickerWidget } from './MatchesPicker/config'
import { MatchesWidget } from './MatchesWidget/config'
import { LandingNews } from './News/config'
import { NextMatchWidget } from './NextMatchWidget/config'
import { LandingPeople } from './People/config'
import { PersonCardWidget } from './PersonCard/config'
import { PhotoCardsBlock } from './PhotoCards/config'
import { PlayerCardWidget } from './PlayerCard/config'
import { PlayersPickerWidget } from './PlayersPicker/config'
import { PostFeatureWidget } from './PostFeature/config'
import { PostsGridWidget } from './PostsGrid/config'
import { ProductCardWidget } from './ProductCard/config'
import { ProductsGridWidget } from './ProductsGrid/config'
import { PricingCardsWidget } from './PricingCards/config'
import { RosterWidget } from './RosterWidget/config'
import { LandingSeason } from './Season/config'
import { SectionHeadingBlock } from './SectionHeading/config'
import { SponsorCardWidget } from './SponsorCard/config'
import { LandingSponsors } from './Sponsors/config'
import { StandingsWidget } from './StandingsWidget/config'
import { LandingStats } from './Stats/config'
import { TestimonialsWidget } from './Testimonials/config'
import { TextSectionBlock } from './TextSection/config'
import { LandingTrainings } from './Trainings/config'

/**
 * Registry landing bloků pro kolekci Pages (layout builder).
 *
 * Pořadí = pořadí v admin výběru: sekce homepage → stavební bloky →
 * automatické widgety → výběrové widgety → marketing widgety.
 * Každý blok žije ve své složce: `config.ts` + `Component.tsx`
 * (render mapa je v `src/landing/render.tsx`).
 */
export const landingBlocks: Block[] = [
  // sekce homepage
  LandingHero,
  LandingHeroModern,
  LandingNews,
  LandingSeason,
  LandingStats,
  LandingTrainings,
  LandingClub,
  LandingAlbum,
  LandingHistory,
  LandingPeople,
  LandingSponsors,
  LandingFaq,
  LandingContact,
  // stavební bloky
  SectionHeadingBlock,
  TextSectionBlock,
  PhotoCardsBlock,
  CtaBannerBlock,
  DataTableBlock,
  // automatické widgety
  MatchesWidget,
  NextMatchWidget,
  PostsGridWidget,
  GalleriesGridWidget,
  RosterWidget,
  StandingsWidget,
  ProductsGridWidget,
  // výběrové widgety
  PlayerCardWidget,
  PlayersPickerWidget,
  MatchCardWidget,
  MatchesPickerWidget,
  PersonCardWidget,
  GalleryEmbedWidget,
  PostFeatureWidget,
  SponsorCardWidget,
  ProductCardWidget,
  // marketing widgety
  FeatureGridWidget,
  TestimonialsWidget,
  PricingCardsWidget,
  DownloadsWidget,
  MapEmbedWidget,
  AnnouncementWidget,
  ExternalEmbedWidget,
]
