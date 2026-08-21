import type { Page } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

/**
 * Katalog widgetů pro dokumentační stránku `/widgety`.
 *
 * Každá položka popisuje jeden blok (co dělá, odkud bere data, jak ho
 * použít v adminu) a nese ukázková data bloku. Relace v ukázkách se
 * plní skutečnými dokumenty z CMS za běhu (`resolveExampleIds`),
 * takže katalog nikdy neukazuje rozbité příklady.
 */

type LayoutBlock = Page['layout'][number]

export type WidgetDoc = {
  /** Název pro nadpis karty. */
  name: string
  /** Slug bloku — pod tímto názvem ho admin najde ve výběru bloků. */
  blockType: string
  /** Co widget dělá (1–2 věty). */
  description: string
  /** Odkud bere obsah. */
  dataSource: string
  /** Jak ho použít — nastavení polí v adminu. */
  usage: string
  /** Ukázková data bloku (živý render pod kartou). */
  example: LayoutBlock
}

export type WidgetCategory = {
  title: string
  perex: string
  widgets: WidgetDoc[]
}

/** Reálné id dokumentů pro ukázky (první vhodný dokument z kolekce). */
export const resolveExampleIds = cache(async () => {
  const payload = await getPayload({ config: configPromise })

  const [player, players, match, matches, person, gallery, sponsor, post, pdfs, photo, product] =
    await Promise.all([
      payload.find({ collection: 'players', where: { photo: { exists: true } }, limit: 1, depth: 0 }),
      payload.find({ collection: 'players', where: { photo: { exists: true } }, limit: 3, depth: 0 }),
      payload.find({ collection: 'matches', where: { status: { equals: 'played' } }, sort: '-date', limit: 1, depth: 0 }),
      payload.find({ collection: 'matches', where: { status: { equals: 'played' } }, sort: '-date', limit: 3, depth: 0 }),
      payload.find({ collection: 'people', limit: 1, depth: 0 }),
      payload.find({ collection: 'galleries', where: { date: { exists: true } }, sort: '-date', limit: 1, depth: 0 }),
      payload.find({ collection: 'sponsors', where: { and: [{ active: { equals: true } }, { logo: { exists: true } }] }, limit: 1, depth: 0 }),
      payload.find({ collection: 'posts', where: { _status: { equals: 'published' } }, sort: '-publishedAt', limit: 1, depth: 0 }),
      payload.find({ collection: 'media', where: { mimeType: { like: 'application/pdf' } }, limit: 2, depth: 0 }),
      payload.find({ collection: 'media', where: { filename: { equals: 'p3080654.jpg' } }, limit: 1, depth: 0 }),
      payload.find({ collection: 'products', where: { available: { equals: true } }, sort: 'order', limit: 1, depth: 0 }),
    ])

  return {
    playerId: player.docs[0]?.id,
    playerIds: players.docs.map((doc) => doc.id),
    matchId: match.docs[0]?.id,
    matchIds: matches.docs.map((doc) => doc.id),
    personId: person.docs[0]?.id,
    galleryId: gallery.docs[0]?.id,
    sponsorId: sponsor.docs[0]?.id,
    postId: post.docs[0]?.id,
    pdfIds: pdfs.docs.map((doc) => doc.id),
    photoId: photo.docs[0]?.id,
    productId: product.docs[0]?.id,
  }
})

type ExampleIds = Awaited<ReturnType<typeof resolveExampleIds>>

/** Sestaví katalog s ukázkami napojenými na reálné dokumenty. */
export function buildWidgetCatalog(ids: ExampleIds): WidgetCategory[] {
  return [
    {
      title: 'Stavební bloky',
      perex:
        'Obecné bloky pro skládání libovolných stránek — nadpisy, texty, fotky a výzvy k akci. Obsah píšeš přímo do polí bloku.',
      widgets: [
        {
          name: 'Nadpis sekce',
          blockType: 'sectionHeading',
          description: 'Uvozuje sekci stránky: pill štítek, nadpis s lime zvýrazněním, perex a volitelné tlačítko vpravo.',
          dataSource: 'Vše z polí bloku.',
          usage: 'Vyplň nadpis; „Zvýrazněná část" se podbarví lime. Tlačítko se zobrazí jen s textem i cílem zároveň.',
          example: {
            blockType: 'sectionHeading',
            kicker: 'Štítek',
            title: 'Nadpis sekce se',
            titleHighlight: 'zvýrazněním',
            perex: 'Perex pod nadpisem — krátké uvedení do sekce.',
            ctaLabel: 'Tlačítko',
            ctaHref: '#',
          } as LayoutBlock,
        },
        {
          name: 'Textová sekce',
          blockType: 'textSection',
          description: 'Formátovaný text (nadpisy, odkazy, seznamy) v bílé kartě nebo přímo na pozadí.',
          dataSource: 'Rich text editor v bloku.',
          usage: 'Napiš obsah v editoru; přepínačem „Vzhled" zvolíš bílou kartu, nebo text bez karty.',
          example: {
            blockType: 'textSection',
            appearance: 'card',
            content: {
              root: {
                type: 'root', format: '', indent: 0, version: 1, direction: null,
                children: [
                  { type: 'heading', tag: 'h3', version: 1, children: [{ type: 'text', text: 'Ukázka textové sekce', version: 1 }] },
                  { type: 'paragraph', version: 1, children: [{ type: 'text', text: 'Libovolný formátovaný obsah — odstavce, seznamy, odkazy. Hodí se pro delší texty na podstránkách (historie, pravidla, informace pro rodiče…).', version: 1 }] },
                ],
              },
            },
          } as unknown as LayoutBlock,
        },
        {
          name: 'Fotokarty',
          blockType: 'photoCards',
          description: 'Mřížka 1–3 fotokaret se štítky, popiskem a volitelným odkazem.',
          dataSource: 'Fotky z knihovny médií, texty z polí bloku.',
          usage: 'Přidej karty (fotka + štítky + popisek), zvol počet sloupců a výšku karet.',
          example: {
            blockType: 'photoCards',
            columns: '2',
            height: 'sm',
            cards: [
              { photo: ids.photoId, tag: 'Štítek', caption: 'Popisek karty dole' },
              { photo: ids.photoId, tag: 'Druhá', badge: 'Lime štítek', caption: 'Karta s oběma štítky' },
            ],
          } as LayoutBlock,
        },
        {
          name: 'Tabulka (data)',
          blockType: 'dataTable',
          description:
            'Obecná datová tabulka — rozpisy, výsledky, ceníky. Čísla se zarovnají doprava, vybrané řádky lze zvýraznit.',
          dataSource: 'Text v bloku — vlož data přímo z Excelu (buňky oddělené tabulátorem/středníkem).',
          usage:
            'Zkopíruj tabulku z Excelu do pole Data; zaškrtni „První řádek je záhlaví"; volitelně zadej text pro zvýraznění řádků (např. „Čestice").',
          example: {
            blockType: 'dataTable',
            title: 'Tabulka (ukázka)',
            data: 'Kolo; Datum; Soupeř; Skóre\n1.; 12. 10.; HC Skuteč; 3:2\n2.; 19. 10.; Rebels Polička; 5:1\n3.; 26. 10.; HC Čestice B; 2:4',
            firstRowHeader: true,
            numericRight: true,
            highlight: 'Čestice',
            caption: 'Ukázková data — vložená přímo z tabulkového editoru.',
          } as LayoutBlock,
        },
        {
          name: 'CTA banner',
          blockType: 'ctaBanner',
          description: 'Výrazná zelená/tmavá karta s titulkem, textem a tlačítkem — výzva k akci (nábor, brigáda…).',
          dataSource: 'Vše z polí bloku; volitelná fotka na pozadí (ztmavená).',
          usage: 'Vyplň titulek a tlačítko; „Barva" přepíná zelenou/tmavou; fotka na pozadí je volitelná.',
          example: {
            blockType: 'ctaBanner',
            kicker: 'Výzva k akci',
            title: 'Tohle je CTA banner',
            text: 'Doplňkový text pod titulkem. Tlačítko vede kamkoli — na kotvu i podstránku.',
            ctaLabel: 'Akce',
            ctaHref: '#',
            tone: 'green',
            photo: ids.photoId,
          } as LayoutBlock,
        },
      ],
    },
    {
      title: 'Automatické widgety',
      perex:
        'Obsah si načítají samy z kolekcí podle filtrů — publikuješ článek/zápas/galerii a widget se aktualizuje sám. Prázdný filtr sezóny = aktuální sezóna.',
      widgets: [
        {
          name: 'Zápasy',
          blockType: 'matchesWidget',
          description: 'Seznam zápasů — výsledky (lime skóre vč. sn/pp) nebo rozpis (štítky Doma/Venku).',
          dataSource: 'Kolekce Zápasy.',
          usage: 'Zvol režim Výsledky/Rozpis, případně sezónu, tým a počet.',
          example: { blockType: 'matchesWidget', title: 'Poslední výsledky', mode: 'results', limit: 3 } as LayoutBlock,
        },
        {
          name: 'Nejbližší zápas (countdown)',
          blockType: 'nextMatchWidget',
          description: 'Tmavá karta s živým odpočtem do úvodního buly nejbližšího naplánovaného zápasu.',
          dataSource: 'Kolekce Zápasy (nejbližší se stavem Naplánován).',
          usage: 'Bez nastavení; text pro stav „žádný zápas" je volitelný.',
          example: { blockType: 'nextMatchWidget' } as LayoutBlock,
        },
        {
          name: 'Články',
          blockType: 'postsGrid',
          description: 'Mřížka klikacích karet nejnovějších článků (štítek, datum, titulek).',
          dataSource: 'Kolekce Články (publikované).',
          usage: 'Volitelně omez typ (novinky/reportáže), sezónu a počet.',
          example: { blockType: 'postsGrid', title: 'Nejnovější články', postType: 'all', limit: 2 } as LayoutBlock,
        },
        {
          name: 'Galerie',
          blockType: 'galleriesGrid',
          description: 'Fotokarty nejnovějších alb — cover, název, datum a počet fotek.',
          dataSource: 'Kolekce Galerie.',
          usage: 'Volitelně sezóna a počet.',
          example: { blockType: 'galleriesGrid', title: 'Nejnovější galerie', limit: 3 } as LayoutBlock,
        },
        {
          name: 'Soupiska hráčů',
          blockType: 'rosterWidget',
          description: 'Mřížka všech hráčů sezóny s portrétem, číslem dresu a postem.',
          dataSource: 'Kolekce Hráči (podle působení v sezóně).',
          usage: 'Volitelně sezóna a tým; čísla a posty se berou z působení hráče.',
          example: { blockType: 'rosterWidget', title: 'Soupiska (ukázka)' } as LayoutBlock,
        },
        {
          name: 'Produkty (merch)',
          blockType: 'productsGrid',
          description:
            'Mřížka reklamních předmětů v nabídce — fotka, cena, velikosti, poznámka. Objednací tlačítko předvyplní e-mail názvem produktu.',
          dataSource: 'Kolekce Produkty (jen „V nabídce"); e-mail z Nastavení webu.',
          usage:
            'Produkty spravuj v kolekci Hokej → Produkty. V bloku vyplň objednací instrukce aktuální kampaně (termín, co uvést).',
          example: {
            blockType: 'productsGrid',
            title: 'Reklamní předměty',
            orderInfo:
              'Objednávejte do 5. 1. e-mailem — uveďte název předmětu, velikost a počet kusů. Výroba trvá cca 3 týdny, o vyzvednutí dáme vědět.',
            ctaLabel: 'Objednat e-mailem',
          } as LayoutBlock,
        },
        {
          name: 'Tabulka ligy',
          blockType: 'standingsWidget',
          description: 'Tabulka soutěže s automaticky zvýrazněným řádkem HC Čestice.',
          dataSource: 'Dokument sezóny (Sezóny → Tabulka ligy).',
          usage: 'Tabulku edituj na sezóně, widget ji jen zobrazuje. Volitelně zvol jinou sezónu.',
          example: { blockType: 'standingsWidget' } as LayoutBlock,
        },
      ],
    },
    {
      title: 'Výběrové widgety',
      perex:
        'Zobrazují konkrétní dokumenty, které v adminu vybereš relací — jeden hráč, jeden zápas, výběr zápasů série…',
      widgets: [
        {
          name: 'Karta hráče',
          blockType: 'playerCard',
          description: 'Velká karta jednoho hráče — portrét, číslo, post a volitelná poznámka.',
          dataSource: 'Kolekce Hráči (vybraný dokument).',
          usage: 'Vyber hráče; sezóna určuje číslo dresu a post; poznámka je volitelná („Kapitán týmu").',
          example: { blockType: 'playerCard', player: ids.playerId, note: 'Ukázková poznámka na kartě hráče.' } as LayoutBlock,
        },
        {
          name: 'Vybraní hráči',
          blockType: 'playersPicker',
          description: 'Mřížka konkrétních hráčů v pořadí výběru (např. „Brankářská dvojice").',
          dataSource: 'Kolekce Hráči (vybrané dokumenty).',
          usage: 'Vyber hráče a seřaď je tažením; pořadí na webu odpovídá pořadí výběru.',
          example: { blockType: 'playersPicker', title: 'Vybraní hráči (ukázka)', players: ids.playerIds } as LayoutBlock,
        },
        {
          name: 'Karta zápasu',
          blockType: 'matchCard',
          description: 'Velká výsledková karta — loga obou týmů, skóre (lime = výhra), datum, soutěž, odkaz na reportáž.',
          dataSource: 'Kolekce Zápasy (vybraný dokument); logo z kolekce Soupeři.',
          usage: 'Vyber zápas; štítek nahoře je volitelný („Historický bronz").',
          example: { blockType: 'matchCard', match: ids.matchId, kicker: 'Ukázkový zápas' } as LayoutBlock,
        },
        {
          name: 'Vybrané zápasy',
          blockType: 'matchesPicker',
          description: 'Seznam konkrétních zápasů v pořadí výběru — např. celá série play-off.',
          dataSource: 'Kolekce Zápasy (vybrané dokumenty).',
          usage: 'Vyber zápasy a seřaď je; nadpis karty je volitelný.',
          example: { blockType: 'matchesPicker', title: 'Vybrané zápasy (ukázka)', matches: ids.matchIds } as LayoutBlock,
        },
        {
          name: 'Karta osoby (kontakt)',
          blockType: 'personCard',
          description: 'Kontaktní karta — portrét, role a klikací telefon/e-mail.',
          dataSource: 'Kolekce Lidé v klubu (vybraný dokument).',
          usage: 'Jen vyber osobu; kontakty se berou z jejího záznamu.',
          example: { blockType: 'personCard', person: ids.personId } as LayoutBlock,
        },
        {
          name: 'Vložená galerie',
          blockType: 'galleryEmbed',
          description: 'Mřížka prvních N fotek konkrétního alba.',
          dataSource: 'Kolekce Galerie (vybraný dokument).',
          usage: 'Vyber galerii a počet fotek; nadpis je volitelný (jinak název galerie).',
          example: { blockType: 'galleryEmbed', gallery: ids.galleryId, title: 'Vložená galerie (ukázka)', limit: 4 } as LayoutBlock,
        },
        {
          name: 'Vypíchnutý článek',
          blockType: 'postFeature',
          description: 'Velká fotokarta jednoho článku — štítek, datum, titulek, perex; klikací na detail.',
          dataSource: 'Kolekce Články (vybraný dokument).',
          usage: 'Vyber článek; náhradní fotka se použije, když článek nemá vlastní obrázek.',
          example: { blockType: 'postFeature', post: ids.postId, fallbackPhoto: ids.photoId, tag: 'Ukázka' } as LayoutBlock,
        },
        {
          name: 'Karta produktu',
          blockType: 'productCard',
          description: 'Vypíchne jeden reklamní předmět — např. novinku v nabídce.',
          dataSource: 'Kolekce Produkty (vybraný dokument).',
          usage: 'Vyber produkt; štítek nahoře je volitelný („Novinka v nabídce").',
          example: {
            blockType: 'productCard',
            product: ids.productId,
            kicker: 'Z klubové nabídky',
          } as LayoutBlock,
        },
        {
          name: 'Karta sponzora',
          blockType: 'sponsorCard',
          description: 'Spotlight partnera — logo, jméno, poděkování a odkaz na web.',
          dataSource: 'Kolekce Sponzoři (vybraný dokument).',
          usage: 'Vyber sponzora; štítek a text poděkování jsou volitelné.',
          example: { blockType: 'sponsorCard', sponsor: ids.sponsorId, kicker: 'Partner klubu', note: 'Ukázkový text poděkování partnerovi.' } as LayoutBlock,
        },
      ],
    },
    {
      title: 'Marketing widgety',
      perex:
        'Bloky pro náborové a informační stránky — benefity, ohlasy, příspěvky, dokumenty, mapa, oznámení a externí obsah.',
      widgets: [
        {
          name: 'Feature grid („Proč k nám")',
          blockType: 'featureGrid',
          description: 'Dlaždice s ikonou, titulkem a textem — benefity klubu.',
          dataSource: 'Vše z polí bloku; ikony z připraveného výběru (12 ikon).',
          usage: 'Přidej dlaždice, ke každé zvol ikonu z nabídky.',
          example: {
            blockType: 'featureGrid',
            title: 'Feature grid (ukázka)',
            items: [
              { icon: 'shield', title: 'Výstroj půjčíme', text: 'Na první zkoušky nepotřebuješ nic.' },
              { icon: 'clock', title: 'Trénink 2× týdně', text: 'Úterý a pátek v Rychnově.' },
              { icon: 'trophy', title: 'Hrajeme o poháry', text: 'Bronz v play-off 2025/26.' },
            ],
          } as LayoutBlock,
        },
        {
          name: 'Ohlasy',
          blockType: 'testimonials',
          description: 'Citátové karty hráčů, rodičů a fanoušků — sociální důkaz pro nábor.',
          dataSource: 'Vše z polí bloku (citát, jméno, role, volitelná fotka).',
          usage: 'Přidej ohlasy; bez fotky se zobrazí kroužek s iniciálou.',
          example: {
            blockType: 'testimonials',
            title: 'Ohlasy (ukázka)',
            items: [
              { quote: 'Nikdy jsem nehrál závodně a kluci mě vzali mezi sebe.', name: 'Tomáš', role: 'hráč' },
              { quote: 'Syn začal v šesti letech a strašně ho to baví.', name: 'Markéta', role: 'maminka' },
            ],
          } as LayoutBlock,
        },
        {
          name: 'Členské příspěvky',
          blockType: 'pricingCards',
          description: 'Cenové karty s výčtem, co příspěvek zahrnuje; zvýrazněná karta je klubově zelená.',
          dataSource: 'Vše z polí bloku.',
          usage: 'Přidej karty (název, cena, položky ✓); „Zvýraznit" udělá kartu zelenou.',
          example: {
            blockType: 'pricingCards',
            title: 'Příspěvky (ukázka)',
            cards: [
              { name: 'Mládež', price: '1 500 Kč', period: 'za sezónu', features: [{ text: 'První měsíc zdarma' }, { text: 'Výstroj v ceně' }], highlighted: true, ctaLabel: 'Přihlásit', ctaHref: '#' },
              { name: 'Muži', price: '3 000 Kč', period: 'za sezónu', features: [{ text: 'Led 2× týdně' }, { text: 'Zápasy VČHL' }], highlighted: false },
            ],
          } as LayoutBlock,
        },
        {
          name: 'Dokumenty ke stažení',
          blockType: 'downloads',
          description: 'Seznam souborů se štítkem typu (PDF…), velikostí a download tlačítkem.',
          dataSource: 'Knihovna médií (vybrané soubory).',
          usage: 'Přidej soubory z médií; popisek je volitelný (jinak název souboru).',
          example: {
            blockType: 'downloads',
            title: 'Dokumenty (ukázka)',
            items: ids.pdfIds.map((id, index) => ({ file: id, label: index === 0 ? 'Ukázkový dokument' : undefined })),
          } as LayoutBlock,
        },
        {
          name: 'Mapa (Kde nás najdete)',
          blockType: 'mapEmbed',
          description: 'Vložená mapa v zaoblené kartě + adresní pilulky pod ní.',
          dataSource: 'Embed URL z Mapy.cz / Google Maps.',
          usage: 'Vlož URL mapy (návod přímo u pole v adminu) a přidej adresní pilulky.',
          example: {
            blockType: 'mapEmbed',
            title: 'Mapa (ukázka)',
            embedUrl: 'https://maps.google.com/maps?q=Zimn%C3%AD%20stadion%20Rychnov%20nad%20Kn%C4%9B%C5%BEnou&output=embed',
            pills: [{ text: 'ZS Rychnov nad Kněžnou' }],
          } as LayoutBlock,
        },
        {
          name: 'Oznámení',
          blockType: 'announcement',
          description: 'Barevný pruh s megafonem — zrušený trénink, změna času… Volitelně zavíratelný křížkem.',
          dataSource: 'Vše z polí bloku.',
          usage: 'Napiš text, zvol typ (zelená informace / lime upozornění), volitelně přidej odkaz.',
          example: {
            blockType: 'announcement',
            tone: 'warning',
            text: 'Ukázkové oznámení — tady bývá zrušený trénink nebo změna času.',
            linkLabel: 'Více',
            linkHref: '#',
            dismissible: true,
          } as LayoutBlock,
        },
        {
          name: 'Externí obsah (iframe)',
          blockType: 'externalEmbed',
          description: 'Vloží cizí stránku — FB feed, průběžnou tabulku na ahl.cz…',
          dataSource: 'Externí URL.',
          usage: 'Vlož URL a nastav výšku. Pozor: některé weby vkládání zakazují (zobrazí se prázdno).',
          example: {
            blockType: 'externalEmbed',
            title: 'Externí obsah (ukázka — tabulka ahl.cz)',
            url: 'https://www.ahl.cz/soutez/vychodoceska_hokejova_liga/tabulky/',
            height: 400,
          } as LayoutBlock,
        },
      ],
    },
  ]
}
