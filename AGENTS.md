<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Struktura `src/landing/`

| složka | co v ní je |
|---|---|
| `ui/` | design systém: tlačítka, nadpisy, karty, dekorace — bez znalosti domény |
| `layout/` | kostra stránek: `SubpageShell`, navigace, patička, údržba |
| `blocks/` | CMS bloky (`Component.tsx` + `config.ts`) a `render.tsx`; blok neimportuje jiný blok |
| `features/<doména>/` | `matches`, `posts`, `galleries`, `roster`, `history`, `contact`, `sponsors`, `trainings`, `products`, `navigation`, `pages` (fetcher dokumentu `pages` a JSON-LD home stránky) |
| `data/` | průřezové fetchery (`site`, `maintenance`, `session`, `landingSlugs`) a infrastruktura datové vrstvy: `query` (`cachedQuery`, `getPayloadClient`), `tags` (`CACHE_TAGS`) |
| `lib/` | pomocníky nad Payload dokumenty: `media`, `payload`, a `listUrl` (`buildListUrl`). Obecné helpery (`routes`, `datetime`, `plural`, `fold`, `teamName`, `club`, `errors`) jsou v `src/lib/` |
| `types.ts` | sdílené jádro view-modelů (`Photo`, `PersonCard`, `SiteLinks`, obsah hero a patičky) |

Uvnitř feature: `components/` (prezentace), `data` (fetchery, `server-only`),
`view/` (čisté mapování bez I/O — smí do klienta), `types.ts`. Menší features
mají `data.ts` a `types.ts` přímo v kořeni. Typy jedné domény žijí v její
`types.ts`, ne v `landing/types.ts`. Prezentační komponenta, kterou potřebuje
víc bloků (`MatchesWidgetView`, `StandingsCard`, `RosterWidgetView`,
`ProductTile`, `Countdown`), patří do `components/` feature, ne do bloku.
`features/*/components` jsou anglicky; složky v `src/app/` zůstávají česky (URL).

`landing/lib/listUrl.ts` — `buildListUrl(base, { filters, page, pageKey, hash })`
skládá adresu výpisu: filtry jdou před stránkou, prázdný filtr v adrese není
a první strana do URL nepatří. Výpis `/zapasy` předává `pageKey: 'strana'`,
ostatní výpisy mají výchozí `page`. Parametr je v indexu vyhledávačů,
takže se nepřejmenovává.

`landing/data/query.ts` — `cachedQuery(fn, { key, version, tags, revalidate })`
je jediná cesta k tagované datové cache (`unstable_cache` pod React `cache()`,
`revalidate` výchozí 3600 s) a `getPayloadClient()` jediné místo, které volá
`getPayload`. Klíč a `version` se nemění, dokud se nemění tvar dat; tag je
povinný (viz „Cache a renderovací režimy").

# Konvence kódu

## Kam co patří

| místo | co v něm je |
|---|---|
| `src/lib/` | izomorfní moduly: bez `server-only`, bez importu Payload configu. Smí je importovat klient, admin, hooky, seed skripty i vitest (`routes`, `club`, `teamName`, `fold`, `datetime`, `plural`, `errors`, `jsonLd`, `matchSlug`, `slugifyCs`, `indexNow`, `rateLimit`) |
| `src/server/` | serverové utility nad Payloadem (`getDocument`, `getRedirects`, `recaptcha/verify`), všechny s `import 'server-only'` |
| `src/landing/ui`, `layout`, `blocks`, `features`, `data`, `lib` | viz „Struktura `src/landing/`" |
| `src/hooks/` | hooky kolekcí a globalů; revalidační stavíte přes `createRevalidateHooks` |
| `src/collections`, `globals`, `fields`, `plugins`, `jobs`, `ahl`, `email`, `endpoints` | Payload config a serverová logika mimo frontend |
| `scripts/seed/` | jednorázové skripty spouštěné ručně přes `bun`; patří do nich `context: { disableRevalidate: true }` |

## `server-only`

Mají ho moduly, které sahají na Payload nebo `next/headers` a patří jen na
server: fetchery v `landing/**/data`, `landing/data/*` a `src/server/*`.
Import z klientské komponenty pak shodí build srozumitelnou chybou místo
tichého tažení Payload configu do klientského bundlu.

Nemají ho moduly dosažitelné z `payload.config.ts`, ze seed skriptů a z testů
(např. `lib/indexNow.ts`, `lib/rateLimit.ts`, hooky, `plugins/*`): mimo Next
runtime `server-only` při importu hodí výjimku, takže by spadl `payload
migrate`, `generate:types`, seed skripty a `api.int.spec.ts`. Stejně tak
nemají `server-only` čisté moduly v `view/` a `navHref.ts`, které importují
klientské komponenty. Ve vitestu je balíček nahrazený stubem
(`tests/stubs/server-only.ts`, alias ve `vitest.config.mts`), aby šly
v unit testech importovat i fetchery.

## Sdílené moduly — použij místo vlastní kopie

| modul | použij místo |
|---|---|
| `lib/routes` (`routes`, `linkOrNull`, `collectionDocPath`) | skládání `` `/zapasy/${slug}` `` a podobných cest |
| `landing/lib/listUrl` (`buildListUrl`) | ruční `URLSearchParams` pro filtry a stránkování výpisů |
| `lib/club` (`CLUB_NAME`, `SITE_NAME`, `CLUB_LOGO`, `CLUB_PREFIXES`) | literály „HC Čestice", cesta k logu a seznamy předpon |
| `lib/teamName` (`monogram`, `teamCode`, `initials`, `stripClubPrefix`) | vlastní zkratky, iniciály a odstraňování „HC"/„SK" z názvů |
| `lib/fold` | `normalize('NFD').replace(…)` pro porovnávání a slugy |
| `lib/datetime` | zakládání `Intl.DateTimeFormat`; datumy jsou v Europe/Prague |
| `lib/plural` | ruční skloňování počtů |
| `lib/errors` (`errorMessage`) | `e instanceof Error ? e.message : String(e)` v `catch` |
| `landing/data/query` (`cachedQuery`) + `landing/data/tags` (`CACHE_TAGS`) | holé `unstable_cache` a tag zapsaný jako řetězec |
| `hooks/createRevalidateHooks` (`createRevalidateHooks`, `applyRevalidation`) | ručně psané `afterChange` / `afterDelete` s `revalidateTag` |

## UI primitiva (shadcn)

Jeden systém místo dvou paralelních: `src/components/ui/*` (shadcn, Radix +
cva, napojené na značku přes proměnné v `globals.css`).

- **Tlačítka a CTA pilulky** jsou `Button` z `components/ui/button`:
  `<Button variant size withArrow>` pro tlačítko, `<Button asChild><Link …/></Button>`
  pro odkaz (`Slottable` vloží šipku `withArrow` dovnitř `<a>`), `buttonVariants()`
  pro holé třídy a `ButtonArrow` pro pilulku, která není button ani odkaz.
  `pill.ts`, `PillButton` a `PillLink` už neexistují, hlídá to `no-pill-import`
  v `check-tokens`. `key` v `map()` patří na `<Button asChild>`, ne na `<Link>`.
- **Mobilní menu** je `Sheet`, **drobečky** `Breadcrumb`. `Sheet` nesmí přijít
  o overlay ani když je panel přes celou obrazovku: Radix v něm drží zámek
  scrollu (`RemoveScroll`), proto `overlayClassName="bg-transparent"`.
- **FAQ** shadcn nepoužívá: `blocks/Faq/Accordion.tsx` je Server Component
  s nativním `<details name="faq">` bez řádku klientského JS (`ui/accordion.tsx`
  neexistuje, `@radix-ui/react-accordion` je z `package.json` pryč). Společné
  `name` dělá z položek výlučnou skupinu (Chrome 120, Safari 17.2, Firefox 130;
  starší prohlížeč nechá otevřít víc otázek najednou, nic se nerozbije), ikona
  +/− se přepíná CSS (`group-open:`). Radix navíc uměl šipky a Home/End mezi
  otázkami; to je ve WAI-ARIA vzoru volitelné a za ~7 kB gzip na každé stránce
  s FAQ se nevyplatilo.
- **Mobilní menu je líné.** Burger v `landing/layout/NavMobile.tsx` je
  v hlavním bundlu a nese ARIA, kterou by jinak dodal Radix trigger
  (`aria-expanded`, `aria-haspopup`, `aria-controls`). `NavMobilePanel.tsx`
  (Sheet, focus trap, `react-remove-scroll`) je `dynamic()` chunk a ten se
  dostane do bundlu jen přes `import()`:
  - `dynamic()` musí být volané uvnitř klientského modulu (`'use client'`);
    ze Server Componenty by hranici chunku nevytvořilo.
  - Přednačtení při `onPointerEnter` a `onFocus` na burgeru, nejpozději při
    kliknutí; oba spouštěče sdílí `loadPanel`, takže se `import()` dedupuje.
  - Panel se montuje při prvním otevření a pak zůstane (zavírací animace).
  - Fokus po zavření se vrací **výslovně** (`onCloseAutoFocus` →
    `triggerRef.current?.focus()`). Radix by ho vrátil na prvek, který měl
    fokus při montáži panelu, a ten se kvůli línému chunku může od kliknutí
    na burger lišit; burger je jediný vlastník otevření.
- **JS stránky, naměřený na produkčním buildu** (first load, gzip, kB):

  | stránka | před fází 4c | po 4c (Accordion + Sheet v bundlu) | po optimalizaci |
  |---|---|---|---|
  | `/` | 312 | 330 | 311 |
  | detail článku | 307 | 320 | 307 |
  | `/soupiska` | 304 | 319 | 306 |
  | `/kontakt` | 312 | 330 | 311 |

  Accordion a Sheet v hlavním bundlu přidaly 13–18 kB na každou stránku,
  proto se nový klientský primitiv z shadcn nejdřív měří (`next build`,
  First Load JS).
- **Formuláře** se skládají z `Field` / `FieldLabel` / `FieldError` a
  `Controller` z react-hook-form (doporučený vzor shadcn, komponenta `form` se
  dál nevyvíjí). Vzor je `ContactField` v `ContactForm.tsx`; `ui/field.tsx` je
  bez `FieldSeparator`. Šablonový blok `landing/blocks/Form/**` zůstal na
  `register` + vlastních `Error` a `Width` (formBlock nemá v DB žádnou stránku).
- `shadcn add` generuje starší vzhled s `React.forwardRef`, hardcoded barvami a
  uvozovkami; po vygenerování kód přepsat podle okolních souborů (tokeny,
  prettier, `function`) a Radix balíčky držet na jedné verzi, jinak se do
  bundlu dostanou dvě kopie `react-primitive` a `react-slot`.

## Pojmenování a styl

- Složky v `src/app/` jsou česky (tvoří URL); identifikátory, komponenty
  a soubory v `src/` anglicky.
- Named exporty. `export default` jen tam, kde ho vyžaduje Next
  (`page`, `layout`, `route`, `error`, `not-found`, `loading`) nebo Payload;
  výjimkou zůstává `components/RichText` (obě varianty) a `lib/canUseDOM`.
- Komponenty jsou deklarace `function`. `const X: React.FC` přežívá jen
  v `RenderBlocks` (`blocks/render.tsx`) a `FormBlockServer`.
- Žádné `any`. `eslint-disable` a `@ts-expect-error` jen s důvodem
  v komentáři (dnes `plugins/index.ts`, `plugins/auditor.ts`, `blocks/Form`
  a React hooky v klientských komponentech). Kde se typy nedají srovnat,
  cast má jednořádkový komentář proč.
- Pořadí importů hlídá ESLint (`import/order`, abecedně, `@/` jako interní).

## Nástroje

- `bun run format` (Prettier, vč. řazení Tailwind tříd), `format:check` v CI.
- Husky `pre-commit`: `lint-staged` (Prettier + ESLint na staged souborech)
  a `scripts/check-tokens.mjs` (hlídač design tokenů).
- CI (`.github/workflows/deploy.yml`): `format:check`, `lint`, `check`
  (`check:tokens` + `check:types`) a `test:unit`. `test:unit` vynechává
  `api.int.spec.ts`, který potřebuje Postgres; ten běží jen v `test:int`.
- Unit testy jsou v `tests/int/*.int.spec.ts` (vitest). Nesahají na síť ani
  databázi: `next/cache` a balíčky e-mailových adapterů se mockují
  (`email-adapter`, `internal-revalidate`), kolekce pluginů se skládají ručně
  (`navigation-overrides`).

# Navigace landing page

Navigaci spravuje správce v adminu: **Nastavení → Menu** (kontejner `hlavni`)
a **Nastavení → Položky menu**. Pořadí odkazů se přetahuje myší v poli
„Položky menu" na kontejneru.

## Model

`NavItem` (`src/landing/features/navigation/types.ts`) rozpojuje tři role, které dřív plnil
jediný string `href`:

| pole | role |
|---|---|
| `label` | text odkazu |
| `anchor` | `id` sekce na homepage (bez `#`); prázdné = sekce na home není |
| `path` | cesta na podstránku; prázdné = položka žije jen jako kotva |

Cíl odkazu skládá `navHref(item, 'home' \| 'subpage')`
(`src/landing/features/navigation/navHref.ts`). Tím zmizely konstanty `SUBPAGE_HREF`
a `PAGE_ONLY_LINKS` — druhá je derivovatelná z `anchor === null`.

`navHref.ts` je oddělený od `data.ts` **záměrně**: `data.ts`
sahá na `getPayload`, takže kdyby si klientské komponenty (`NavPills`,
`NavMobile`) tahaly resolvery odtud, přišel by do klientského bundlu
server-only Payload config a build spadne.

## Adaptérová vrstva nad pluginem

Kolekce `navigation-containers` a `navigation-items` přidává
`payload-cms-navigation-plugin`. Plugin je nezralý — anglické labely, žádné
hooky, pole navíc (`parent`, `children`, `order`, `className`,
`localeVisibility`) a validace, která nepočítá s naším modelem.

Srovnává ho `src/plugins/navigationOverrides.ts`, registrovaný **hned za
ním** v `src/plugins/index.ts`. Pravidla, když se ho budete dotýkat:

- Pluginy se skládají sekvenčně a řadí podle `plugin.order ?? 0`
  (`payload/dist/config/build.js`). Plugin `order` nemá, takže o pořadí
  rozhoduje pozice v poli `plugins`.
- Adaptér **hodí výjimku**, když kolekce nenajde. Bez toho by se změna API
  pluginu projevila jen anglickým adminem a nikdo by nepoznal proč.
- Polím se hodnoty **mutují**, ne kopírují spreadem — `Field` je
  diskriminovaná unie a `{ ...field }` ji rozšíří tak, že přestane být
  přiřaditelná zpět.
- Pluginu **nikdy nepředávat** `localization` option: doplnil by
  `config.localization` a přepsal schéma všech kolekcí projektu
  (každé `localized` pole → `_locales` tabulka). V push mode masivní
  destruktivní migrace.
- Položky se zakládají jako typ „Cesta nebo kotva" (v pluginu `external`).
  Varianta `internal` vyžaduje povinnou relaci na kolekci `pages`, ale
  `/zapasy`, `/soupiska`, `/fotogalerie`, `/aktuality`, `/historie-klubu`
  a `/sponzori` jsou ručně psané Next stránky, ne dokumenty v CMS.

## Cache a revalidace

Navigace je na každé stránce, takže se cachuje **tagem**, ne časem
(`unstable_cache` s tagem `navigation` v `src/landing/features/navigation/data.ts`).
Tag se propaguje i na build-time prerenderované stránky, takže jedno
`revalidateTag('navigation', 'max')` pokryje i `/aktuality/[slug]`.

`unstable_cache` bez `options.revalidate` má TTL **jeden rok** — hook
`src/hooks/revalidateNavigation.ts` proto není vylepšení, ale podmínka
funkčnosti. Musí být na `afterChange` i `afterDelete` **obou** kolekcí.

Seed a importní skripty musí posílat `context: { disableRevalidate: true }`.
Bez toho `revalidateTag` mimo Next runtime spadne na
`Invariant: static generation store missing`.

# Auditní log

Kdo v adminu co změnil, řeší `payload-auditor` nakonfigurovaný v
`src/plugins/auditor.ts`. V adminu **Systém → Auditní log**.

## Co plugin sám neumí

Balíček ukládá jen `operation`, `hook`, `scope`, `userAgent` a `identifier`
— a `identifier` je **slug kolekce**, ne ID dokumentu. Uživatele neloguje
vůbec. Použitelný záznam proto skládá `describeCollection` /
`describeGlobal`, které dopisují `documentId` a `user`; k tomu musí existovat
stejnojmenná pole na kolekci (`configureRootCollection`), jinak je Payload
při `create` zahodí.

Další odchylky od dokumentace balíčku, ověřené v jeho `dist/`:

- `attachGlobalConfig` posílá u globalů natvrdo `scope: 'collection'` —
  přepisuje se v `describeGlobal`.
- Root kolekce má v balíčku slug `Audit-log` (velké A); nahrazujeme vlastní
  konfigurací se slugem `audit-log`.
- Kolekce nemá `access`, takže by přihlášený správce mohl logy mazat.
  Je proto zamčená na read-only; plugin i úklidová úloha zapisují Local API
  (`overrideAccess` tam defaultuje na `true`), takže je to nebrzdí.

## Rozsah a retence

Sledují se `afterChange` a `afterDelete` na kolekcích projektu i na těch od
pluginů (`redirects`, `forms`, `navigation-*`), u `users` navíc `afterLogin`
a `afterLogout`. Globaly `afterChange`.

**Čtení se neloguje záměrně** — frontend prerenderuje ~380 stránek a
`afterRead` by log zavalil. Vynechané jsou i `form-submissions` (plní je
veřejný formulář) a `search` (zrcadlo článků, přepisuje ho searchPlugin).

Retence je 90 dní. Maže ji úloha `cleanup-payload-auditor-log`, kterou
plugin registruje a v `onInit` si dopíše `jobs.autoRun` s frontou
`payload-auditor-queue`. Funguje to jen proto, že Payload volá
`_initializeCrons()` až **za** `onInit` (`payload/dist/index.js:452` vs
`:463`). Cron běží uvnitř Node procesu — při škálování na víc instancí by
se úklid spouštěl vícekrát.
Pozor: cron se po redeployi nespustí sám, dokud někdo neotevře admin — řeší to
až `src/instrumentation.ts`, viz „Synchronizace VČHL → Past s crony".

Buffer je nastavený na `realtime` místo výchozího `time`: výchozí strategie
drží logy v RAM (ztráta při redeployi) a její `setInterval` v dev režimu
přežívá HMR.

`auditor()` musí být **poslední** v poli `plugins` — hooky věší jen na
kolekce, které v configu už existují.

## Migrace

Kvůli auditní tabulce má repo poprvé migrace (`src/migrations/`), protože
v produkci (`NODE_ENV=production`) je `push` vypnutý
(`@payloadcms/db-postgres/dist/connect.js:110`).

- `…_baseline` je snímek schématu **před** pluginem. V produkci se nesmí
  spouštět (tabulky už existují) — jednorázově se označí za splněnou:
  `INSERT INTO payload_migrations (name, batch, created_at, updated_at)
  VALUES ('<název baseline>', 1, now(), now());`
- `…_add_audit_log` vytvoří `audit_log` a rozšíří enumy fronty úloh. Tahle
  se v produkci reálně spustí (`bun run migrate`).
- Lokální vývoj migrace nepoužívá, jede dál na `push`.

# SEO

Čtyři vrstvy, které se **nepřekrývají** — každá vlastní jinou část:

| vrstva | co vlastní |
|---|---|
| `@payloadcms/plugin-seo` | pole `meta` (title, description, image) na `pages` a `posts` |
| `src/lib/generateMeta.ts` | `generateMetadata` na stránkách frontendu |
| `src/app/(landing)/(sitemaps)/*` + `next-sitemap` | `/sitemap.xml` (index), `pages-`, `posts-`, `gallery-` a `matches-sitemap.xml`, `/robots.txt` |
| `src/app/llms.txt/route.ts` | `/llms.txt` |

Náhled adresy v poli SEO v adminu (`generateURL` pluginu) skládá
`src/lib/seoPreviewUrl.ts` přes `lib/routes`, podle kolekce, kterou plugin
předává jako `collectionSlug` (`posts` → `/aktuality/{slug}`, `pages` →
`/{slug}`, `home` → `/`). Dřív to bylo `/{slug}` pro všechno, takže náhled
článku vedl na neexistující adresu.

## llms.txt

`src/app/llms.txt/route.ts`, ne `payload-plugin-llms-txt` — ten neumí
flattenovat blokové layouty do Markdownu a `pages` jsou blokové. Ze stejného
důvodu tady **není** `llms-full.txt`.

Cachuje se tagem `llms-txt`, ne časem, stejně jako sitemapy vedle.
`unstable_cache` bez `options.revalidate` má TTL jeden rok, takže
`revalidateTag('llms-txt', 'max')` v `revalidatePage` / `revalidatePost` není
optimalizace, ale podmínka funkčnosti.

Ručně psané Next stránky (`/zapasy`, `/soupiska`, …) nejsou dokumenty v CMS,
takže je žádný dotaz na kolekce nevrátí — jsou v routě vyjmenované ručně
v sekci „Sekce webu".

# Cache a renderovací režimy

Projekt **nemá** zapnuté `cacheComponents`, takže platí předchozí model
(`node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`)
a datová cache se dělá `unstable_cache`, ne `use cache`.

| režim | routy |
|---|---|
| statické + ISR 600 s | `/`, `/[slug]`, `/historie-klubu`, `/soupiska`, `/sponzori` |
| SSG + ISR 600 s | `/aktuality/[slug]`, `/fotogalerie/[slug]`, `/produkty/[slug]`, `/zapasy/[slug]` |
| **plně dynamické** | `/aktuality`, `/fotogalerie`, `/zapasy` |
| dynamické on-demand | `/clanky/*`, `/fotoalbum/*`, route handlery (vč. `/internal/revalidate`, viz Synchronizace VČHL) |

Ty tři dynamické jsou dynamické kvůli `searchParams` (filtry a stránkování
v URL), ne omylem. Důsledek, na kterém se to láme: **`revalidatePath` na ně
nefunguje** — nemají cache entry routy. Jediná funkční invalidace je tag,
proto `src/landing/data/tags.ts`.

## Tři pravidla, bez kterých se to rozejde

1. **Tag i `revalidate`, ne jen tag.** `unstable_cache` bez
   `options.revalidate` má TTL **jeden rok**. `export const revalidate = 600`
   na stránce ho **neobnoví** — regenerace si vezme tutéž entry. „ISR
   pojistka" v komentářích u rout tedy platí jen pro fetchery obalené React
   `cache()`. Všechny tagované cache proto mají `revalidate` jako záchrannou
   síť pro případ, že hook neproběhne (seed s `disableRevalidate`, výjimka
   při zápisu).
2. **`revalidateTag(tag, 'max')` je stale-while-revalidate.** První
   návštěvník po uložení dostane ještě starou verzi. U redakčního obsahu
   (`posts-list`, `navigation`, `site-config`, `galleries-list`,
   `matches-list`) se proto používá `{ expire: 0 }`; `'max'` zůstává jen
   u crawlerských feedů (sitemapy, `llms-txt`). `updateTag()` expiruje taky
   okamžitě, ale jde volat jen ze Server Action — admin ukládá přes REST,
   kde vyhodí `E872`.
3. **`new Date()` nesmí být uvnitř cachované funkce.** Zamrzne v ní na celou
   dobu její životnosti. `matches.ts` proto počítá hranici „od teď"
   v `scheduleFrom()` **mimo** cache a předává ji argumentem, takže vstupuje
   do klíče a každou hodinu vzniká nová entry.

## `loading.tsx` nesmí být nad routou, která redirectuje

Byl na `(landing)/`, tedy nad celým webem. Suspense boundary z něj nastartuje
streaming, a jakmile streaming začne, `permanentRedirect` nemá kam poslat
hlavičku — Next ho degraduje na klientský `<meta http-equiv="refresh">`
s HTTP **200**.

Tím přestaly být HTTP redirecty **všechny** legacy přesměrování
z eStránkového importu: `/clanky/*`, `/fotoalbum/*` i přejmenované slugy
(`PayloadRedirects` na `/[slug]`, `/aktuality/[slug]`, `/fotogalerie/[slug]`).
Ověřeno na produkčním buildu: `/clanky/historie-klubu.html` vracelo 200
s meta tagem, po odebrání `loading.tsx` 308 na `/historie-klubu`. Přesun
redirectu do `generateMetadata` to **neřeší** — boundary je i nad ní
(taky ověřeno).

Fallback proto žije jen v `zapasy/(vypis)/loading.tsx`. Výpis `/zapasy` je
jediná dynamická routa, jejíž potomek (`/zapasy/[slug]`, detail zápasu) žádný
redirect nepotřebuje — ale `notFound()` na něm by při Suspense boundary
nad ním taky vracelo 200. Proto je výpis v route group `(vypis)`: `loading.tsx`
platí jen pro něj a detail ho nad sebou nemá (viz „Detail zápasu").
`/aktuality` a `/fotogalerie` ho nedostaly, protože jejich `[slug]` děti
redirecty servírují.

Redirecty se dělají `permanentRedirect()` (308), ne `redirect()` — ten posílá
**307 Temporary** (`docs/…/functions/redirect.md`, „Why does `redirect` use
307 and 308?"), takže crawler starou URL z indexu nevyřadí. Statická pravidla
v `redirects.ts` mají `permanent: true` odjakživa; runtime cesta se s nimi
rozcházela.

## Média

Payload servíruje soubory přes `/api/media/file/:filename` a **žádnou cache
hlavičku nenastavuje** — ověřeno v
`node_modules/payload/dist/uploads/endpoints/getFile.js`. Doplňuje ji
`upload.modifyResponseHeaders` na kolekci `media`
(`max-age=31536000, immutable`).

`immutable` je bezpečné jen díky verzi v URL: `getMediaUrl(url, updatedAt)`.
Proto `Photo` nese `updatedAt` a **každé** volání `getMediaUrl` v repu druhý
argument předává. Nový odkaz bez něj znamená, že se výměna souboru pod
stejným názvem návštěvníkům rok neprojeví.

`images.minimumCacheTTL` je 31 dní. Default Next 16 je 4 hodiny (v 15 minuta),
takže sharp na 3,7GB boxu bez swapu překódovával všechny varianty čtyřikrát
denně. Invalidovat optimalizovanou variantu jinak než změnou URL nejde —
mechanismus na to Next nemá.

## Co zbývá (není v repu)

- **Volume na `/app/.next/cache`.** Není podmínka funkčnosti — adresář si
  kontejner vyrobí sám (Dockerfile ho zakládá a chownuje na `nextjs`).
  Přežití mezi deployi má cenu jen kvůli `.next/cache/images`: klíč je hash
  z `[CACHE_VERSION, href, width, quality, mimeType]` **bez build ID**
  (`server/image-optimizer.js:675`), takže se entries dají zdědit a sharp
  nemusí po každém deployi překódovat všechno znovu na boxu bez swapu.
  `fetch-cache` (`unstable_cache`) za volume nestojí — studený start je
  jeden dotaz na klíč (33 ms proti 8 ms). Prerenderované HTML tu **není**,
  to píše `FileSystemCache` do `.next/server/app`
  (`file-system-cache.js:320-324`) a nese ho standalone.
- **`max-age` pro HTML.** Next posílá u ISR jen `s-maxage`
  (`server/lib/cache-control.js`), takže prerenderované stránky necachuje
  prohlížeč ani Traefik a každé načtení jde na origin. Nejlevnější velký skok,
  ale chce cache na reverzní proxy nebo CDN.
- **`cacheComponents` + `use cache`.** Jediná cesta, jak tu dynamickou trojici
  dostat na statický shell s dynamickou dírkou. Znamená přepis celé datové
  vrstvy (`revalidateTag` → `cacheTag`/`cacheLife`), takže vlastní větev
  a vlastní měření.

# Ochrana formulářů (reCAPTCHA v3)

Klíče: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` a `RECAPTCHA_SECRET`. Bez nich se
ověření **mimo produkci přeskakuje** (dev a CI nepotřebují účet u Googlu),
v produkci se odeslání odmítne. Skóre pod `0.5` neprojde
(`src/lib/recaptcha/config.ts` — jediný zdroj akcí i thresholdu pro
klient, plugin i server action).

Dva odesílací kanály, dvě různé ochrany, protože plugin
`payload-recaptcha-v3` ověřuje **jen operace přes REST**
(`payloadAPI === 'REST'`, viz jeho `dist/hookBuilder.js`):

| kanál | ochrana |
|---|---|
| `landing/blocks/Form` → `POST /api/form-submissions` | plugin, přes `custom.recaptcha` na `formSubmissionOverrides` |
| `landing/features/contact` → server action, local API | `verifyRecaptchaToken()` v `action.ts` |

Token si obě komponenty berou z hooku `useRecaptcha()`, který skript Googlu
vkládá **líně z formuláře** (ne z layoutu, aby se nestahoval na stránkách
bez formuláře). Když site key chybí, vrací `null` a požadavek jde bez
hlavičky — rozhodnutí zůstává na serveru.

Pravidla, když se toho budete dotýkat:

- `reCAPTCHAv3()` musí být v `plugins` **za** `formBuilderPlugin` (čte
  `custom.recaptcha` z kolekce, kterou formBuilder zakládá) a **před**
  `auditor()`.
- `skip` musí pouštět přihlášené (`Boolean(req.user)`). Admin panel jde taky
  přes REST, takže bez toho by správce nemohl s odeslanými formuláři
  pracovat.
- Balíček má **rozbitý packaging**: `package.json#types` míří na
  `dist/index.d.ts`, ale deklarace jsou v `dist/src/`. Řeší to ambientní
  deklarace `src/types/payload-recaptcha-v3.d.ts`. Cesta přes
  `tsconfig#paths` **nefunguje** — alias se použije i pro runtime resolution
  (bun i turbopack), Next pak importuje `.d.ts` a celý server padá na
  `TypeError: (void 0) is not a function`.
- Peer dependency balíčku je `next ^15`, projekt má 16 — bun jen varuje.
  Interní `import 'next/headers.js'` se rezolvuje, protože `next` nemá
  `exports` mapu.

# E-maily

Do 21. 8. 2026 neměl projekt `email` v configu vůbec, takže form-builder
notifikace **nikam neodcházely** a reset hesla do adminu nefungoval. Odchozí
poštu teď řeší `src/email/`.

## Volba adapteru

`src/email/adapter.ts` vybírá podle env proměnných, od nejsilnější
konfigurace k nejslabší:

| podmínka | adapter |
|---|---|
| `RESEND_API_KEY` | `@payloadcms/email-resend` |
| `SMTP_HOST` | `@payloadcms/email-nodemailer` |
| nic z toho | vlastní `logAdapter` — mail se jen vypíše do logu |

Fallback je **vlastní záměrně**: `nodemailerAdapter()` bez argumentů si
zakládá účet na ethereal.email, což je síťový request při bootu a
`InvalidConfiguration` (spadlý start celé appky) kdykoli běžíme offline —
viz `createMockAccount` v `@payloadcms/email-nodemailer/dist/index.js`.
V produkci loguje fallback `error`, v devu `warn`.

`EMAIL_OVERRIDE_RECIPIENT` přepošle **všechny** maily na jednu adresu; obě
oficiální adaptery to umí nativně (`overrideRecipientAddress`).

`EMAIL_FROM_ADDRESS` u Resendu musí být na doméně ověřené přes SPF + DKIM —
klubová adresa na `seznam.cz` tam neprojde. U SMTP naopak typicky **musí**
odpovídat účtu, kterým se autentizujeme.

## Šablony

Layout skládá `src/email/render.ts`: tabulkové HTML s inline styly, protože
Outlook neumí flex ani grid, Gmail zahazuje `<style>` v přeposlaných zprávách
a žádný klient neresolvuje CSS custom properties. Barvy proto jdou z hex
zrcadla `LANDING_COLORS` (`src/landing/tokens.ts`) — včetně `surface`
a `on-contrast`, takže v `render.ts` není holé `#fff`. Nový mirror záměrně
nevznikl, `theme-hex-parity` v `scripts/check-tokens.mjs` hlídá jen jednu
cestu a druhý soubor by z dohledu vypadl.

Každá šablona vrací `html` **i** `text`. Textová varianta není volitelná —
bez ní roste spamové skóre. Výjimka je reset hesla: Payload u
`forgotPassword` umí jen `generateEmailHTML`.

| šablona | registrace |
|---|---|
| `templates/formSubmission.ts` | `beforeEmail` v `formBuilderPlugin` |
| `templates/resetPassword.ts` | `auth.forgotPassword` na kolekci `users` |

`RESET_TOKEN_HOURS` je zdroj pravdy pro `forgotPassword.expiration` i pro
text v mailu — nechat je rozejít znamená lhát uživateli o platnosti odkazu.

## Co dorovnává `wrapFormEmails`

Plugin form-builder posílá dál i **prázdné hlavičky**. `from: ''` je přitom
past: Resend si default dosadí (`mapFromAddress`), ale nodemailer dělá
`{ from: default, ...message }`, takže prázdná hodnota default **přepíše** a
SMTP mail bez odesílatele odmítne. Hook proto `from`, `to` i `replyTo`
dorovnává z `src/email/config.ts`.

Dva druhy mailu se rozlišují podle adresáta — když `to` obsahuje hodnotu pole
`email` z odeslaných dat, je to autoresponder (bez tabulky odpovědí a bez
odkazu do adminu), jinak notifikace klubu.

`beforeEmail` se volá z **afterChange** hooku
(`plugin-form-builder/dist/collections/FormSubmissions/hooks/sendEmail.js`),
takže `doc.id` na parametrech reálně je, i když je typ deklaruje jako
`BeforeChangeParams`. Bez toho by v notifikaci nebyl odkaz do administrace.

## Kontaktní formulář

Adresáty i texty drží dokument `forms` v databázi, zakládá je
`scripts/seed/seed-contact-form.ts` (notifikace klubu + potvrzení odesílateli).
Seed umí i **doplnit e-maily existujícímu formuláři** — starší verze je
neuměla, takže formulář v produkci je bez nich a je nutné seed spustit znovu.

Pole „E-mail od" zůstává v seedu prázdné záměrně: odesílatele dorovná
`wrapFormEmails` z `EMAIL_FROM_ADDRESS`, takže změna adresy je otázka env
proměnné a ne editace dokumentu v databázi.

# Systémové stránky

Handoff `design_maintance/HC Cestice Systemove Stranky.dc.html` — 404, 500,
údržba a prázdné stavy.

| stránka | soubor |
|---|---|
| 404 | `src/app/(landing)/not-found.tsx` |
| 500 | `src/app/(landing)/error.tsx` |
| chyba v root layoutu | `src/app/global-error.tsx` |
| údržba | brána v `src/app/(landing)/layout.tsx` + náhled `/udrzba` |

Společné díly: `landing/ui/ErrorCode.tsx` (obří obrysový kód + `ErrorMeta`),
`landing/ui/PuckTrail.tsx`, utility `text-stroke-none`, `hatch-lime` a
animace `--animate-puck-trail(-fast)` v `globals.css`.

## 500 nesmí stát na `SubpageShell`

Error boundary **musí** být Client Component, takže do ní nesmí `async`
`SubpageShell` (tahá Payload). Je to zároveň jediná správná volba: kdyby si
chybová stránka načítala navigaci a patičku z databáze, spadla by na téže
chybě, která ji vyvolala. Handoff to potvrzuje — jeho 500 má nahoře jen logo.

Next 16 předává error boundary **`retry`**, ne `reset`
(`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`).
`reset` pořád existuje, ale jen překreslí boundary bez nového fetche, takže
u serverové chyby by tlačítko „Obnovit stránku" nic neudělalo.

`global-error.tsx` nahrazuje root layout, takže k němu nedoteče `globals.css`
ani `next/font`. Barvy proto jdou inline z `LANDING_COLORS` (text na plochách
je `on-contrast`, ne `#fff`) a `metadata`
export tam nefunguje (titulek se dává Reactovým `<title>`). Kompozici 500
záměrně nekopíruje — bez tokenů by z ní byl duplikát, který se rozejde
při první změně designu.

## Režim údržby

Přepínač je v adminu: **Nastavení webu → Režim údržby** (`siteConfig.maintenance`).

Brána žije v root layoutu, protože je to jediné místo, kterým prochází celý
veřejný web. Admin má vlastní root layout pod `(payload)`, takže se do
administrace dostanete i při zapnuté údržbě — proto tu **není middleware**.

- `fetchMaintenance()` (`landing/data/maintenance.ts`) je tagovaná cache, ne
  `fetchSiteConfig()`: ta je obalená jen React `cache()`, což platí v rámci
  jednoho renderu, ne mezi requesty. Tag přepíná `hooks/revalidateMaintenance.ts`
  — bez něj by změna v adminu nezabrala vůbec (TTL `unstable_cache` je rok).
- Hook revaliduje profilem `{ expire: 0 }`, **ne doporučovaným `'max'`**.
  `'max'` je stale-while-revalidate: první návštěvník po zapnutí dostane
  ještě starou stránku a údržba se objeví až tomu dalšímu (ověřeno — první
  request po `revalidateTag(tag, 'max')` vrací běžný web). U vypínače webu
  je to chyba. `updateTag()` expiruje okamžitě taky, ale jde volat jen ze
  Server Action; admin ukládá přes REST route handler, kde vyhodí `E872`.
- `hasSession()` (`landing/data/session.ts`) se volá **jen když je režim
  zapnutý**. `headers()` je dynamické API a jeho bezpodmínečné čtení v root
  layoutu by zrušilo prerender celého webu.
- Přihlášeného správce brána pouští dál, takže z jeho prohlížeče zapnutý
  režim vypadá jako nefunkční. Proto se mu (a v náhledu konceptů) nad
  obsahem vykreslí `MaintenanceNotice` — lišta „Režim údržby je zapnutý".
- Obě funkce chybu spolknou a vrátí `false`. Nedostupná databáze nesmí
  shodit stránku, na které se právě hlásí, že je něco rozbité.
- Fáze schématu: lokálně to dojede na `push`, do produkce jde migrace
  `20260821_053907_add_maintenance_mode` (tři sloupce na `site_config`).

Co brána **neumí** a je potřeba o tom vědět:

- **Nevrací HTTP 503.** Layout na to nemá API; indexaci brzdí jen
  `<meta name="robots" content="noindex">`. Pro krátkou plánovanou údržbu to
  stačí, pro delší odstávku je korektní 503 s `Retry-After` — to už chce
  middleware, který si flag čte přes vlastní API routu s krátkou TTL.
- **Neušetří dotazy do databáze.** Layout `children` nevykreslí, ale Next je
  stejně vyrenderuje, takže obsah stránky skončí v RSC payloadu (ne ve
  viditelném HTML) a dotazy proběhnou. Údržba je tedy vzkaz návštěvníkům,
  ne odlehčení serveru.

## Prázdné stavy

`landing/ui/EmptyState.tsx` — jedna komponenta místo pěti různých
jednořádkových odstavců, které měl každý výpis vlastní. `actions` je
**povinné**: slepá ulička („Zatím tu žádné články nejsou.") je nejhorší
možná odpověď na aktivní filtr.

Zapojení: `PostsListGrid`, `GalleryGrid` (obojí přes `CardGrid empty`),
`ResultsList`, `FixturesRail` a widget `MatchesWidget`. Katalog všech
variant je na `/vzory/prazdne-stavy`.

- `frame="bare"` je pro vložení do karty, která už svůj rámeček má
  (widget Zápasy) — jinak by vznikla karta v kartě.
- `FixturesRail` bez zápasů vrací `null`, dokud nedostane `emptyState`.
  Výřez na home page se u dohrané sezóny má dál skrývat, na `/zapasy` by ale
  po hlavičce „Rozlosování" nenásledovalo nic a vypadalo by to jako chyba.
- Uppercase popisky pod kartami v handoffu (`Aktuality · filtr bez výsledků`)
  jsou anotace pro čtenáře designu, ne text pro návštěvníka. Žijí **jen**
  v katalogu `/vzory/prazdne-stavy`.
- `NextMatchWidget` zůstal záměrně mimo: jeho prázdný text je editovatelný
  v CMS a sedí v tmavé kartě s countdownem. `EmptyState` s ikonou a CTA je
  bílý a handoff pro tuhle situaci tmavou variantu nekreslí.

## Známé mezery

- SSR HTML stránky 404 je v dev režimu prázdné (`id="__next_error__"`)
  a obsah se dohydratuje na klientu. **Není to důsledek `error.tsx`** —
  ověřeno porovnáním s odebraným souborem. Chování v produkčním buildu
  ověřené není.
- 404 stojí na `SubpageShell`, takže si tahá navigaci a patičku z Payloadu.
  Při nedostupné databázi spadne i ona. Není to regrese (platilo to i dřív),
  ale u chybové stránky je to nešťastné.
- `LandingNav` žije uvnitř bloku Hero (`blocks/Hero/Component.tsx`). Když
  správce blok Hero v CMS odstraní, na homepage nebude navigace nahoře.
  Po scrollu (480 px) se objeví `StickyNav`, kterou `GlobalNav` vykresluje
  v `src/app/(landing)/layout.tsx`, ale horní lišta patří také tam.
- ~~`Dockerfile` nekopíruje `bun.lock`~~ — doplněno spolu s větví pro `bun`
  v install i build kroku; base image zvednutý na `node:24-alpine`, protože
  `payload-auditor` má `engines.node: ">=24"`.
- `tests/e2e/frontend.e2e.spec.ts` je nedotčená Payload šablona a padá už
  dnes — regresní síť pro navigaci neexistuje. Unit testy pokrývají jen čistou
  logiku (`navHref`, `isNavItemActive`, adaptér `navigationOverrides`).
- `revalidateRedirects` je jen na `afterChange` (`plugins/index.ts`). Smazané
  přesměrování zůstane v cache `getCachedRedirects` do vypršení TTL (3600 s).
  Řešením je přidat `afterDelete` do `overrides.hooks` pluginu.
- `matches.displayTitle` (titulek v adminu) odděluje týmy malým „x", web
  (`matchTitle`) „×". Hodnota je uložená, takže sjednocení znamená migraci
  dat všech zápasů a změnu hooku `matchDisplayTitle`; zatím se nevyplatí.

# Typografie — standardní škála Tailwindu

Od 15. 10. 2026 jede celý web na **výchozích velikostech písma Tailwindu**
(`text-xs` 12, `text-sm` 14, `text-base` 16, `text-lg` 18, `text-xl` 20,
`text-2xl` 24, `text-3xl` 30, `text-4xl` 36, `text-5xl` 48) s responzivními
prefixy, ne na vlastních px tokenech. Rozhodnutí uživatele: tokeny z
handoffu (13/15/17/21/26 px…) se k sobě nehodily a mezi stránkami se
míchaly.

Převod udělal skript jedna ku jedné (nejbližší krok):

| dřív | teď |
|---|---|
| `text-caption` 12 | `text-xs` |
| `text-meta` 13 | `text-sm` |
| `text-body` 15 | `text-sm md:text-base` |
| `text-lead` 17 | `text-lg` |
| `text-card-title` 21 | `text-xl` |
| `text-panel-title` 26 / `-lg` 30 | `text-2xl` / `text-3xl` |
| `text-section-title` 28 / `-md` 34 / `-lg` 38 | `text-3xl` / `text-4xl` / `text-4xl` |
| `text-claim` 32 / `-lg` 52 | `text-3xl` / `text-5xl` |
| `text-numeral-xs…2xl` 19–48 | `text-xl` … `text-5xl` |

- **Tučnost** běžného textu je o stupeň lehčí než v handoffu (rozhodnutí
  uživatele 15. 10. 2026 — web působil těžce a široce): text do
  `text-lg` má `font-bold` / `font-semibold` / `font-medium` místo
  `extrabold` / `bold` / `semibold`. `font-extrabold` patří nadpisům
  (`Heading.tsx`), skóre a číslům (`Numeral.tsx`) a jménům týmů v tabuli;
  tlačítka (`components/ui/button`) mají `font-bold`.
- Výjimky, které zůstávají tokeny (definované v `@theme`, registrované
  v twMerge): `text-eyebrow` (11px mikro-label verzálkami, Tailwind krok
  nemá), `text-watermark-*` (dekorativní obrysové nápisy 110–260 px)
  a **fluidní display škála** — `clamp()` mezi mobilem a desktopem, kterou
  Tailwind nevyjádří: `text-title-*` (nadpisy hero a podstránek), `text-score-*`
  (skóre), `text-hero-*`, `text-countdown*`, `text-contact-*`, `text-year`,
  `text-jersey*` a `text-error-code`.
- Staré tokeny (`text-caption` … `text-numeral-*`) jsou **smazané** z `@theme`
  i z registru twMerge (`src/lib/utils.ts`); poslední uživatel,
  `LandingFooter.tsx`, je převedený (odkazy `text-sm`, copyright `text-xs`).
  Třída, která by na ně zbyla, se tiše nevygeneruje, proto je hlídá pravidlo
  `no-legacy-font-token` v `scripts/check-tokens.mjs`.
- Výchozí velikosti Tailwindu nesou i `line-height`. Kde na řádkování
  závisí zarovnání (časová osa zápasu: `h-5 md:h-6` = řádek
  `text-sm` / `md:text-base`), musí se měnit spolu.
- `cn('text-sm md:text-base', className)` s jinou velikostí v `className`
  ponechá `md:text-base` (twMerge maže jen stejnou variantu). Komponenta,
  která velikost přebírá z props, má mít základní velikost bez
  responzivního prefixu, nebo ho přebít i v props.

# Responzivita — tři stupně, ne dva

Handoffy v `design_*/` jsou kreslené pro **1440px**. `md:` (768px) proto
**není** místo pro desktopovou hodnotu z handoffu; ta patří na `lg:` (1024px)
a mezi mobil a desktop se vkládá mezistupeň. Breakpointy projektu
(`@theme` v `src/app/globals.css`):

| varianta | šířka | k čemu |
|---|---|---|
| `3xs:` | 360 | zúžené řádky na malých telefonech; `max-3xs:` je `< 360` |
| `2xs:` | 400 | |
| `xs:` | 528 | Tréninky: karta přestane být přes celou šířku |
| `sm:` / `md:` / `lg:` / `xl:` / `2xl:` | 640 / 768 / 1024 / 1280 / 1376 | |
| `nav:` | 1440 | hlavní navigace: pilulky `hidden nav:flex`, burger `nav:hidden` |

Mikro-breakpointy (`3xs`, `2xs`, `xs`) jsou jen v `@theme`, bez
`@custom-variant`; arbitrární `min-[22.5rem]:` a spol. hlídá pravidlo
`no-arbitrary-breakpoint`. `nav:` je na 1440 a ne na `xl`, protože deset
položek se vedle loga a CTA vejde až tam.

Pravidlo už dřív platilo pro svislý rytmus (`SectionShell`), navigaci
(`NavPills` je `hidden nav:flex`), mřížky výpisů (`CardGrid`) a watermarky
(`Watermark` od `lg`). Od 22. 8. 2026 platí i pro **vnitřní odsazení
panelů**: každá zelená/bílá karta jede na `p-4.5 md:p-<mezistupeň>
lg:p-<handoff>`. Dřív skákaly rovnou (`p-4.5 md:p-13`), takže si na 768px
displeji braly okraje panelu až pětinu jeho šířky.

Doložení, že se desktop nezměnil: `node shot.mjs --bp=desktop` před a po,
`scrollHeight` v `report.json` musí sedět na pixel na všech routách.

Vodorovné zarovnání stránky drží tokeny `px-gutter` (odsazení od okraje,
14–40 px) a `max-w-page` (šířka celého webu, 1560 px) místo
`px-[clamp(…)]` a `max-w-[97.5rem]`; viz „Design tokeny".

Tři opakující se pasti:

- **Vestavěné `.container` Tailwindu.** Generuje `max-width` pro **každý**
  `--breakpoint-*`, tedy i pro mikro-breakpointy pod `sm`, takže by se
  kontejner na displeji 360–639 px ořezal na 360 / 400 / 528 px. Projekt
  proto má vlastní `.container` (`@layer utilities` v `globals.css`) s
  `max-width: none` a šířkou od `sm` výš, která se přebíjí `@variant` bloky
  níž. Nový breakpoint, který má kontejner omezit, se tam musí doplnit
  ručně.
- **`minmax(<X>rem,1fr)` v `auto-fit` mřížce.** Když je `X` širší než
  vnitřek kontejneru (patička má na 320px displeji 256px), dráha kontejner
  přeteče a `overflow-hidden` obsah ustřihne. Píše se
  `minmax(min(<X>rem,100%),1fr)` — spadne na šířku kontejneru bez
  breakpointu. Platí v `Club`, `Stats`, `ContactForm` a `LandingFooter`.
- **`sizes` u fotek musí kopírovat tytéž zlomy jako mřížka.** Když se
  mřížka posune z `md:grid-cols-3` na `lg:grid-cols-3`, ale `sizes` zůstane
  `(max-width: 48rem) 100vw, 33vw`, tablet si tahá třetinové fotky do
  polovičních dlaždic.

# Design tokeny

Zdroj pravdy je `@theme` v `src/app/globals.css`. Komponenty se na hodnoty
odkazují utilitou, ne arbitrární hodnotou (`px-gutter`, ne
`px-[clamp(…)]`); hlídá to `scripts/check-tokens.mjs` (Husky `pre-commit`
a krok `check` v CI).

| skupina | tokeny | utility |
|---|---|---|
| spacing | `gutter` (okraj stránky/sekce), `gutter-tight` (PageCanvas tight, chyba 500), `gutter-nav` (lišta článku), `split-gap` (mezi sloupci dvousloupcového bloku), `hero-gap`, `hero-inset` (obsah hero přes fotku), `panel` (vodorovný padding velkého panelu), `panel-y` (svislý padding hlavičky zápasu) | `p-`, `m-`, `gap-`, `inset-`, `w-`, `h-`… (všechny spacing prefixy) |
| container | `page` (97,5 rem), `article` (51,25 rem — tělo článku a `RawHtml`) | `max-w-page`, `max-w-article` |
| tracking | `display` −0,06 em, `title-tight` −0,04, `title` −0,035, `heading` −0,03, `subheading` −0,02, `snug` −0,01; verzálky `caps-sm` 0,08, `caps-md` 0,12, `caps-lg` 0,16 (Eyebrow, Kicker) | `tracking-*` |
| leading | `copy` 1,55, `title` 1,02, `title-tight` 0,98, `heading` 1,15, `heading-tight` 1,05, `display` 0,9, `score` 0,82 | `leading-*` |
| radius | `card` 36, `section` 30, `panel` 28, `block` 26, `tile` 24, `thumb` 22, `row` 20, `badge` 18, `icon` 16, `field` 14, `item` 12, `chip` 8, `tag` 4 (px) | `rounded-*` |

Radius: holé `rounded` a výchozí stupně `sm`–`3xl` v landingu zakazuje
`no-default-radius`; `full` a `none` smí zůstat.

## Průhlednost na tmavém

Bílá s průhledností na tmavých a zelených plochách a přes fotky je žebřík
`on-contrast-*` (použitelný pro `text-`, `bg-`, `border-`, `divide-`
i `placeholder:`), ne `white/N`:

| stupeň | průhlednost | typické použití |
|---|---|---|
| `on-contrast` | 100 % | text a ikony na ploše `contrast` |
| `-strong` | 90 % | nejsilnější text, skleněné plochy |
| `-soft` | 80 % | hlavní text na tmavém |
| `-muted` | 70 % | meta text |
| `-subtle` | 60 % | popisky |
| `-faint` | 50 % | velmi tlumený text |
| `-ghost` | 40 % | obrys tlačítka, placeholder |
| `-line` | 30 % | linky a rámečky skla |
| `-glass` | 16 % | výplň skleněného tlačítka |
| `-wash` | 10 % | nejjemnější výplň, dělicí linka |

Černá je `scrim` (`bg-scrim/10`). Holé `white` a `black` s předponou
`text-`/`bg-`/`border-`… hlásí `no-white-black` i s hintem na správný token.
Žebřík nahradil 37 různých hodnot `white/N`; sousední stupně se slily s
odchylkou nejvýš ~5 procentních bodů.

## Utility a vzory v `globals.css`

- `bg-split` (90°) a `bg-split-diagonal` (135°): půlený podklad cihlová |
  zelená pro prohru po prodloužení/nájezdech (`Badge split`, čtvereček formy).
- `dot-grid`: tečkovaný vzor pro `DotGrid`. `--alpha()` je build-time funkce
  Tailwindu a v inline `style` ji prohlížeč nezná, proto vzor žije v CSS
  a komponenta nese jen třídu. Stejně jsou řešená šrafování (`hatch`,
  `hatch-white`, `hatch-lime`).

## shadcn vrstva je alias na značku

Proměnné shadcn (`--background`, `--primary`…) nemají vlastní paletu, jsou
to aliasy na značkové tokeny, takže tmavý režim (`--ds-*`) se přenáší sám:

| shadcn | značka | proč |
|---|---|---|
| `primary` | `club-dark` | bílý text na `club` má ~3,4 : 1, na `club-dark` ~5,1 : 1 (AA) |
| `ring` | `club` | u prstence stačí 3 : 1 pro netextové prvky |
| `destructive` | `danger` | |
| `border` | `--ds-line-mid` | |
| `input` | `--ds-line` | |

oklch „slate" vrstva ze šablony neexistuje; `components.json` je `new-york`
a `baseColor: slate` slouží jen pro `shadcn add`. Shadcn třídy
(`bg-primary`, `text-muted-foreground`…) patří jen do `components/ui`
a do šablonového frontendu, v landingu je zakazuje `no-shadcn-in-landing`.

## twMerge a nový token

`src/lib/utils.ts` (`extendTailwindMerge`) zná jen výchozí názvy Tailwindu.
Nový token se musí zapsat i tam: `--text-*` do skupiny `font-size`, `--spacing-*`,
`--container-*`, `--tracking-*` a `--leading-*` do `theme`. Bez toho by
`cn('px-gutter', 'px-4')` nechalo obě třídy (rozhodne pořadí v CSS) a `text-*`
token by se bral jako barva textu a zahodil by se vedle skutečné barvy.
**Radiusy jsou záměrně neregistrované:** registrace by změnila, která z dvojice
`rounded-*` v `cn()` vyhraje.

## `check-tokens`

Všechna pravidla jsou `error` (exit 1); přepínač `--strict` je no-op kvůli
starým voláním. Skenuje se celé `src/` včetně `components/ui`, jen generovaný
`payload-types.ts` se přeskakuje. Pravidla
`no-shadcn-in-landing`, `no-dark-variant-in-landing` a `no-default-radius`
platí jen v `src/landing/` a `src/app/(landing)/`. Výjimka:
`// token-check-ignore: <důvod>` na stejném nebo předchozím řádku; prázdný
důvod je pořád chyba.

| pravidlo | co hlídá |
|---|---|
| `no-raw-hex`, `no-rgb-literal`, `no-arbitrary-color-class`, `no-default-palette` | barvy mimo tokeny |
| `no-white-black` | `white`/`black` místo `on-contrast-*` / `scrim` |
| `no-arbitrary-radius`, `no-default-radius` | zaoblení |
| `no-arbitrary-font-size`, `no-legacy-font-token` | velikosti písma |
| `no-arbitrary-spacing`, `-tracking`, `-leading`, `-font-clamp`, `-breakpoint`, `-aspect` | arbitrární hodnota, kterou už pokrývá token nebo výchozí třída; hodnoty čtou z `@theme`, takže **nový token se začne hlídat sám** |
| `no-shadcn-in-landing`, `no-dark-variant-in-landing`, `no-pill-import` | vrstvy a zrušené moduly |
| `style-allowlist` | inline `style={{` jen v souborech z allowlistu |
| `theme-hex-parity` | `LANDING_COLORS` (`src/landing/tokens.ts`) se shoduje s `@theme` |
| `twmerge-font-size-parity`, `twmerge-theme-parity` | každý token je registrovaný v `src/lib/utils.ts` |

`LANDING_COLORS` je hex zrcadlo jen pro kontexty bez CSS proměnných (admin,
SVG `data:` URI, `global-error.tsx`, e-maily, `theme-color`); do komponent
se nikdy neimportuje.

# Sekce Tréninky (blok `landingTrainings`)

Rozpis ledových hodin jsou karty zarovnané na pravou hranu pod nadpisem:
zvýrazněná hodina je tmavá karta s lime štítkem, ostatní bílé. Celý rozpis
spravuje správce v adminu na home stránce, blok **Landing — Tréninky**.

| pole | role |
|---|---|
| `kicker` | pilulka nad nadpisem; prázdné = skryje se |
| `headlineRest` | konec nadpisu **bez tečky** — tečku kreslí design (`text-club`) |
| `defaultVenue` | místo pro karty, které vlastní `venue` nemají |
| `rows[]` | jedna karta = jedna ledová hodina (`day`, `time`, `group`, `venue`, `note`, `joint`, `hiddenOnWeb`) |
| `perex` | volitelný text pod nadpisem; prázdné = jen nadpis a karty |

Pravidla, když se toho budete dotýkat:

- Karty jsou **zalamovaný flex řádek** (`flex-wrap justify-end`), ne mřížka ani
  scrollovaný pás — přesně jak je kreslí handoff. Šířku si berou z obsahu
  s minimem `min-w-60` (240px), takže rozpis může růst podle přidělených hodin
  a přebytek se přelije na další řádek. Dřív to byl pás se scroll-snapem
  a `RailArrows`; obojí bylo proti designu (karty přes půl sekce).
- Nadpis a karty stojí **pod sebou**, ne ve dvou sloupcích gridu. Perex patří
  **pod nadpis** (`max-w-130`): v handoffu je vedle nadpisu jen prázdná
  rozpěrka (`flex: 1 1 0%`) a text v ní se lámal do úzkého sloupce vedle
  nadpisu, který na jednom řádku sotva vyjde.
- Typografie karty kopíruje handoff a je o dva stupně nižší, než bývala:
  den `CardTitle sm` (21px), štítek `Badge xs` (11px), čas `Numeral sm`
  (22px, ne 36/48px), místo `text-caption`. Radius je `rounded-thumb` (22px)
  a bílá karta má jen `border-line-soft`, žádný `shadow-tile`.
- Nadpis je `SectionTitle size="md"` (28 → 34px), ne `xl`. Handoff má 34px;
  velikost `xl` (claim ve footeru) sekci vizuálně přebíjela.
- `hiddenOnWeb` se filtruje **až po** rozhodnutí, jestli blok vlastní rozpis
  má — jinak by se po skrytí všech řádků vrátily ukázkové hodiny z fallbacku
  v `content.ts`.
- Fotka tréninku a zelená karta s akcí (`photo*`, `event`) v bloku **už nejsou**
  — handoff je nekreslí. Odstraněné jsou z komponenty, z configu i ze schématu,
  takže hodnoty, které v nich měly dokumenty založené před 21. 8. 2026, jsou
  ztracené; vracet je zpátky znamená revert migrace níž.
- Schéma rozšiřuje migrace `20260821_093653_trainings_cards` (aditivní:
  `venue`, `note`, `hidden_on_web`, `kicker`, `default_venue`) a zužuje
  `20260821_095556_trainings_drop_extras` (**destruktivní** — dropne
  `photo_id`, `photo_title`, `photo_subtitle` a `event_*` na
  `pages_blocks_landing_trainings` i na verzovací tabulce).

# Synchronizace VČHL (ahl.cz)

Zápasy, výsledky, tabulka, branky a sestavy se z ahl.cz stahují automaticky.
AHL **vždy vyhrává** — synchronizovaná pole jsou v adminu jen pro čtení.

| co | kde |
|---|---|
| ovládací panel (spustit, nanečisto, historie, varování) | admin **Hokej → Synchronizace VČHL** (`/admin/vchl-sync`, `components/admin/VchlSync/`) |
| nastavení (části, frekvence, notifikace) | global `vchl-sync` (`globals/VchlSync/`) |
| historie běhů | kolekce `vchl-sync-runs` (Systém, read-only, retence 60 dní) |
| endpointy panelu | `POST /api/vchl-sync/run`, `GET /api/vchl-sync/status` (`endpoints/vchlSync.ts`, jen přihlášený) |
| job | `src/jobs/vchlSync/` (`task.ts`, `run.ts`, `isDue.ts`, `sync/*`) |
| klient a parsery AHL | `src/ahl/` (jsdom, fixtury v `tests/fixtures/ahl/`) |
| revalidace | `POST /internal/revalidate` (`app/internal/revalidate/route.ts`) |

## Tick, ne frekvence v configu

Frekvence cronu je v Payloadu statická, a správce ji chce měnit bez redeploye.
Cron proto tiká pevně **každých 5 minut** (`VCHL_CRON = '0 */5 * * * *'` —
u šestipolového výrazu je první pole vteřina) do fronty `vchl` a o tom, jestli
se opravdu synchronizuje, rozhoduje `runVchlSync` podle globalu:

- vypnuto (`enabled`) nebo nic na řadě → konec, **nezapíše se nic**;
- *zápasový režim*: od začátku zápasu Čestic po `matchdayWindowHours`
  (48 h), dokud zápas není odehraný se zápisem → každých
  `matchdayIntervalMinutes` (15);
- *klidový režim*: jinak každých `idleIntervalHours` (6);
- po `error` se zkouší znovu v rychlém intervalu (`isDue.ts`, tolerance 1 min
  kvůli pětiminutové mřížce).

**Tick nesmí nic zapisovat.** Auditor loguje `afterChange` globalů i kolekcí,
takže uložení stavu do globalu by přidalo 288 záznamů denně. Stav žije jen
v `vchl-sync-runs` (auditor ji vynechává) a záznam vzniká jen při skutečném
běhu. Zápis do `matches` / `players` / `seasons` jde jen tam, kde diff našel
změnu — druhý běh nad stejnými daty musí skončit „0 změn" a bez záznamu
v Auditním logu. Zápisy jdou s `context: { disableRevalidate: true }`.

Zámek proti souběhu cronu a ručního běhu je **in-process** na `globalThis`
(`Symbol.for('hccestice.vchlSync.lock')`; modulová proměnná by se v devu
rozdvojila, Turbopack bundluje instrumentation a route handlery zvlášť).
Platí jen pro **jednu instanci**. Zámek drží token běhu: `finally` ho uvolní
jen tomu, kdo ho převzal, takže visící běh po 15 min (kdy se zámek ignoruje)
nepustí třetí souběžný.

Při **rolling deployi** mohou krátce běžet dva procesy (starý a nový), každý
s vlastním zámkem a vlastním cronem — to je stejná situace jako škálování.
Chrání jen `unique` indexy na `ahl.matchId` a `ahlPlayerId` (souběh zápis spíš
shodí, než zdvojí zápas nebo hráče s ID z AHL). **Nechrání** hráče párované
jménem (`ahlPlayerId` ještě není), soupeře (`opponents` se zakládají podle
názvu) ani koncepty reportáží (`ahl.draftPostCreated` se zapisuje až po
založení) — tam souběh může vyrobit duplikát, který se čistí ručně.

## Past s crony: po deployi se samy nespustí

`_initializeCrons()` běží jen při `getPayload({ cron: true })` — a to volá
jen `initReq` z `@payloadcms/next` (request do adminu nebo API;
`payload/dist/index.js:462`). Frontend volá `getPayload({ config })` bez
cronu a `/health` Payload nevolá vůbec, takže po každém redeployi cron stojí,
dokud někdo neotevře admin. Platilo to i pro úklid auditního logu.

Řeší to `src/instrumentation.ts` → `startPayloadCrons()`
(`jobs/vchlSync/startCrons.ts`). Spouští se jen když:

- `NEXT_RUNTIME === 'nodejs'`,
- `NEXT_PHASE !== 'phase-production-build'` (ne při prerenderu na runneru),
- `PAYLOAD_CRON !== 'off'` — vypínač pro lokální vývoj a CI; `jobs.shouldAutoRun`
  ho hlídá podruhé, protože `initReq` z requestu do adminu cron nastartuje taky.
  V produkci nenastavovat.

Bez `await` a s chytáním chyb (Sentry tag `vchl.stage: startup`), aby start
serveru nečekal na databázi ani nespadl.

## Revalidace přes `/internal/revalidate`

`revalidateTag` / `revalidatePath` z cronu (mimo request) padají na
`Invariant: static generation store missing` — chybí `workAsyncStorage`
(`next/dist/server/web/spec-extension/revalidate.js`). Job proto po zápisu
jednou zavolá interní route handler, uvnitř kterého store existuje
(`jobs/vchlSync/revalidate.ts`). Ruční běh jde stejnou cestou, aby se
nelaďila dvě chování.

- Volá se na **`127.0.0.1:$PORT`**, ne `localhost` (standalone poslouchá jen
  IPv4, viz healthcheck v Nasazení).
- **`CRON_SECRET` je v produkci povinný.** Bez něj handler vrací 401 a job
  revalidaci přeskočí (varování v logu) — data se zapíšou, ale web se obnoví
  až po vypršení cache. Autorizace `Authorization: Bearer <CRON_SECRET>`
  s `timingSafeEqual`.
- Selhání revalidace běh neshodí (data jsou zapsaná).
- Handler leží mimo route groupy a je `force-dynamic`, takže nad ním není
  `loading.tsx` (viz „Cache a renderovací režimy").

## Idempotence: klíče

| entita | klíč z AHL | uloženo v | poznámka |
|---|---|---|---|
| zápas | `zapasid` | `matches.ahl.matchId` (unique) | stabilní od rozpisu po výsledek; zápas bez ID se napoprvé spáruje podle sezóna + den + soupeř |
| hráč | `hracid` | `players.ahlPlayerId` (unique) | stabilní **napříč ročníky**; záloha je normalizované jméno, při shodě víc hráčů se nespáruje a zapíše varování |
| ročník | `souteznirocnikid` | `seasons.ahl.competitionYearId` | **mění se každý ročník** |
| tým Čestice | `ucastniksouteznihorocnikuid` | `seasons.ahl.participantId` | **mění se každý ročník**, stabilní ID klubu AHL nemá |
| soupeř | jen názvy | `opponents.aliases[]` | neznámý se založí a zapíše varování; hardcode `LEGACY_ALIASES` v `sync/opponents.ts` slouží jen k prvnímu naplnění |
| branky, sestava, tabulka, tresty, statistika zápasu | žádné | pole uvnitř dokumentu (`matches.goals` / `lineup` / `penalties` / `stats`) | **přepisují se celé**, jen když se normalizovaný snapshot liší od DB; tresty jen naše, soupeřovy se neukládají |

- ID ročníku a týmu patří k **sezóně**, ne do globalu. Prázdná se doplní
  autodetekcí (ročník je `<option selected>`, tým je odkaz `ucastnici/?…uid=`
  u „Čestice") — umí jen **aktuální** ročník; 1. ročník (2025/26: 973 / 8650)
  doplnila migrace.
- **Odpojení zápasu od AHL**: smazat `ahl.matchId`. Pole se odemknou
  a synchronizace zápas přestane znát **natrvalo**. Přátelák nebo turnaj bez
  `matchId` je plně editovatelný. Legacy párování (podle dne a soupeře) bere
  jen zápasy, které job nikdy nezapsal (`ahl.syncedAt` prázdné); zápas
  s `syncedAt` a bez `matchId` je odpojený a blokuje založení nového zápasu
  se stejným dnem, stranou a soupeřem — job zapíše jen varování typu `other`
  („odpojen správcem, přeskočen"). Znovu připojit = vrátit ID ručně.
- Zamčení řeší field access `access/notSyncedFromAhl.ts`
  (`update: ({ doc }) => !doc?.ahl?.matchId`). Job píše přes Local API
  (`overrideAccess: true`), takže ho to nebrzdí. Podrobnosti, proč to při
  `create` funguje, jsou v komentáři souboru.
- Zápas, který z AHL zmizel, se **nemaže**, jen se zapíše varování.
  Neznámý hráč se zakládá jako `active: false`; existujícímu se doplní jen
  `ahlPlayerId` a prázdné číslo (jméno a fotka zůstávají ruční).

## Zvláštnosti HTML na ahl.cz

Žádné API ani iCal, jen HTML v UTF-8. Co překvapí:

- **Neexistující zápas vrací HTTP 200** s chybovou stránkou, takže stav
  nestačí; parser hlásí `AhlParseError`, když chybí `#zapas_full_portlet_inner_box`.
- **Třída `neni_zapis` ve výsledcích je nespolehlivá.** `hasReport` proto
  bere z detailu zápasu, ne z výpisu.
- **Rozhodující nájezd je zapsaný jako branka v 60:00** a započítá se
  střelci. V CMS se značí `strength: 'SN'`, v textu konceptu „nájezd".
- **`R` v tabulce je prohra v prodloužení/nájezdech** (sloupec `otLosses`),
  `VP` je výhra v prodloužení.
- **`scoreAfter` v CMS je NAŠE:SOUPEŘ**, na AHL domácí:hosté (`flipScore`
  v `sync/matchDetail.ts`).
- **Popisky play-off se liší mezi výpisem a detailem**; fázi odvozuje
  `phaseFromCompetition` (`ahl/parse/dom.ts`) normalizací a regexem, ne
  přesnou shodou.
- **Tabulka Tresty** se ukládá **jen za Čestice** (`matches.penalties`) —
  tresty soupeře jsme se rozhodli neukládat. Řádek nese jen **kód týmu**
  (`CES`, `ZH`), který nejde spárovat s názvem týmu, takže se strana určuje
  postupně: `hracid` hráče v sestavě → mapa kód→strana odvozená z branek →
  doplnění druhého kódu (`resolveSides` v `ahl/parse/match.ts`). Když stranu
  určit nejde, parser hodí `AhlParseError` a detail se přeskočí (běh nezapíše
  trest na špatnou stranu). „2 - Menší trest" se rozloží na minuty + druh;
  neznámý formát nechá surový text místo hádání.
- **Statistika zápasu** je na AHL domácí:hosté (ověřeno proti počtu trestů),
  v CMS NAŠE:SOUPEŘ (`stats.*Ours` / `*Opp`). **Střely se neberou**: 0:0 tam
  znamená „nevyplněno", ne žádné střely.
- Součet minut našich trestů se kontroluje proti `TM` v sestavě; neshoda
  zapíše varování typu `other` s `ref` `pim:<id>`.
- **Nečitelná tabulka Tresty neblokuje branky ani sestavu.** Parser pak vrátí
  `penalties: null` + `penaltiesError`; uložené tresty zůstanou beze změny,
  minutová kontrola se přeskočí a vznikne varování `other` s `ref`
  `penalties:<id>`. `detailVersion` se i tak zvedne (radši chybějící tresty
  u jednoho zápasu než nekonečné opakované stahování; čerstvý zápas se
  stejně stahuje 7 dní).
- Kód `OK - Trest do konce utkání` nemá v textu minuty, počítá se jako 20 min
  do `TM` (`PENALTY_CODE_MINUTES` v `ahl/parse/match.ts`), aby součet seděl.
- **Sestava i tresty se ukládají v kanonickém pořadí** (sestava podle čísla
  a jména, tresty podle času v sekundách a jména). AHL u shody příjmení
  (dva Javůrkové, dva Vašatové) pořadí nedrží, a `normalize` v `diff.ts`
  pořadí řádků zachovává — bez řazení by diff hlásil falešnou změnu
  a zbytečný zápis do Auditního logu. Při prvním běhu po nasazení se proto
  může jednou přepsat `lineup` zápasů uložených v původním pořadí.
- Jména: v zápisu „Sajdl, Lukáš", jinde „Kapucián Vojtěch   S" s příponou
  `JUN`/`S`/`SDor` (`ahl/names.ts`) — proto je klíčem `hracid`.
- Klient (`ahl/client.ts`): vlastní User-Agent, timeout 15 s, 1 retry, 400 ms
  mezi požadavky. Když parser nenajde očekávané řádky nebo sloupec, běh skončí
  `error` a **nic se nezapíše ani nesmaže**.

Detail zápasu se stahuje pro odehrané zápasy mladší než `RECENT_DAYS = 7`
(pozdní opravy zápisu) a pro starší odehrané zápasy **bez zápisu jen při
ručním/nanečisto běhu**. Cron tik (`trigger: 'cron'`) starší zápasy bez
zápisu nestahuje — zápas, který AHL nikdy nezapíše, by se jinak stahoval při
každém tiku. Ruční běh ho dotáhne a `hasReport` se nastaví z detailu
(`shouldFetchDetail` v `sync/matches.ts`). Další pravidla zápisu zápasu:
`played` se bez skóre ve výpisu nevrací na `scheduled`; `venue` z výpisu se
nastaví jen novému zápasu nebo prázdné hodnotě; doplnění času u zápasu
založeného na půlnoc (`00:00`) není „přeložení" (`isReschedule`).

Zápas **se zápisem zpracovaným starší verzí** se stáhne znovu při jakémkoli
triggeru, i cron tiku (`ahl.detailVersion` < `DETAIL_VERSION` v
`sync/matchDetail.ts`; `null` = verze 1). Je to jednorázový backfill po
nasazení nové vlastnosti — zhruba jeden požadavek na odehraný zápas aktuální
sezóny (`isCurrent`; starší sezóny job nesyncuje) —, po zápisu verze sedí
a zápas se zase přestane stahovat. Probíhá při prvním skutečném (due) běhu
se zapnutou synchronizací (`enabled`) a zapnutými částmi Výsledky + Detail
zápasu — nebo ručním „Spustit teď". **Konstantu zvýšit, kdykoli se ze zápisu
začne brát nové pole**, jinak ho už odehrané zápasy nikdy nedostanou.

## Sentry, notifikace, koncept reportáže

- **Cron monitor `vchl-sync-tick`** (`Sentry.withMonitor` v `task.ts`) dostává
  check-in z **každého** tiku, i prázdného. Hlídá, že plánovač vůbec běží
  (past výše), a nezávisí na `enabled`, takže vypnutí v adminu nespustí falešný
  poplach. Bez `NEXT_PUBLIC_SENTRY_DSN` je vše no-op.
- Fingerprinty (`jobs/vchlSync/sentry.ts`): rozbité HTML →
  `['vchl-parse', stránka]` (jedno issue místo 288 denně); varování →
  `['vchl-warning', typ, ref]`, do Sentry jen **nová** oproti poslednímu
  běhu, který skončil `ok`/`partial` (`error` běh varování nemá); selhání
  stahování (`AhlFetchError`) → `['vchl-fetch', <typ stránky>]`. Celý běh je
  jeden kořenový span `vchl.run`. Při `trigger: 'dry'` se do Sentry neposílá
  nic (jen log a výsledek).
- **Notifikace** (`notify.ts`, šablona `email/templates/vchlSync.ts`):
  selhání se hlásí **jen při přechodu** — když série `error`/`partial` dosáhne
  přesně `failureThreshold` (2) —, pak jednou „obnoveno". Jinak by v zápasovém
  režimu šlo 96 mailů denně. Noví hráči a soupeři se porovnávají s posledním
  úspěšným během (`ok`/`partial`). Prázdní adresáti = `siteConfig.contactEmail`. Odkazy v mailech skládá
  `getServerSideURL()` → `NEXT_PUBLIC_SERVER_URL`.
- **Koncept reportáže** (`sync/draftPost.ts`): `_status: 'draft'`, jen když
  zápas právě přešel do „odehráno se zápisem" a je mladší než 7 dní. Řídí se
  příznakem `ahl.draftPostCreated`, ne stavem, takže smazaný koncept se znovu
  nezaloží. `match.report` se **nenastavuje** — karta zápasu by odkazovala na
  nepublikovaný článek.

## Nová sezóna

1. V adminu založit sezónu a u ní zaškrtnout `isCurrent`.
2. ID ročníku a týmu **nevyplňovat** — doplní je autodetekce při prvním běhu
   (nebo tlačítko **Autodetekovat** na stránce Synchronizace VČHL). Sezóna, která
   už má obě ID, se přepíše jen po potvrzení (`/detect` bez `overwrite: true`
   vrací 409) — mezi sezónami AHL ukazuje ještě starý ročník.
3. Spustit „Nanečisto" a zkontrolovat diff, pak „Spustit teď".

## Nasazení

- Migrace `20261014_114308_vchl_sync` **před buildem** (viz Nasazení →
  Migrace). Je aditivní; přidává tabulky `vchl_sync*`, `matches_goals`,
  `matches_lineup`, `opponents_aliases`, sloupce `ahl_*`, enumy `payload_jobs`
  (task `vchlSync`) a datový krok (sezóna `2025-2026` → 973 / 8650).
  `down` vrací vše včetně sloupců, ale ne hodnoty ručně doplněné po migraci.
  Ověřeno `up` → `down` → `up` na čisté kopii schématu z `main`.
- Migrace `20261014_134131_vchl_penalties` **před buildem**, stejně jako
  předchozí. Je aditivní: tabulka `matches_penalties` (FK na `matches`
  s `ON DELETE cascade` a na `players` s `set null`), sloupce `stats_*`
  a `ahl_detail_version` na `matches`; na existující `matches` nepřidává žádné
  `NOT NULL` (nová tabulka polí má standardní `NOT NULL` na `_order`,
  `_parent_id` a `id`). `down` je odstraní. Backfill neproběhne sám po
  nasazení: zápasy se zápisem verze 1 se znovu stáhnou při prvním skutečném
  (due) běhu se zapnutou synchronizací a částmi Výsledky + Detail zápasu,
  nebo ručním „Spustit teď" (viz `DETAIL_VERSION`). `matches` nemá verzování, takže
  `_matches_v` tabulky nevznikají.
- Env v Coolify: **`CRON_SECRET`** (povinný, viz výše), `NEXT_PUBLIC_SERVER_URL`
  (odkazy v mailech; zapéká se do buildu), `PAYLOAD_CRON` **nenastavovat**,
  `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` jen pro upload source
  map při buildu (monitor cronu a chyby jdou přes DSN).
- Jednorázový backfill (spárování existujících zápasů, branky, sestavy) je
  ruční „Spustit teď" po nasazení; `enabled` je ve výchozím stavu vypnuté.
- Cron běží uvnitř Node procesu — víc instancí znamená víc tiků (viz zámek).
- Migrace `20261014_150444_match_slug` **před buildem**, stejně jako
  předchozí (prerender `/zapasy/[slug]` čte sloupec `slug`). Je aditivní:
  nullable sloupec `matches.slug`, SQL backfill pro existující zápasy
  (`YYYY-MM-DD-<opponents.slug>`, den v Europe/Prague, kolize `-2`, `-3`…)
  a až potom unikátní index `matches_slug_idx`. Kolize shodí migraci, ne
  běžící web. `down` index i sloupec odstraní.

# Detail zápasu

`/zapasy/[slug]` — jeden zápas: hlavička s tabulí, časová osa „Průběh
zápasu" ve stylu Livesportu a karta reportáže.

| co | kde |
|---|---|
| route | `src/app/(landing)/zapasy/[slug]/page.tsx` (SSG + ISR 600 s, `generateStaticParams`, `notFound()`) |
| výpis | `src/app/(landing)/zapasy/(vypis)/` (`page.tsx` + `loading.tsx`) |
| fetchery | `src/landing/features/matches/data/matchDetail.ts` (`fetchMatchDetail`, `resolveReport`, `fetchMatchSlugForPost`, `fetchMatchSlugs`) |
| view-model | `src/landing/features/matches/view/matchDetailView.ts` (čisté mapování, `pickReport`), `matchEvents.ts` (branky a tabule, sdílené s hero reportáže), `matchFormat.ts` (jediný zdroj pravidel zápasu: `orient` NAŠE:SOUPEŘ → domácí:hosté, `ScoreSuffix`, `SUFFIX_NOTE`, `outcomeNote`, `sideLabel`), `fixturesLayout.ts` (`pickLayout` pro `FixturesRail`) |
| komponenty | `src/landing/features/matches/components/*` (`MatchHeader`, `MatchTimeline`, `MatchReportCard`, `MatchJsonLd`), `src/landing/features/matches/components/MatchScoreboard.tsx` |
| slug | pole `matches.slug`, hook `src/hooks/matchSlug.ts`, helpery `src/lib/matchSlug.ts` a `slugifyCs.ts`; soupeře pro slug i titulek načítá `src/hooks/resolveOpponent.ts` (jednou na uložení, paměť v `req.context`) |
| sitemapa | `src/app/(landing)/(sitemaps)/matches-sitemap.xml/route.ts` |

## Slug

Formát `YYYY-MM-DD-<opponents.slug>` (den v Europe/Prague), např.
`2025-10-12-hc-zdar`; zápas bez soupeře dostane jen den. Generuje ho
`beforeChange` hook **jednou**, dokud dokument slug nemá. Při přeložení
zápasu ani přejmenování soupeře se **nemění** — odkaz, který už někdo
sdílel, má dál vést na tentýž zápas. Cenou je, že ve slugu může zůstat
zastaralé datum; je to záměr, ne chyba. Pravidla:

- Kolize (stejný den a soupeř, např. turnaj) dostane příponu `-2`, `-3`…
  (`uniqueSlug`). Stejnou logiku musí mít SQL backfill v migraci — formát
  měnit na obou místech.
- Ručně upravený slug se při uložení očistí (`slugifyCs`). Prázdné pole
  — i takové, ze kterého po očištění nic nezbude („???") — znamená
  „vygeneruj znovu". Ruční změna slugu rozbije už sdílené odkazy (stará
  adresa dá 404, přesměrování se nezakládá); upozorňuje na to popis pole.
- `slugifyCs`, **ne** `slugify` z Payloadu: ten zahazuje písmena
  s diakritikou celá (`Žamberk` → `amberk`), kdežto soupeři mají slug
  `sk-zamberk`. Proto `Opponents` předává `slugField({ slugify })` vlastní
  funkci nad `slugifyCs` (`HC Žďár` → `hc-zdar`, ne `hc-r`) a hook zápasu
  slug soupeře ještě jednou očistí. Existující slugy soupeřů se tím nemění
  (`slugifyCs(name)` dává tentýž výstup, ověřeno nad DB).
- Duplikát zápasu v adminu slug **nedědí**, je `unique`. `beforeDuplicate`
  na poli slug proto vrací **`null`**, ne `undefined`: Payload hodnotu
  přepíše, jen když hook vrátí něco jiného než `undefined`
  (`fields/hooks/beforeDuplicate/promise.js`), takže s `undefined` slug
  originálu zůstane, hook ho vezme za ručně zadaný a insert spadne na
  unikátním indexu. S `null` je `originalDoc.slug` prázdný (a `originalDoc`
  je bez `id`) a hook vygeneruje `…-2`. Stejně se duplikuje `ahl.matchId`
  (taky `unique`): kopie je ruční zápas bez vazby na AHL. Ověřeno
  `payload.duplicate` nad lokální DB.
- Synchronizace VČHL `slug` neposílá (`buildPatch` prochází jen klíče
  z `desired`), takže ho při `create` doplní hook a diff ho nikdy nehlásí
  jako změnu.
- Pole nemá `notSyncedFromAhl`: adresa patří webu, ne AHL.

## `(vypis)` a `loading.tsx`

Výpis je v route group `(vypis)` kvůli sekci „`loading.tsx` nesmí být nad
routou, která redirectuje": `loading.tsx` ve `zapasy/` by stál i nad
detailem a `notFound()` by po začátku streamingu vracelo HTTP 200. Group
URL nemění. Nový soubor, který má platit pro **oba** (např. `error.tsx`),
patří do `zapasy/`; to, co patří jen výpisu, do `(vypis)`.

## Vazba zápas ↔ reportáž

Dva směry a oba jsou legitimní: `matches.report` (ruční, jediný u archivu
2023/24) a `posts.match` (zapisuje synchronizace a koncept reportáže).
Rozhoduje se **při čtení**, ne zápisem do dokumentu — `resolveReport` /
`pickReport`:

1. `matches.report`, jen když je publikovaný;
2. jinak nejnovější **publikovaný** článek s `match` = id zápasu
   (řazeno `publishedAt`);
3. jinak nic.

Koncept se nikdy neodkáže (karta by vedla na 404). `resolveReport` je
sdílený s kartou zápasu (`reportHref`), aby výpis a detail neodkazovaly
jinam. Zpětný odkaz z reportáže na detail zápasu dělá `fetchMatchSlugForPost`:
`post.match` má přednost, archiv bez něj se dohledá dotazem na zápas
s `report = post.id`.

## Bloky detailu

- **Průběh zápasu** (`MatchTimeline`, `buildTimeline` v
  `matchDetailView.ts`) — jedna časová osa po třetinách místo dřívějších
  bloků Branky + Tresty (rozhodnutí uživatele 14. 10. 2026, předlohou je
  Livesport). Ukazuje **jen stranu HC Čestice**: naše góly (tmavý puk bez
  podkladu, stav, střelec, PP/OS/SN, asistence) a naše tresty (minuty
  v malém žlutém poli, od 5 min v červeném — token `--color-penalty`
  v `globals.css`, `danger`). Gól soupeře je jen tlumený řádek se stavem
  a názvem soupeře, kvůli průběhu skóre; jména střelce a asistentů typ
  `MatchTimelineEvent` vůbec nenese, takže nejdou ani do cache. Soupeřovy
  tresty se neukládají vůbec.
  - Rozhodující nájezd je v CMS `strength: 'SN'` a patří do úseku
    „Nájezdy", ne do 3. třetiny (viz Zvláštnosti HTML na ahl.cz).
  - Skóre úseku: třetiny 1–3 z `thirds` (synchronizace ukládá jen tři),
    když chybí, a u prodloužení vždy, se spočítá z branek úseku. Nájezdy
    skóre nemají.
  - Řazení je stabilní podle času, při shodném čase branka před trestem.
- **Souhrn** (`MatchSummary`, `buildMatchSummary` v
  `features/matches/view/matchSummary.ts`) — pravý sloupec vedle osy, pod případnou
  reportáží: kanadské body (G / A / B), počet gólů v PP / OS a tresty po
  hráčích. Rozhodnutí uživatele 15. 10. 2026: osa přes celou šířku 1320 px
  měla stav po gólu daleko od jména, takže zůstává ve sloupci
  `1.5fr | 1fr` a vedle ní stojí souhrn. Počítá se z osy **při vykreslení**,
  ne v cache (klíč `match-detail` se neměnil). Rozhodující nájezd (`SN`) se
  do bodů nepočítá. Samotná reportáž bez osy (archiv) je vodorovná karta
  přes celou šířku (`MatchReportCard wide`).
- **Statistika se na detailu nezobrazuje** (rozhodnutí uživatele
  14. 10. 2026). Data (`stats.*Ours` / `*Opp`) se dál synchronizují
  a view-model je nese kvůli rozhodnutí o `missingProtocol`.
- **Sestava na detailu není** — rozhodnutí uživatele 14. 10. 2026.
  `lineup` je proto v `select` záměrně vynechaná (nejdelší pole, jinak by se
  serializovalo do cache).

- **Hlavička** má pět vzhledů a volí ho správce v adminu: **Nastavení
  webu → Vzhled hlavičky detailu zápasu** (`siteConfig.matchHeaderVariant`:
  `classic` = původní `MatchHeader`, `arena`, `editorial`, `split`, `app`;
  rozhodnutí uživatele 15. 10. 2026). Přepíná `MatchHeaderByVariant`
  (`landing/features/matches/header-variants/index.tsx`), katalog všech vedle sebe
  je `/vzory/hlavicka-zapasu` (noindex). Zrušený zápas má vždy `classic`
  (`CanceledHeader`); varianty ho umět nemusí (typ `VariantMatch`, katalog
  ho nezobrazuje). Sdílené drobnosti variant (`MetaItem`, `OutcomeBadge`,
  `SideBadge`, `StatusBadge`) jsou v `header-variants/shared.tsx`, znak týmu
  `TeamCrest` v `components/`. Uložení nastavení invaliduje tag `site-config`, který
  detail čte (i přes `SubpageShell`), takže se změna projeví hned i na
  prerenderovaných detailech. Varianty A a D dopočítávají sloupce P a SN
  ze skóre (ukládají se jen tři třetiny) a zkratky týmů (`POL`, `ČES`)
  odvozují z názvu — dva soupeři mohou vyjít stejně. Sloupec přidává
  migrace `20261015_085423_match_header_variant` (aditivní, default
  `classic`), **před buildem**.

- **Typografie detailu** jede na **standardní škále Tailwindu**, ne na
  vlastních px tokenech (rozhodnutí uživatele 15. 10. 2026 — tokeny
  15/17/13 px se k sobě nehodily a desktop působil přerostle): nadpis
  panelu `text-xl md:text-2xl`, hlavní text (jména, hodnoty, perex)
  `text-sm md:text-base`, vedlejší text (časy, asistence, popisky)
  `text-xs`, týmy v hlavičce `text-base md:text-xl lg:text-2xl`. Tabulka
  rolí je v komentáři `MatchPanel`; nový blok detailu ji má dodržet.
  `Eyebrow` a `Badge` mají vlastní velikosti. Varianty hlavičky A–D mají
  vlastní typografii a tahle škála se jich netýká.

Blok bez dat se nevykreslí. Odehraný zápas bez branek, trestů i statistiky
ukáže pod hlavičkou poznámku „Podrobný zápis z utkání není k dispozici"
a případnou kartu reportáže a odkaz na galerii (`match.gallery`, `depth: 2`
a `populate.galleries`); naplánovaný zápas má hlavičku s odpočtem, a pokud
mu reportáž ani galerie nepatří, nic dalšího. Odehraný zápas **bez skóre**
nemá tabuli, takže `h1` s titulkem je viditelný (jinak je u tabule jen
`sr-only`); `matchDescription` ho nenazve „se hraje".

Události osy se před seskupením stabilně řadí podle času (nájezd `SN` na
konec) — ručně zadané neseřazené branky by jinak daly dvě skupiny téhož
názvu a duplicitní React `key`. Změna tvaru view-modelu znamená novou verzi
klíče `unstable_cache` (teď `['match-detail', 'v4']`; v4: třetiny a skóre
úseku osy jsou `{ home, away }`, ne řetězec „3:1“), jinak by stará entry
stránku shodila.

## Výsledek zápasu a výpisy na `/zapasy`

`Outcome` má čtyři hodnoty: `win`, `draw`, `otLoss`, `loss`. **`otLoss`**
je prohra po prodloužení nebo nájezdech (`matchOutcome` v
`matchFormat.ts`): v tabulce VČHL za ni je bod, proto má „půlený" štítek
— varianta `split` v `Badge` (cihlová | světle zelená), ve formě čtvereček
půlený úhlopříčkou s písmenem P. Mapa štítků je jedna,
`landing/features/matches/components/outcome.ts`, sdílí ji `ResultsList` i `MatchHeader`.
Výhra po prodloužení zůstává `win` (suffix `pp`/`sn` u skóre ji odliší).

Řádky výpisu mají **znaky týmů a čitelné datum** (rozhodnutí uživatele
15. 10. 2026): `MatchRowTitle` kreslí `TeamCrest` u každého týmu, `MatchWhen`
den v týdnu + datum `md:text-lg` + čas. Logo soupeře se načítá v
`withOpponentLogos` (`features/matches/data/matches.ts`) jedním dotazem na `media` pro celou
stránku — výpisy jedou na `depth: 1` (`depth: 2` by rozbalil i sezónu,
reportáž a sestavu). V `select` musí být `filename`: `url` je virtuální pole
z něj složené, bez něj vyjde prázdné. Fetchery bez loga (`depth: 1`)
dostanou `null` a řádek ukáže monogram.

Odehrané zápasy (`ResultsList`) i rozlosování (`FixturesRail` →
`FixtureList`) jsou **jedna karta s řádky oddělenými linkou**
(`rounded-tile border-line-soft`), se stejnými sloupci, takže lícují.
Stejný rádius a rámeček má forma i tabulka (`StandingsPanel`) — dřív
každý blok jel na jiném (`rounded-row`, `rounded-card`). Tmavé panely
(nejbližší zápas, hlavička detailu) zůstávají `rounded-section`.

### Zalamování dlouhých názvů (15. 10. 2026)

Názvy týmů („SK Divočáci Žamberk", „HC Aloha Lanškroun") a údaje pod nimi
se na 320 px dřív trhaly uprostřed. Platí proto tyhle sdílené díly a nový
výpis zápasu by je měl použít místo vlastního řetězce:

| díl | co řeší |
|---|---|
| `features/matches/components/TeamPair.tsx` | „domácí × hosté": tým je nedělitelný celek, láme se za „×"; `stack` dá na mobilu každý tým na vlastní řádek. `splitMatchTitle` rozdělí titulek zápasu |
| `features/matches/components/MatchMeta.tsx` | ztišený řádek údajů oddělených „·" — láme se mezi údaji, tečka nikdy nevisí na kraji řádku |
| `landing/ui/DotEyebrow.tsx` | popisek s lime tečkou (nejbližší zápas, hlavička detailu, hero reportáže) |
| `features/matches/components/MatchRow.tsx` | společná karta, mřížka, datum a titulek řádků `ResultsList` i `FixtureList` |

Fáze soutěže z AHL („VČHL 2.ročník - ZČ") se pro web formátuje jen
v `matchFormat.ts`: `formatCompetition()` → „VČHL 2. ročník · Základní
část", `phaseLabel()` rozepisuje zkratky (ZČ, ČF, SF, F, O 3.). Změna
formátu popisků mění obsah cache výpisu, proto šly klíče `season-*`
o verzi nahoru, i když se tvar dat nezměnil.

`MatchScoreboard` je mřížka `1fr | skóre | 1fr`, takže skóre stojí
uprostřed bez ohledu na délku jmen; na mobilu je nahoře logo | skóre |
logo a jména pod logy. Je sdílený s hero reportáže.

## Metadata a JSON-LD

`generateMetadata` bere OG obrázek z fotky reportáže (`getMediaUrl`
s `updatedAt`, absolutní URL) a kartu `summary_large_image`; bez fotky je
to čtvercové logo klubu a `summary`. Slug z URL se dekóduje přes
`readSlug`: neplatné kódování (`/zapasy/%25zz`) je `notFound()`, ne 500.

JSON-LD se serializuje přes `serializeJsonLd` (`src/lib/jsonLd.ts`),
který nahrazuje `<` za `\u003c` — jména střelců a soupeřů jsou scrapovaná
z ahl.cz a `JSON.stringify` samo `</script>` neescapuje (viz
`node_modules/next/dist/docs/01-app/02-guides/json-ld.md`). Každé nové
`<script type="application/ld+json">` v repu musí jít přes něj.

## Cache a revalidace

`fetchMatchDetail` je `unstable_cache` s tagy `matches-list` **i**
`posts-list` (zápas, soupeř, hráči → první; publikovaná reportáž → druhý)
a `revalidate: 3600` jako záchranná síť. Platí tři pravidla z „Cache
a renderovací režimy": tag i `revalidate`, `{ expire: 0 }` u redakčního
obsahu a žádné `new Date()` uvnitř cache (naplánovaný zápas řeší odpočet
na klientu (`useCountdown`): `Countdown` po uplynutí času buly místo nul ukáže „Zápas právě
probíhá nebo čeká na výsledek", server vždy kreslí „--", takže bez hydration
mismatch; platí i v hero a ve widgetu Nejbližší zápas). Tag se propaguje do prerenderované stránky, takže
`revalidatePath` na detail není potřeba.

Cesty, kterými se tagy expirují:

| změna | cesta |
|---|---|
| zápas v adminu | hook `revalidateLanding` (`hooks/revalidateLanding.ts`) → plán `LANDING_REVALIDATION` s tagy `LANDING_CACHE_TAGS` (`matches-list`) |
| zápas ze synchronizace | `/internal/revalidate` → `applyRevalidation` (`hooks/createRevalidateHooks.ts`) s týmž plánem `LANDING_REVALIDATION` |
| soupeř (název, logo, slug) | `Opponents` hooks `afterChange` / `afterDelete` → `revalidateLanding` / `revalidateLandingDelete` (`matches-list`); synchronizace zakládá soupeře s `disableRevalidate` a revaliduje jednou na konci běhu |
| reportáž (publikace, odpublikování, smazání) | `revalidatePost` / `revalidateDelete` → `posts-list` |

Nový zápas vzniklý po buildu nemá prerenderovanou stránku; `dynamicParams`
je výchozí `true`, takže se vyrenderuje při první návštěvě a dál drží ISR.

## Sitemapa

`/matches-sitemap.xml` obsahuje `/zapasy/<slug>` **všech** zápasů se slugem,
i naplánovaných a zrušených — detail mají všechny. `lastmod` je
`updatedAt`. Cache jako u `gallery-sitemap.xml`: tag `matches-sitemap`
+ `revalidate: 86400`. Tag invaliduje `'max'` (crawlerský feed):

- `hooks/revalidateMatchFeeds.ts` na `afterChange` i `afterDelete` kolekce
  `matches` (respektuje `disableRevalidate`);
- `/internal/revalidate` — synchronizace zakládá zápasy s `disableRevalidate`,
  takže hook neběží a nové detaily by jinak v sitemapě chyběly rok.

Sitemapa je v `next-sitemap.config.cjs` jak v `exclude`, tak v
`additionalSitemaps` (jinak by se `sitemap.xml` index a `robots.txt`
o ní nedozvěděly). Přidávat další sitemapu znamená sáhnout na obě místa.

# Nasazení (Coolify + GitHub Actions)

Produkce běží na Hetzner serveru s Coolify 4.1.2 jako Docker kontejner
z hotového image v GHCR. Coolify **nestaví** — jen stahuje a spouští.

| co | kde |
|---|---|
| build | `.github/workflows/deploy.yml` (GitHub Actions) |
| image | `ghcr.io/kopeclu2/hccestice:latest` + tag commitu |
| aplikace | Coolify projekt `hccestice`, app `gjd9nnwmyiavo9nvh5r7wob3` |
| databáze | Coolify Postgres 17, bez veřejného portu |
| média | volume `gjd9nnwmyiavo9nvh5r7wob3-media` → `/app/public/media` |

## Proč se nestaví na serveru

Server má 3,7 GB RAM a **nulový swap**. `next build` prerenderuje ~380
stránek, takže by ho zabil OOM killer (v Coolify se to projeví jako
`exit code 137`). Build proto běží na runneru.

Prerender ale potřebuje **živý Postgres** — a ten schválně není vystavený
do internetu. Runner se na něj dostane **SSH tunelem**: workflow si přes SSH
zjistí IP kontejneru (mění se po každém redeployi databáze) a otevře
`-L 5432:<ip>:5432`. `docker build --network host` pak vidí `127.0.0.1:5432`.
Proto tam **není buildx s docker-container driverem** — ten host network
neumí.

Klíč pro Actions je na serveru svázaný vynuceným příkazem
(`/usr/local/bin/gh-deploy-cmd`) a povoluje jen `pgip` a `deploy`;
`authorized_keys` k němu má `restrict,port-forwarding,permitopen="*:5432"`.
Kompromitovaný runner tedy nedostane shell. Deploy se spouští taky přes SSH,
ne přes Coolify API — to na serveru poslouchá na portu 8000 **bez TLS**.

## Healthcheck musí mířit na 127.0.0.1, ne na localhost

Coolify generuje test `wget http://localhost:3000/health`. Next standalone
poslouchá na `0.0.0.0:3000`, tedy **jen IPv4**, ale `localhost` se
v kontejneru rozsypává na `::1` → `Connection refused`, deset pokusů,
`New container is unhealthy` a Coolify kontejner zahodí. Aplikace přitom
v logu tvrdí `✓ Ready`, takže to vypadá na chybu healthchecku, ne sítě.
Řeší to `health_check_host` = `127.0.0.1` na aplikaci.

Endpoint `/health` (`src/app/health/route.ts`) **nesahá do databáze**
záměrně — viz komentář v souboru.

## Migrace

V produkci je `push` vypnutý, takže schéma mění jen migrace, a **musí jít
před buildem** — prerender jinak spadne na `parserOpenTable` (prázdné
schéma). Pouští se z lokálu tunelem:

```
PG_CONTAINER=<uuid databáze> ./scripts/db-tunnel.sh   # drží tunel na :5433
DATABASE_URL=postgres://…@127.0.0.1:5433/postgres bun run migrate
```

Runner image je standalone, takže `payload migrate` v něm **nejde spustit** —
nemá `node_modules` ani `src`. Tunel to řeší bez druhého image.

Migrace `20261016_041722_remove_template_leftovers` **před buildem**, stejně
jako předchozí. Je **destruktivní** (jedna z mála): dropne globaly `header`,
`footer` a `sidebar` (tabulky `header*`, `footer*`, `sidebar*` včetně
`sidebar_blocks_*` a jejich enumů), hero kolekce `pages`
(`pages_hero_links`, `_pages_v_version_hero_links`, sloupce `hero_*` na
`pages` a `version_hero_*` na `_pages_v`) a sloupce `pages_id` / `posts_id`
na `pages_rels` a `_pages_v_rels` (patřily jen odkazům v hero, v datech byly
NULL). Běžící starý build po ní přestane fungovat jen tam, kde by tyto
tabulky četl — frontend je nečetl. `down` vrací **jen schéma, ne data**:
obsah 5 RawHtml widgetů Sidebaru (po `up` ho má jen záloha databáze) pochází
ze seed dat `scripts/seed/data/codes.json`. Ověřeno `up` → `down` → `up` na
čisté databázi a `up` na kopii reálných dat (počty `pages`, `posts`,
`matches` beze změny).

Čerstvá databáze, na které proběhnou **všechny** migrace od nuly, se liší od
schématu v `push` módu u bloku News (`pages_blocks_landing_news` a verze:
`count` default 3 místo 5, navíc `fallback_photo_id`, `highlight_tag`,
`highlight_title`). Starší migrace tedy nesedí na dnešní config; produkci se
to netýká (schéma má z dumpu a migrace jen dorovnává), ale pro novou
databázi z migrací je to dluh.

## Co je zapečené v buildu

`NEXT_PUBLIC_*` jdou do klientského bundlu, takže změna
`NEXT_PUBLIC_SERVER_URL` (např. přechod z Coolify `sslip.io` domény na
klubovou) **vyžaduje nový build**, ne jen přepnutí env v Coolify.

## Přenos obsahu z lokálu do produkce

Databáze i média se přenášejí ručně; žádný synchronizační mechanismus tu
není. Ověřený postup (1:1 přenos z 21. 8. 2026):

```
# 1) databáze
pg_dump "$LOCAL" --clean --if-exists --no-owner --no-privileges -Fc -f dump
PG_CONTAINER=<uuid db> ./scripts/db-tunnel.sh
pg_restore --no-owner --no-privileges --dbname "$PROD_TUNEL" dump

# 2) média (COPYFILE_DISABLE kvůli pasti níž)
COPYFILE_DISABLE=1 tar -C public/media -cf - . \
  | ssh <server> "tar -C /var/lib/docker/volumes/<app-uuid>-media/_data -xf -"
ssh <server> "chown -R 1001:1001 /var/lib/docker/volumes/<app-uuid>-media/_data"

# 3) přestavba — bez ní zůstanou prerenderované stránky prázdné
gh workflow run deploy.yml --ref main
```

Tři věci, na kterých se to láme:

- **`payload_migrations` se musí dorovnat.** Lokální databáze jede na `push`
  a má v té tabulce jediný řádek `dev`. Po restore proto produkce tvrdí, že
  neproběhla žádná migrace, a příští `payload migrate` by je spustil na
  existující schéma. Řádky se dopisují ručně (`batch` 1) — viz sekce Migrace.
- **macOS `tar` přibalí AppleDouble.** Bez `COPYFILE_DISABLE=1` vznikne ke
  každému souboru `._název` s rozšířenými atributy, takže se na Linuxu
  rozbalí **dvojnásobek** souborů (+7 MB). Úklid:
  `find … -name '._*' -delete`.
- **Vlastník volume musí být `1001:1001`** (uživatel `nextjs` z Dockerfile),
  jinak Payload do `public/media` nezapíše nové uploady.

Kontrola, že přenos je 1:1 — počet souborů i součet bajtů musí sedět:

```
find public/media -type f | wc -l
find public/media -type f -exec stat -f %z {} + | awk '{s+=$1} END {print s}'
```

Uživatelé adminu přišli s dumpem, takže **přihlašovací údaje do produkce jsou
tytéž jako lokálně**.
