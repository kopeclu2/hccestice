import type { LandingAlbumBlock } from '@/payload-types'

import React from 'react'

import { cn } from '@/utilities/ui'

import { Badge } from '../../components/Badge'
import { MaybeLink } from '../../components/CardGrid'
import { CornerBrackets, GlowCircle } from '../../components/Decorations'
import { EmptyState } from '../../components/EmptyState'
import { CardTitle, SectionTitle } from '../../components/Heading'
import { Highlight, Kicker } from '../../components/Kicker'
import { PhotoTile, TileArrow } from '../../components/PhotoTile'
import { PillLink } from '../../components/PillLink'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { Watermark } from '../../components/Watermark'
import { relId, uploadToPhoto } from '../../data/format'
import { fetchAlbumGalleries } from '../../data/galleries'
import type { AlbumSpan, AlbumTile, GalleryCard } from '../../types'

/**
 * Rozmístění dlaždic mozaiky — 6 alb ve třech řádcích a čtyřech sloupcích:
 * dvě velké 2×2 do protilehlých rohů, kolem nich čtyři malé.
 *
 * Handoff „Modern" má místo druhé velké dvě široké 2×1, do kterých se dlouhé
 * názvy zápasů z CMS nevešly.
 *
 * Pozice třetí až šesté dlaždice jsou zadané explicitně (`col-start` /
 * `row-start`): auto-placement mezeru po první velké dlaždici nezaplní
 * a `grid-flow-dense` by pořadí dlaždic přeskládal proti řazení podle data.
 */
const MOSAIC_LAYOUT: Array<{ place: string; span: AlbumSpan }> = [
  { span: 'big', place: 'md:col-span-2 md:row-span-2' },
  { span: 'tile', place: 'md:col-start-3 md:row-start-1' },
  { span: 'tile', place: 'md:col-start-4 md:row-start-1' },
  { span: 'big', place: 'md:col-span-2 md:row-span-2 md:col-start-3 md:row-start-2' },
  { span: 'tile', place: 'md:col-start-1 md:row-start-3' },
  { span: 'tile', place: 'md:col-start-2 md:row-start-3' },
]

/**
 * Galerie → dlaždice. Overlay se řídí velikostí: velká nese sezónu jako lime
 * badge a název velkým řezem, široká název, malá štítek se sezónou (jinak
 * datem) a pod ním název drobně — handoff má na malých jen fázi soutěže
 * („Semifinále", „17. kolo"), ale bez názvu není poznat, kam dlaždice vede.
 */
function mapGalleryTiles(cards: GalleryCard[]): AlbumTile[] {
  return cards.map((card, index) => {
    const { span, place } = MOSAIC_LAYOUT[index] ?? { span: 'tile' as const, place: '' }
    return {
      span,
      place,
      photo: card.cover,
      title: card.title,
      chip: span === 'tile' ? (card.seasonLabel ?? card.dateLabel ?? null) : null,
      badge: span === 'big' ? (card.seasonLabel ?? null) : null,
      href: card.href ?? null,
      key: String(card.id),
    }
  })
}

/** Ruční dlaždice z bloku — texty i odkaz zadává správce. */
function mapManualTiles(block: LandingAlbumBlock): AlbumTile[] {
  return (block.mosaic ?? []).map((tile, index) => ({
    span: tile.span ?? 'tile',
    // ruční mozaika se skládá auto-placementem podle velikostí, které
    // správce nastavil — pevné pozice patří jen připravenému vzoru
    place: null,
    photo: uploadToPhoto(tile.photo),
    title: tile.title ?? null,
    chip: tile.chip ?? null,
    badge: null,
    href: tile.href ?? null,
    key: tile.id ?? `manual-${index}`,
  }))
}

/**
 * Fotoalbum — mozaika alb (ne fotek): každá dlaždice vede do jedné galerie.
 * Ruční mozaika z bloku má přednost, jinak se skládá z nejnovějších alb
 * s volitelně připnutým v čele.
 */
export async function AlbumBlockComponent({ block }: { block: LandingAlbumBlock }) {
  const manual = mapManualTiles(block)
  if (manual.length > 0) return <AlbumView tiles={manual} />

  const cards = await fetchAlbumGalleries({
    limit: MOSAIC_LAYOUT.length,
    pinnedId: relId(block.gallery),
  })

  return <AlbumView tiles={mapGalleryTiles(cards)} />
}

/** Rozměr dlaždice pro ruční mozaiku (bez pevné pozice — auto-placement). */
const SPAN_GRID: Record<AlbumSpan, string> = {
  big: 'md:col-span-2 md:row-span-2',
  wide: 'md:col-span-2',
  tile: '',
}

/** Radius drží fotka, ne obal odkazu — obal je průhledný a nemá co zaoblovat. */
const SPAN_RADIUS: Record<AlbumSpan, string> = {
  big: 'rounded-block',
  wide: 'rounded-thumb',
  tile: 'rounded-thumb',
}

/**
 * `sizes` podle skutečné šířky dlaždice. Jednotná hodnota velkou dlaždici
 * (polovina 97,5rem kontejneru) poddimenzovala a byla rozmazaná.
 */
const SPAN_SIZES: Record<AlbumSpan, string> = {
  big: '(max-width: 48rem) 66vw, (max-width: 97.5rem) 50vw, 48rem',
  wide: '(max-width: 48rem) 66vw, (max-width: 97.5rem) 50vw, 48rem',
  tile: '(max-width: 48rem) 66vw, 25vw',
}

/**
 * Fotoalbum — hustá mozaika alb (na mobilu horizontální carousel),
 * svislý watermark „PONÍCI" u pravého okraje.
 */
function AlbumView({ tiles }: { tiles: AlbumTile[] }) {
  // Vzor s dlaždicí 2×2 předpokládá zaplněnou mřížku; se dvěma alby by v ní
  // zůstaly děravé sloupce, proto se rozpadne na pravidelné široké dlaždice.
  const sparse = tiles.length > 0 && tiles.length < 4
  const layout = sparse
    ? tiles.map((tile) => ({ ...tile, span: 'wide' as const, place: null }))
    : tiles

  return (
    <SectionShell id="fotoalbum">
      <GlowCircle className="-right-60 -top-20 size-190" tone="lime" />
      <CornerBrackets />
      <Watermark
        className="text-club/8 top-30 -right-8 origin-top-right rotate-180 text-watermark-lg tracking-[-0.06em] [writing-mode:vertical-rl]"
        outlined={false}
      >
        PONÍCI
      </Watermark>

      <Reveal>
        <div className="mb-10 flex flex-wrap items-end gap-4">
          <div>
            <Kicker>Fotoalbum</Kicker>
            <SectionTitle className="mt-3.5">
              {/* tečka je součást kompozice (klubová zelená), ne textu — a lepí
                  se na slovo, mezera z handoffu vypadala jako sazečská chyba */}
              Sezóna očima <Highlight>fanoušků</Highlight>
              <span className="text-club">.</span>
            </SectionTitle>
          </div>
          <div className="flex-1" />
          <PillLink href="/fotogalerie" size="md" variant="dark" withArrow>
            Celé fotoalbum
          </PillLink>
        </div>
      </Reveal>

      <Reveal>
        {layout.length === 0 ? (
          <AlbumEmpty />
        ) : (
          <>
            <div
              className={cn(
                /* Odsazení pásu se musí rovnat odsazení sekce
                   (`clamp(0.875rem,3vw,2.5rem)`), jinak dlaždice na mobilu
                   nekončí na stejné svislici jako nadpis nad nimi. */
                'no-scrollbar -mx-[clamp(0.875rem,3vw,2.5rem)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[clamp(0.875rem,3vw,2.5rem)] pb-2.5 md:m-0 md:grid md:gap-4 md:overflow-visible md:p-0',
                sparse
                  ? 'md:auto-rows-[13.75rem] md:grid-cols-3'
                  : 'md:auto-rows-[11.25rem] md:grid-cols-4',
              )}
            >
              {layout.map((tile) => (
                <AlbumTileCard key={tile.key} tile={tile} />
              ))}
            </div>
          </>
        )}
      </Reveal>
    </SectionShell>
  )
}

/**
 * Jedna dlaždice mozaiky. Celá plocha je odkaz do galerie; bez `href`
 * (album bez slugu) `MaybeLink` degraduje na `div`, takže z toho nevznikne
 * mrtvý odkaz.
 */
function AlbumTileCard({ tile }: { tile: AlbumTile }) {
  return (
    <MaybeLink
      className={cn(
        /* 78 % místo 66 %: na 320px měla dlaždice 214px a po odečtení šipky
           zbylo na nadpis 122px, tedy jedno slovo na řádek. Kus další
           dlaždice pořád vykukuje, takže signál „dá se scrollovat" zůstává —
           stejný podíl používá i pás rozlosování. */
        'group h-57.5 flex-[0_0_78%] snap-center md:h-auto md:flex-none',
        tile.place ?? SPAN_GRID[tile.span],
      )}
      href={tile.href ?? undefined}
      label={tile.title ?? tile.chip ?? undefined}
    >
      <PhotoTile
        className={cn('h-full', SPAN_RADIUS[tile.span])}
        gradient={tile.span === 'big' ? 'bottom' : 'bottom-soft'}
        photo={tile.photo}
        sizes={SPAN_SIZES[tile.span]}
      >
        {tile.badge && (
          <Badge className="absolute top-3.5 left-3.5" size="xs" variant="lime">
            {tile.badge}
          </Badge>
        )}
        {tile.span === 'tile' && (tile.chip || tile.title) && (
          /* right-12: text nesmí podlézt kruh se šipkou (32 px + odsazení) */
          <div className="absolute right-12 bottom-3 left-3 flex flex-col items-start gap-1.5">
            {tile.chip && (
              <Badge size="xs" variant="glass">
                {tile.chip}
              </Badge>
            )}
            {tile.title && (
              <div className="text-shadow-photo line-clamp-2 text-caption leading-snug font-bold text-white">
                {tile.title}
              </div>
            )}
          </div>
        )}
        {tile.title && tile.span === 'big' && (
          <CardTitle
            as="h3"
            /* Na mobilu o stupeň nižší řez a menší odsazení: 21px nadpis se
               v pásu lámal po slabikách („PLAY- / OFF o…"). Od `md` je
               dlaždice součástí mozaiky a platí velikost z handoffu. */
            className="absolute right-14 bottom-3.5 left-4 line-clamp-2 text-lead tracking-[-0.02em] text-white md:right-18 md:bottom-4.5 md:left-5 md:text-card-title"
            size="sm"
          >
            {tile.title}
          </CardTitle>
        )}
        {tile.title && tile.span === 'wide' && (
          <div className="absolute right-15 bottom-3.5 left-4 line-clamp-2 text-body font-bold text-white">
            {tile.title}
          </div>
        )}
        {tile.href && (
          <TileArrow
            className={tile.span === 'big' ? 'right-4 bottom-4' : 'right-3.5 bottom-3'}
            size={tile.span === 'big' ? 'lg' : 'sm'}
          />
        )}
      </PhotoTile>
    </MaybeLink>
  )
}

/**
 * Prázdné fotoalbum. Znění i cesta dál se drží prázdného stavu výpisu
 * (`fotogalerie/GalleryGrid.tsx`), aby web mluvil jedním hlasem; `mailto:`
 * z handoffu by obešel kontaktní formulář a jeho ochranu reCAPTCHOU.
 */
function AlbumEmpty() {
  return (
    <EmptyState
      /* jen jedna cesta dál — „Celé fotoalbum" už stojí v hlavičce sekce
         a bez alb by vedlo na stejně prázdný výpis */
      actions={
        <PillLink href="/#kontakt" size="md" variant="dark" withArrow>
          Poslat fotky
        </PillLink>
      }
      icon="photos"
      title="Fotoalbum se teprve plní"
      titleAs="h3"
    >
      Máte fotky ze zápasů nebo z akcí klubu? Pošlete nám je, rádi je zveřejníme.
    </EmptyState>
  )
}
