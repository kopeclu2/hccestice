import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateLanding, revalidateLandingDelete } from '../hooks/revalidateLanding'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Médium',
    plural: 'Média',
  },
  admin: {
    group: 'Obsah',
  },
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      /**
       * Popisek pro čtečky obrazovky a obrázkové vyhledávání.
       *
       * Legacy import sem dosadil **název souboru** — 4183 z 5000 médií má
       * `alt` jako „P3082213" nebo „IMG_20170115_102333". Přepsání je
       * samostatná obsahová úloha, ručně to není v lidských silách.
       *
       * `required: true` tu **záměrně není**, i když by se nabízelo jako
       * zábrana proti dalším takovým. V Payloadu se povinnost propíše do
       * schématu jako `NOT NULL`, takže push (dev) i migrace (produkce)
       * spadnou na `column "alt" of relation "media" contains null values`
       * — čtyři média NULL mají. Zapnout to jde teprve po backfillu těch
       * čtyř hodnot a s vlastní migrací; do té doby by to shodilo start
       * aplikace.
       */
      name: 'alt',
      type: 'text',
      label: 'Popisek obrázku (alt)',
      admin: {
        description:
          'Co je na obrázku, ne název souboru. Např. „Hráči HC Čestice slaví gól proti Skutči".',
      },
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'legacy',
      type: 'group',
      admin: {
        description: 'Mapování na původní eStránky zdroj (plní import, needitovat)',
      },
      fields: [
        {
          name: 'source',
          type: 'select',
          options: [
            { label: 'Obrázek článku (/img/picture)', value: 'img_picture' },
            { label: 'Soubor (/file)', value: 'file' },
            { label: 'Fotka alba (p_photos)', value: 'photo' },
            { label: 'FTP (ostatní)', value: 'ftp' },
          ],
          index: true,
        },
        {
          name: 'legacyId',
          type: 'number',
          index: true,
          admin: { description: 'id v původní tabulce (s_pictures / s_files / p_photos)' },
        },
        {
          name: 'legacyPath',
          type: 'text',
          admin: { description: 'Původní cesta (např. /img/picture/3/foto.jpg)' },
        },
      ],
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    /**
     * Bez whitelistu šel nahrát libovolný typ souboru — včetně `image/svg+xml`,
     * které prohlížeč při přímém otevření `/api/media/file/:jmeno` vykreslí a
     * spustí vložený `<script>` (stored XSS z účtu přihlášeného editora).
     * Seznam odpovídá reálným typům v produkční databázi
     * (`select distinct mime_type from media`) + `image/webp` pro budoucí
     * uploady. Velikost souboru hlídá `upload.limits.fileSize`
     * v `payload.config.ts` — tam je globální pro všechny upload kolekce.
     */
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/tiff',
      'image/x-icon',
      'application/pdf',
      'audio/mpeg',
      'application/msword',
      'application/x-cfb',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    /**
     * Payload servíruje soubory přes `/api/media/file/:filename` a
     * **žádnou cache hlavičku nenastavuje** (ověřeno v
     * `node_modules/payload/dist/uploads/endpoints/getFile.js` — jen
     * `Content-Type`, `Content-Length` a `Accept-Ranges`). Důsledky byly
     * dva: prohlížeč si originál necachoval vůbec a `next/image` bral
     * `max(minimumCacheTTL, upstream max-age)`, tedy jen default Next 16
     * = 4 hodiny. Každé 4 hodiny tak sharp na 3,7GB boxu bez swapu
     * překódovával všechny varianty znovu.
     *
     * `immutable` je bezpečné jen proto, že URL nese verzi: `ImageMedia`
     * i `PhotoMasonry` přilepují `?<updatedAt>` (`getMediaUrl`). Kdyby
     * někde vznikl odkaz bez ní, výměna souboru pod stejným názvem by se
     * návštěvníkům rok neprojevila.
     */
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      return headers
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
  /**
   * Výměna souboru nebo přepis `alt` se dřív neprojevila nikde: kolekce
   * neměla revalidační hook, takže prerenderované stránky nesly starý
   * obrázek až do vypršení ISR (u `/[slug]` do dalšího deploye).
   *
   * Hromadný upload z adminu tímhle pošle tolik invalidací, kolik je
   * souborů — je to ale jen označení tagů za neplatné, ne přerender.
   * Importní skripty to vypínají přes `context.disableRevalidate`.
   */
  hooks: {
    afterChange: [revalidateLanding],
    afterDelete: [revalidateLandingDelete],
  },
}
