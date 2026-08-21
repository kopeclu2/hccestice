import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateLanding, revalidateLandingDelete } from '../../hooks/revalidateLanding'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  labels: {
    singular: 'Článek',
    plural: 'Články',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    group: 'Obsah',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'posts',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'posts',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'Perex',
              admin: {
                description:
                  'Úvodní odstavec pod titulkem (hero varianty B a C) a fallback pro meta description.',
              },
            },
            {
              name: 'titleHighlight',
              type: 'text',
              label: 'Zvýrazněná část titulku',
              admin: {
                description:
                  'Přesná podčást titulku, která se zvýrazní (lime). Musí se v titulku vyskytovat doslova — kopírujte přesně, jinak se zvýraznění nezobrazí.',
              },
            },
            {
              name: 'photoCaption',
              type: 'text',
              label: 'Popisek fotky',
              admin: {
                description:
                  'Např. „Foto: Zimní stadion Rychnov n. K." — zobrazí se u hero varianty B.',
              },
            },
            {
              name: 'content',
              type: 'richText',
              // bez editor override — dědí plně vybavený defaultLexical
              label: false,
              required: false,
            },
            {
              name: 'legacyHtml',
              type: 'code',
              admin: {
                language: 'html',
                description:
                  'Původní HTML z eStránky (import). Zobrazuje se místo obsahu, dokud je contentType = html.',
                condition: (data) => data?.contentType === 'html',
              },
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
          ],
          label: 'Meta',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'heroVariant',
      type: 'select',
      label: 'Hero varianta',
      defaultValue: 'foto',
      options: [
        { label: 'A · Velké foto', value: 'foto' },
        { label: 'B · Rozdělené', value: 'rozdelene' },
        { label: 'C · Typografické', value: 'typograficke' },
        { label: 'D · Zelený panel', value: 'panel' },
        { label: 'E · Zápasový výsledek', value: 'zapas' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Podoba hlavičky článku. Varianta E potřebuje navázaný odehraný zápas, A/B/D hlavní fotku — bez nich se použije typografická varianta.',
      },
    },
    {
      name: 'match',
      type: 'relationship',
      relationTo: 'matches',
      label: 'Zápas',
      admin: {
        position: 'sidebar',
        description: 'Zdroj skóre pro hero variantu E · Zápasový výsledek.',
        condition: (data) => data?.heroVariant === 'zapas' || data?.type === 'report',
      },
    },
    {
      name: 'showRelated',
      type: 'checkbox',
      label: 'Zobrazit související články',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'authorPerson',
      type: 'relationship',
      relationTo: 'people',
      label: 'Autor — vizitka',
      admin: {
        position: 'sidebar',
        description:
          'Veřejná vizitka autora (jméno, role, e-mail) pod článkem. Bez výběru se zobrazí jen jméno z pole Autoři.',
      },
    },
    {
      name: 'contentType',
      type: 'select',
      defaultValue: 'richText',
      options: [
        { label: 'Rich text (nový obsah)', value: 'richText' },
        { label: 'HTML (import z eStránky)', value: 'html' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'news',
      options: [
        { label: 'Novinka', value: 'news' },
        { label: 'Reportáž ze zápasu', value: 'report' },
        { label: 'Soupiska (archiv)', value: 'roster' },
        { label: 'Rozpis zápasů (archiv)', value: 'schedule' },
        { label: 'Tabulka/výsledky (archiv)', value: 'standings' },
      ],
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'season',
      type: 'relationship',
      relationTo: 'seasons',
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'legacy',
      type: 'group',
      admin: { description: 'Původ z eStránky (plní import)' },
      fields: [
        { name: 'articleId', type: 'number', index: true },
        { name: 'url', type: 'text', admin: { description: 'Původní slug/URL' } },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'role',
          type: 'text',
        },
        {
          name: 'email',
          type: 'text',
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    // revalidateLanding: homepage zobrazuje nejnovější články (blok Aktuality)
    afterChange: [revalidatePost, revalidateLanding],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete, revalidateLandingDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
