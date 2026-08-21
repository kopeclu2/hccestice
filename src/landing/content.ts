/**
 * Výchozí redakční obsah landing page.
 *
 * ⚠️ Obsah se nyní spravuje v Payload adminu — global „Landing page"
 * (+ kolekce „Lidé v klubu"). Tento soubor slouží jako:
 *  1. zdroj pro prvotní seed (`migration/seed-landing.ts`),
 *  2. fallback v `queries.ts` — pole nevyplněné v adminu se vrátí
 *     k výchozímu znění, stránka se nikdy nerozbije.
 *
 * Fotky se odkazují názvem souboru; na media je převádí seed.
 *
 * Navigace se spravuje v adminu (Nastavení → Menu); `FALLBACK_NAV` je
 * fallback pro prázdné CMS a zdroj pro `migration/seed-navigation.ts`.
 */

import type { NavItem } from './types'

/**
 * Fallback hlavní navigace — použije se, když je v CMS prázdná.
 *
 * `anchor` musí odpovídat `id` sekce, kterou renderuje příslušný blok
 * (`blocks/Club/Component.tsx` → `id="klub"` atd.). `path` je podstránka,
 * pokud sekce nějakou má. Položka bez `anchor` na homepage jako sekce
 * neexistuje, takže i home nav vede přímo na podstránku.
 */
export const FALLBACK_NAV: NavItem[] = [
  { label: 'O klubu', anchor: 'klub', path: null },
  { label: 'Historie', anchor: 'historie', path: '/historie-klubu' },
  { label: 'Soupiska', anchor: null, path: '/soupiska' },
  { label: 'Zápasy', anchor: null, path: '/zapasy' },
  { label: 'Aktuality', anchor: 'aktuality', path: '/aktuality' },
  { label: 'Sezóna', anchor: 'sezona', path: null },
  { label: 'Tréninky', anchor: 'treninky', path: null },
  { label: 'Fotoalbum', anchor: 'fotoalbum', path: '/fotogalerie' },
  { label: 'Partneři', anchor: 'sponzori', path: '/sponzori' },
]

export const HERO = {
  photo: 'p3081016.jpg',
  intro:
    'Historické 3. místo v play-off, sedm výher v řadě a plný zimák. Sezóna 2025/26 byla nejlepší v dějinách klubu.',
  headlineLight: 'Malý klub,',
  headlineBold: 'velká sezóna.',
  cta: { href: '#sezona', label: 'Přidej se k nám' },
  navCta: { href: '#kontakt', label: 'Chci hrát' },
} as const

/** Fotky ke kartám reportů (pořadí = pořadí zápasů od nejnovějšího). */
export const REPORT_PHOTOS = [
  'p3081726.jpg',
  'p3081434.jpg',
  'p3080742.jpg',
  'p3080507.jpg',
] as const

/** Tabulka VČHL — základní část 2025/26 (top 5, spravuje ahl.cz). */
export const STANDINGS = {
  seasonLabel: 'základní část 2025/26',
  ourTeam: 'HC Čestice',
  fullTableUrl: 'https://www.ahl.cz/soutez/vychodoceska_hokejova_liga/tabulky/',
  rows: [
    { pos: 1, team: 'HC Skuteč', games: 18, points: 49 },
    { pos: 2, team: 'HC Čestice', games: 18, points: 38 },
    { pos: 3, team: 'HC Baroni Opočno', games: 18, points: 36 },
    { pos: 4, team: 'HC Spartak Choceň B', games: 18, points: 34 },
    { pos: 5, team: 'Rebels Polička', games: 18, points: 27 },
  ],
} as const

export const SEASON_STATS = {
  seasonLabel: '2025/2026',
  items: [
    { value: '3.', label: 'místo v play-off VČHL', accent: false },
    { value: '38', label: 'bodů v základní části', accent: true },
    { value: '7', label: 'výher v řadě', accent: false },
    { value: '24', label: 'hráčů na soupisce', accent: false },
  ],
} as const

/**
 * Tréninky — fotka i zelená karta s akcí jsou volitelné doplňky, které
 * v designu sekce nejsou. Fallback pro ně proto **záměrně neexistuje**:
 * vykreslí se jen tehdy, když je správce v CMS vyplní.
 */
export const TRAININGS = {
  kicker: 'Tréninky',
  headline: 'Trénujeme dvakrát týdně.',
  headlineHighlight: 'Mládež',
  headlineRest: 'jezdí s muži',
  defaultVenue: 'ZS Rychnov nad Kněžnou',
  rows: [
    { day: 'Út', time: '16:15 – 17:15', group: 'Muži + mládež', accent: true },
    { day: 'Pá', time: '17:45 – 19:00', group: 'Muži', accent: false },
  ],
} as const

export const CLUB = {
  kicker: 'Hokejový klub',
  headlineStart: 'Vejdi na led v Česticích — místo, kde hokej pořád',
  headlineHighlight: 'patří vesnici',
  perex:
    'TJ Sokol Čestice, okres Rychnov nad Kněžnou. Domácí zápasy hrajeme na zimním stadionu v Rychnově, trénujeme dvakrát týdně a mládež jezdí s muži.',
  cta: { href: '#kontakt', label: 'Ozvi se nám' },
  cards: {
    stadium: {
      photo: 'p3080395.jpg',
      tag: 'Domácí led',
      caption: 'Zimní stadion Rychnov nad Kněžnou — náš domácí svatostánek',
    },
    youth: {
      photo: 'p3081907.jpg',
      tag: 'Mládež',
      caption: 'Úterky patří dětem i mužům',
    },
    note: 'Přijď se podívat na trénink, nebo rovnou na led. Výstroj půjčíme, zbytek doučíme.',
  },
} as const

/**
 * Sekce Historie na landingu (handoff „Sekce Historie na landing (finální)").
 * Vyprávění a citát z kroniky; nadpis i citát jsou rozdělené na běžnou
 * a lime zvýrazněnou část, protože zvýraznění je uprostřed věty.
 */
export const HISTORY = {
  kicker: 'Historie',
  watermark: '1954',
  headlineStart: 'Sedmdesát zim',
  headlineHighlight: 'na jednom ledě',
  lead: 'Oddíl vznikl roku 1954 při TJ Sokol, ale hokej se v Česticích hrál mnohem dřív. Začínalo se na hřišti za Machačovými — mantinely z prken, led podle počasí a dresy koupené na dluh.',
  text: 'Dnes hrajeme jedenáctou sezónu Východočeské hokejové ligy, domácí zápasy na zimáku v Rychnově. A ta nejlepší kapitola se píše právě teď: historický bronz v play-off 2026.',
  metaLine: 'založeno 1954 · od dresů na dluh k bronzu 2026',
  ctaLabel: 'Celá historie',
  photosCtaLabel: 'Historické fotky',
  chips: [
    { label: '1954 · založení', accent: false },
    { label: '2007 · rolba a světla', accent: false },
    { label: '2015 · VČHL', accent: false },
    { label: '2026 · bronz', accent: true },
  ],
  quoteStart: 'Led se stříkal hadicí a hrálo se,',
  quoteHighlight: 'když dovolilo počasí',
  quoteEnd: '. Největším soupeřem byla obleva.',
  quoteSource: 'Vzpomínka na hřiště za Machačovými, 50.–60. léta',
} as const

/**
 * Stránka Historie klubu (/historie-klubu) — texty hlavičky, éry timeline
 * a příběhový blok. Milníky žijí v kolekci `milestones`; `fallbackMilestones`
 * drží obsah z handoffu, dokud v CMS žádné nejsou.
 *
 * `eras` je zdroj pravdy pro nadpisy timeline — `value` musí odpovídat
 * hodnotám selectu `era` v kolekci Milestones.
 */
export const HISTORY_PAGE = {
  watermark: '1954',
  breadcrumb: 'Historie klubu',
  headlineLight: 'Sedmdesát zim',
  headlineHighlight: 'na jednom ledě',
  perex:
    'Od kluziště stříkaného hadicí a dresů koupených na dluh až po historický bronz ve Východočeské hokejové lize. Hokej se v Česticích hrál dřív, než o něm existují záznamy.',
  stats: [
    { value: '1954', label: 'založení oddílu při TJ Sokol', tone: 'club' },
    { value: '70+', label: 'let hokeje v Česticích', tone: 'ink' },
    { value: '3.', label: 'místo play-off VČHL 2026', tone: 'dark' },
    { value: '11', label: 'sezón ve VČHL', tone: 'ink' },
  ],
  eras: [
    { value: 'zacatky', title: 'Začátky', range: '1954 — 1960 · přírodní led' },
    { value: 'zazemi', title: 'Vlastní zázemí', range: '2007 — 2008 · investice do ledu' },
    { value: 'vchl', title: 'Éra VČHL', range: '2015 — dnes · Východočeská hokejová liga' },
  ],
  story: {
    kicker: 'Příběh, který klub definuje',
    headlineStart: 'Na první dresy si hráči ',
    headlineHighlight: 'půjčili sami sobě',
    headlineEnd: ' — každý dal, kolik mohl.',
    text: 'Peníze v pokladně nebyly. Při různorodém oblečení hráčů docházelo k nepřehlednosti, která ovlivňovala i výsledky. Mužstvo se proto složilo formou půjčky a koupilo si dresy společně. Tenhle způsob, jak se v Česticích dělá hokej, se od té doby nezměnil.',
  },
  cta: {
    headline: 'Historické fotky a archivy sezón',
    perex: 'Družstva z 60. let, stavba ledu, archiv výsledků od sezóny 2015/16.',
    label: 'Otevřít fotoalbum',
    href: '/fotogalerie',
  },
  fallbackMilestones: [
    {
      era: 'zacatky',
      year: '1954',
      title: 'Založení oddílu ledního hokeje',
      text: 'Po založení TJ Sokol se celá sportovní činnost soustředí na hokej — oddíl vzniká ještě týž rok. Záznamy ale ukazují, že se v Česticích hrálo mnohem dřív. Nehráli jen mladí, ale i starší fandové.',
    },
    {
      era: 'zacatky',
      year: '1955',
      title: 'Hřiště za Machačovými',
      text: 'První utkání se hrálo v Týništi nad Orlicí proti Žďáru nad Orlicí — v dresech vypůjčených od TJ Sokol Lípa. Od roku 1955 se už hraje doma, na hřišti za Machačovými.',
    },
    {
      era: 'zacatky',
      year: '1959',
      title: 'Žáci poprvé v mistrovské soutěži',
      text: 'V sezóně 1959/60 klub poprvé přihlašuje družstvo žáků — hraje se o krajského přeborníka na zimním stadionu v Hradci Králové.',
    },
    {
      era: 'zazemi',
      year: '2007',
      title: 'Klub kupuje rolbu',
      text: 'Konec ručního hrabání a stříkání — vlastní rolba na úpravu přírodního ledu znamená pravidelnější bruslení pro celou vesnici.',
    },
    {
      era: 'zazemi',
      year: '2008',
      title: 'Nové osvětlení kluziště',
      text: 'Rekonstrukce osvětlení prodlužuje sezónu do večerních hodin. Trénovat i hrát se dá po práci a po škole.',
    },
    {
      era: 'vchl',
      year: '2015',
      title: 'Vstup do Východočeské hokejové ligy',
      text: 'Čestice se přihlašují do VČHL a začínají hrát pravidelnou soutěž. Domácí zápasy se stěhují na zimní stadion do Rychnova nad Kněžnou.',
    },
    {
      era: 'vchl',
      year: '2024',
      title: 'Návrat mládeže',
      text: 'Klub znovu otevírá přípravku a žákovskou skupinu. Děti od šesti let trénují v úterý společně s muži, výstroj na první zkoušku půjčí klub.',
    },
    {
      era: 'vchl',
      year: '2026',
      title: 'Historický bronz',
      text: 'Nejlepší sezóna v dějinách klubu: 2. místo po základní části a bronz v play-off po sérii s Barony Opočno. Plný zimák, buben nezastavil.',
    },
  ],
} as const

/** Lidé v klubu — portréty jsou media z importu (soupiska 2025). */
export const PEOPLE = [
  {
    name: 'Ing. Lukáš Beránek',
    role: 'Předseda oddílu',
    note: 'Vedení oddílu, mužstvo mužů',
    mail: 'lukas.beranek84@seznam.cz',
    phone: '+420 732 713 435',
    portrait: 'beranek-lukas.jpg',
  },
  {
    name: 'Jaroslav Macháček',
    role: 'Trenér mužů',
    note: 'Tréninky a sestava A-týmu',
    mail: null,
    phone: '+420 737 731 747',
    portrait: 'machacek-jaroslav.jpg',
  },
  {
    name: 'Jaroslav Bárta st.',
    role: 'Asistent trenéra mužů',
    note: 'Mužstvo mužů',
    mail: null,
    phone: '+420 777 018 123',
    portrait: 'barta-jaroslav.jpg',
  },
  {
    name: 'Michal Javůrek',
    role: 'Trenér žáků a přípravky',
    note: 'Mládež a přípravka',
    mail: 'michal.javurek@centrum.cz',
    phone: '+420 603 868 616',
    portrait: 'javurek-michal.jpg',
  },
  {
    name: 'Lukáš Sajdl',
    role: 'PR manager',
    note: 'Web, Facebook, Instagram',
    mail: 'lukas.sajdll@seznam.cz',
    phone: '+420 603 992 752',
    portrait: 'sajdl-lukas.jpg',
  },
] as const

export const FAQ = [
  {
    question: 'Kde hrajete domácí zápasy?',
    answer:
      'Domácí utkání hrajeme na zimním stadionu v Rychnově nad Kněžnou. Vlastní led v Česticích nemáme, o to hlasitější je naše kotva na tribuně.',
  },
  {
    question: 'Můžu přijít hrát, i když jsem nikdy nehrál závodně?',
    answer:
      'Můžeš. Většina týmu jsou kluci z okolních vesnic, kteří hokej nikdy nehráli profesionálně. Napiš nám a přijď na trénink v úterý.',
  },
  {
    question: 'Od kolika let berete děti?',
    answer:
      'Mládežnickou skupinu vedeme od šesti let. Trénuje v úterý společně s muži, výstroj na první zkoušku půjčíme.',
  },
  {
    question: 'Kolik stojí členství?',
    answer:
      'Příspěvky pokrývají led a rozhodčí a domlouváme je na začátku sezóny. Pro mládež je vstup na první měsíc zdarma.',
  },
  {
    question: 'Kde najdu tabulku a rozlosování?',
    answer:
      'Kompletní výsledky VČHL vedeme v sekci Sezóna, průběžnou tabulku spravuje Východočeská hokejová liga.',
  },
] as const

/**
 * Klubová adresa — fallback, když ji správce nevyplní v `siteConfig`.
 * Čte ji frontend (`data/site.ts`) i odchozí e-maily (`src/email/config.ts`),
 * proto konstanta a ne literál na dvou místech.
 */
export const CLUB_EMAIL = 'hccestice@seznam.cz'

export const CONTACT = {
  kicker: 'Kontakt',
  perex: 'Chcete hrát, přivést dítě na trénink nebo podpořit klub? Napište nám.',
  pills: ['TJ Sokol Čestice, 517 41', 'ZS Rychnov nad Kněžnou'] as const,
  topics: ['Chci hrát', 'Mládež', 'Sponzoring', 'Jiné'] as const,
} as const

export const FOOTER = {
  photo: 'p3080422.jpg',
  headline: 'Uvidíme se na zimáku.',
  perex:
    'TJ Sokol Čestice, okres Rychnov nad Kněžnou. Domácí zápasy na zimním stadionu v Rychnově.',
  columns: [
    {
      title: 'Klub',
      links: [
        { href: '#klub', label: 'O klubu' },
        { href: '/historie-klubu', label: 'Historie' },
        { href: '/sponzori', label: 'Partneři' },
      ],
    },
    {
      title: 'Hokej',
      links: [
        { href: '/soupiska', label: 'Soupiska' },
        { href: '#aktuality', label: 'Aktuality' },
        { href: '#treninky', label: 'Tréninky' },
        { href: '#fotoalbum', label: 'Fotoalbum' },
      ],
    },
  ],
  copyright: `© ${new Date().getFullYear()} HC Čestice — TJ Sokol Čestice`,
  league: 'Východočeská hokejová liga',
} as const
