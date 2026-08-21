/**
 * Ukázková dynamická stránka /ukazka-sekci — demonstruje skládání
 * stránek z landing + obecných bloků v adminu (layout builder).
 *
 * Spuštění: bun --env-file=.env migration/make-sections-demo.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })
const ctx = { disableRevalidate: true }

const old = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'ukazka-sekci' } },
  limit: 1,
  depth: 0,
  draft: true,
})
if (old.docs[0]) {
  await payload.delete({ collection: 'pages', id: old.docs[0].id, context: ctx })
}

const photo = async (filename: string) =>
  (
    await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]?.id

const paragraph = (text: string) => ({
  type: 'paragraph',
  version: 1,
  children: [{ type: 'text', text, version: 1 }],
})

await payload.create({
  collection: 'pages',
  depth: 0,
  data: {
    title: 'Ukázka sekcí (stavebnice)',
    slug: 'ukazka-sekci',
    generateSlug: false,
    hero: { type: 'none' },
    layout: [
      {
        blockType: 'sectionHeading',
        kicker: 'Stavebnice',
        title: 'Takhle se skládá',
        titleHighlight: 'stránka',
        perex: 'Každá sekce je blok — v adminu je přidáš, přeskládáš nebo smažeš.',
        ctaLabel: 'Zpět na úvod',
        ctaHref: '/',
      },
      {
        blockType: 'textSection',
        appearance: 'card',
        content: {
          root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            direction: null,
            children: [
              {
                type: 'heading',
                tag: 'h2',
                version: 1,
                children: [{ type: 'text', text: 'Textová sekce', version: 1 }],
              },
              paragraph(
                'Libovolný formátovaný text (Lexical editor) — nadpisy, odkazy, seznamy. Volitelně v bílé kartě, nebo přímo na pozadí stránky.',
              ),
            ],
          },
        },
      },
      {
        blockType: 'photoCards',
        columns: '3',
        height: 'md',
        cards: [
          {
            photo: await photo('p3080395.jpg'),
            tag: 'Domácí led',
            caption: 'Zimní stadion Rychnov nad Kněžnou',
          },
          {
            photo: await photo('p3081907.jpg'),
            tag: 'Mládež',
            badge: 'Nábor',
            caption: 'Úterky patří dětem i mužům',
          },
          {
            photo: await photo('p3080654.jpg'),
            tag: 'Tréninky',
            caption: 'Dvakrát týdně na ledě',
            href: '/#treninky',
          },
        ],
      },
      {
        blockType: 'ctaBanner',
        kicker: 'Sezóna 2026/27',
        title: 'Přijď si zahrát — nábor je otevřený',
        text: 'Výstroj půjčíme, zbytek doučíme. Napiš nám a přijď na úterní trénink.',
        ctaLabel: 'Chci hrát',
        ctaHref: '/#kontakt',
        tone: 'green',
        photo: await photo('p3080422.jpg'),
      },
      { blockType: 'landingStats', season: null, seasonLabel: null, items: [] },
      // ── datové widgety ──
      { blockType: 'nextMatchWidget', note: null },
      {
        blockType: 'matchesWidget',
        title: 'Poslední výsledky',
        mode: 'results',
        season: null,
        team: null,
        limit: 5,
      },
      { blockType: 'postsGrid', title: 'Ze života klubu', postType: 'all', season: null, limit: 4 },
      { blockType: 'galleriesGrid', title: 'Nejnovější galerie', season: null, limit: 3 },
      { blockType: 'rosterWidget', title: 'Soupiska 2025/26', season: null, team: null },
      { blockType: 'standingsWidget', season: null },
      // ── výběrové widgety (konkrétní dokumenty) ──
      {
        blockType: 'playerCard',
        player: (await payload.find({ collection: 'players', where: { name: { equals: 'Lukáš Beránek' } }, limit: 1, depth: 0 })).docs[0]?.id,
        season: null,
        note: 'Předseda oddílu a vedoucí mužstva — na ledě i v šatně.',
      },
      {
        blockType: 'playersPicker',
        title: 'Brankářská dvojice',
        players: (
          await payload.find({ collection: 'players', where: { name: { in: ['Jakub Sajdl', 'Martin Mráz'] } }, limit: 2, depth: 0 })
        ).docs.map((p) => p.id),
        season: null,
      },
      {
        blockType: 'matchCard',
        match: (await payload.find({ collection: 'matches', where: { date: { greater_than: '2026-03-07' } }, sort: 'date', limit: 1, depth: 0 })).docs[0]?.id,
        kicker: 'Historický bronz',
      },
      {
        blockType: 'matchesPicker',
        title: 'Play-off 2026 — cesta za bronzem',
        matches: (
          await payload.find({ collection: 'matches', where: { competition: { like: 'play-off' } }, sort: 'date', limit: 6, depth: 0 })
        ).docs.map((m) => m.id),
      },
      {
        blockType: 'personCard',
        person: (await payload.find({ collection: 'people', where: { name: { like: 'Beránek' } }, limit: 1, depth: 0 })).docs[0]?.id,
      },
      {
        blockType: 'galleryEmbed',
        gallery: (await payload.find({ collection: 'galleries', sort: '-date', limit: 1, depth: 0 })).docs[0]?.id,
        title: null,
        limit: 8,
      },
      {
        blockType: 'postFeature',
        post: (await payload.find({ collection: 'posts', where: { _status: { equals: 'published' } }, sort: '-publishedAt', limit: 1, depth: 0 })).docs[0]?.id,
        fallbackPhoto: await photo('p3081726.jpg'),
        tag: 'Z archivu',
      },
      {
        blockType: 'sponsorCard',
        sponsor: (await payload.find({ collection: 'sponsors', where: { name: { like: 'Obec' } }, limit: 1, depth: 0 })).docs[0]?.id,
        kicker: 'Partner klubu',
        note: 'Bez podpory obce by čestický hokej nebyl — děkujeme za dlouholetou přízeň.',
      },
      // ── marketing widgety ──
      {
        blockType: 'announcement',
        tone: 'warning',
        text: 'Páteční trénink 22. 8. je zrušen — led má výluku.',
        linkLabel: 'Rozpis tréninků',
        linkHref: '/#treninky',
        dismissible: true,
      },
      {
        blockType: 'featureGrid',
        title: 'Proč hrát u nás',
        items: [
          { icon: 'shield', title: 'Výstroj půjčíme', text: 'Na první zkoušky nepotřebuješ nic — brusle, helmu i chrániče máme.' },
          { icon: 'wallet', title: 'První měsíc zdarma', text: 'Mládež má první měsíc na zkoušku bez příspěvků.' },
          { icon: 'clock', title: 'Trénink 2× týdně', text: 'Úterý a pátek na zimním stadionu v Rychnově nad Kněžnou.' },
          { icon: 'users', title: 'Parta z vesnice', text: 'Většina týmu jsou kluci z okolí — hokej tu pořád patří vesnici.' },
          { icon: 'trophy', title: 'Hrajeme o poháry', text: 'Historický bronz v play-off VČHL 2025/26 mluví za vše.' },
          { icon: 'heart', title: 'Rodinný klub', text: 'Čtyři generace, jeden klub. Děti trénují společně s muži.' },
        ],
      },
      {
        blockType: 'testimonials',
        title: 'Co říkají naši lidé',
        items: [
          { quote: 'Nikdy jsem nehrál závodně a kluci mě vzali mezi sebe. Dneska si neumím představit úterý bez ledu.', name: 'Tomáš', role: 'hráč, 3. sezóna' },
          { quote: 'Syn začal v šesti letech. Trenéři se mu věnují a hlavně ho to strašně baví.', name: 'Markéta', role: 'maminka mladého hokejisty' },
          { quote: 'Na zápasy jezdíme celá rodina. Atmosféra na zimáku je nejlepší v okolí.', name: 'Josef', role: 'fanoušek' },
        ],
      },
      {
        blockType: 'pricingCards',
        title: 'Členské příspěvky',
        perex: 'Příspěvky pokrývají led a rozhodčí. Domlouváme je na začátku sezóny.',
        cards: [
          {
            name: 'Mládež',
            price: '1 500 Kč',
            period: 'za sezónu',
            description: 'Děti od šesti let',
            features: [{ text: 'První měsíc zdarma' }, { text: 'Zapůjčení výstroje' }, { text: 'Trénink s muži v úterý' }],
            highlighted: true,
            ctaLabel: 'Přihlásit dítě',
            ctaHref: '/#kontakt',
          },
          {
            name: 'Muži',
            price: '3 000 Kč',
            period: 'za sezónu',
            description: 'Soutěžní tým VČHL',
            features: [{ text: 'Ledové hodiny 2× týdně' }, { text: 'Zápasy VČHL' }, { text: 'Klubová šatna' }],
            highlighted: false,
            ctaLabel: 'Chci hrát',
            ctaHref: '/#kontakt',
          },
          {
            name: 'Podporovatel',
            price: 'dle libosti',
            period: '',
            description: 'Fandíš? Pomoz klubu.',
            features: [{ text: 'Jméno na webu' }, { text: 'Dobrý pocit z podpory' }],
            highlighted: false,
            ctaLabel: 'Podpořit klub',
            ctaHref: '/#kontakt',
          },
        ],
      },
      {
        blockType: 'downloads',
        title: 'Dokumenty ke stažení',
        items: [
          { file: 889, label: 'Pravidla soutěže 2024/2025' },
          { file: 891, label: 'Pravidla LH — kompletní znění' },
        ],
      },
      {
        blockType: 'mapEmbed',
        title: 'Kde nás najdete',
        embedUrl: 'https://maps.google.com/maps?q=Zimn%C3%AD%20stadion%20Rychnov%20nad%20Kn%C4%9B%C5%BEnou&output=embed',
        pills: [{ text: 'ZS Rychnov nad Kněžnou' }, { text: 'TJ Sokol Čestice, 517 41' }],
      },
      {
        blockType: 'externalEmbed',
        title: 'Průběžná tabulka na ahl.cz',
        url: 'https://www.ahl.cz/soutez/vychodoceska_hokejova_liga/tabulky/',
        height: 600,
      },
      { blockType: 'landingFaq', items: [] },
      { blockType: 'landingSponsors', title: 'Naši partneři', ctaLabel: 'Chci podpořit klub' },
    ],
    _status: 'published',
  } as any,
  context: ctx,
})
console.log('Ukázková stránka vytvořena: /ukazka-sekci')
process.exit(0)
