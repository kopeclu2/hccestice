import type { TextFieldSingleValidation } from 'payload'
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

import { Banner } from '../blocks/Banner/config'
import { TEXT_STATE } from './textStateColors'
import { Code } from '../blocks/Code/config'
import { MediaBlock } from '../blocks/MediaBlock/config'
import { YouTube } from '../blocks/YouTube/config'
import { CtaBannerBlock } from '../landing/blocks/CtaBanner/config'
import { DataTableBlock } from '../landing/blocks/DataTable/config'
import { DownloadsWidget } from '../landing/blocks/Downloads/config'
import { GalleryEmbedWidget } from '../landing/blocks/GalleryEmbed/config'
import { StatCardsBlock } from '../landing/blocks/StatCards/config'

/**
 * Výchozí rich text editor pro celý web — plná výbava:
 *
 * - formátování: tučné/kurzíva/podtržení/přeškrtnutí, horní/dolní index,
 *   inline kód, barvy textu a zvýraznění (klubová paleta)
 * - struktura: nadpisy H2–H4, seznamy (číslované, odrážkové, checklisty),
 *   citace, oddělovač, zarovnání, odsazení, tabulky
 * - vkládání: odkazy (interní i externí), obrázky z médií, relace
 *   na dokumenty a bloky (obrázek, video, banner, kód, CTA banner,
 *   vložená galerie, dokumenty ke stažení)
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
      enabledCollections: ['pages', 'posts'],
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
              return value ? true : 'URL is required'
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
    RelationshipFeature({ enabledCollections: ['pages', 'posts', 'matches', 'galleries'] }),
    BlocksFeature({
      blocks: [
        MediaBlock,
        YouTube,
        Banner,
        Code,
        CtaBannerBlock,
        DataTableBlock,
        GalleryEmbedWidget,
        DownloadsWidget,
        StatCardsBlock,
      ],
    }),

    // toolbary
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})
