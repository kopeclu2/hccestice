import {
  AlignFeature,
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  ChecklistFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  RelationshipFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  TextStateFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
  type LinkFields,
} from '@payloadcms/richtext-lexical'
import type { TextFieldSingleValidation } from 'payload'

import { Banner } from '@/landing/blocks/Banner/config'
import { Code } from '@/landing/blocks/Code/config'
import { MediaBlock } from '@/landing/blocks/MediaBlock/config'
import { YouTube } from '@/landing/blocks/YouTube/config'
import { linkUrlValidator } from '@/lib/linkUrl'

import { CtaBannerBlock } from '../landing/blocks/CtaBanner/config'
import { DataTableBlock } from '../landing/blocks/DataTable/config'
import { DownloadsWidget } from '../landing/blocks/Downloads/config'
import { GalleryEmbedWidget } from '../landing/blocks/GalleryEmbed/config'
import { GalleryLinkWidget } from '../landing/blocks/GalleryLink/config'
import { MatchCardWidget } from '../landing/blocks/MatchCard/config'
import { MatchesPickerWidget } from '../landing/blocks/MatchesPicker/config'
import { MatchesWidget } from '../landing/blocks/MatchesWidget/config'
import { MatchFormWidget } from '../landing/blocks/MatchForm/config'
import { MatchLineupWidget } from '../landing/blocks/MatchLineup/config'
import { MatchPenaltiesWidget } from '../landing/blocks/MatchPenalties/config'
import { MatchScoreboardWidget } from '../landing/blocks/MatchScoreboard/config'
import { MatchScorersWidget } from '../landing/blocks/MatchScorers/config'
import { MatchSummaryWidget } from '../landing/blocks/MatchSummary/config'
import { MatchTimelineWidget } from '../landing/blocks/MatchTimeline/config'
import { NextMatchWidget } from '../landing/blocks/NextMatchWidget/config'
import { StandingsWidget } from '../landing/blocks/StandingsWidget/config'
import { StatCardsBlock } from '../landing/blocks/StatCards/config'

import { TEXT_STATE } from './textStateColors'

/**
 * Výchozí rich text editor pro celý web — plná výbava:
 *
 * - formátování: tučné/kurzíva/podtržení/přeškrtnutí, horní/dolní index,
 *   inline kód, barvy textu a zvýraznění (klubová paleta)
 * - struktura: nadpisy H2–H4, seznamy (číslované, odrážkové, checklisty),
 *   citace, oddělovač, zarovnání, odsazení, tabulky
 * - vkládání: odkazy (interní i externí, včetně galerií), obrázky z médií,
 *   relace na dokumenty (včetně zápasů) a bloky (obrázek, video, banner,
 *   kód, CTA banner, vložená galerie, odkaz na galerii, dokumenty ke
 *   stažení, widgety zápasů: karta, tabule, střelci, tresty, průběh, souhrn,
 *   soupiska, forma, nejbližší zápas, tabulka, výběr zápasů)
 * - UI: pevná lišta nahoře + plovoucí lišta nad výběrem textu
 */
export const defaultLexical = lexicalEditor({
  features: [
    // struktura
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    UnorderedListFeature(),
    OrderedListFeature(),
    ChecklistFeature(),
    BlockquoteFeature(),
    HorizontalRuleFeature(),
    AlignFeature(),
    IndentFeature(),
    EXPERIMENTAL_TableFeature(),

    // formátování textu
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    SubscriptFeature(),
    SuperscriptFeature(),
    InlineCodeFeature(),
    // definice barev/zvýraznění je sdílená s FE converterem (viz textStateColors.ts)
    TextStateFeature({ state: TEXT_STATE }),

    // vkládání
    LinkFeature({
      enabledCollections: ['pages', 'posts', 'galleries', 'matches'],
      fields: ({ defaultFields }) => {
        const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
          if ('name' in field && field.name === 'url') return false
          return true
        })

        return [
          ...defaultFieldsWithoutUrl,
          {
            name: 'url',
            type: 'text',
            admin: {
              condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
            },
            label: ({ t }) => t('fields:enterURL'),
            required: true,
            validate: ((value, options) => {
              if ((options?.siblingData as LinkFields)?.linkType === 'internal') {
                return true // no validation needed, as no url should exist for internal links
              }
              // Whitelist schémat (`lib/linkUrl`): `javascript:` v odkazu z rich
              // textu by se spustil kliknutím návštěvníka.
              return linkUrlValidator({ required: true })(value as string | null | undefined)
            }) as TextFieldSingleValidation,
          },
        ]
      },
    }),
    UploadFeature({
      collections: {
        media: { fields: [] },
      },
    }),
    /* Zápas má detail `/zapasy/[slug]`, takže jde odkázat i vložit jako
       relaci (viz `RelationshipConverter` v `components/RichText/Server.tsx`). */
    RelationshipFeature({ enabledCollections: ['pages', 'posts', 'galleries', 'matches'] }),
    BlocksFeature({
      blocks: [
        MediaBlock,
        YouTube,
        Banner,
        Code,
        CtaBannerBlock,
        DataTableBlock,
        GalleryEmbedWidget,
        GalleryLinkWidget,
        DownloadsWidget,
        StatCardsBlock,
        // widgety zápasů (serverové konvertory v `components/RichText/Server.tsx`)
        MatchCardWidget,
        MatchScoreboardWidget,
        MatchScorersWidget,
        MatchPenaltiesWidget,
        MatchTimelineWidget,
        MatchSummaryWidget,
        MatchLineupWidget,
        MatchFormWidget,
        NextMatchWidget,
        StandingsWidget,
        MatchesPickerWidget,
        MatchesWidget,
      ],
    }),

    // toolbary
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})
