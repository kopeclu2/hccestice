<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Navigace landing page

Navigaci spravuje správce v adminu: **Nastavení → Menu** (kontejner `hlavni`)
a **Nastavení → Položky menu**. Pořadí odkazů se přetahuje myší v poli
„Položky menu" na kontejneru.

## Model

`NavItem` (`src/landing/types.ts`) rozpojuje tři role, které dřív plnil
jediný string `href`:

| pole | role |
|---|---|
| `label` | text odkazu |
| `anchor` | `id` sekce na homepage (bez `#`); prázdné = sekce na home není |
| `path` | cesta na podstránku; prázdné = položka žije jen jako kotva |

Cíl odkazu skládá `navHref(item, 'home' \| 'subpage')`
(`src/landing/data/navHref.ts`). Tím zmizely konstanty `SUBPAGE_HREF`
a `PAGE_ONLY_LINKS` — druhá je derivovatelná z `anchor === null`.

`navHref.ts` je oddělený od `navigation.ts` **záměrně**: `navigation.ts`
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
(`unstable_cache` s tagem `navigation` v `src/landing/data/navigation.ts`).
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
| `src/utilities/generateMeta.ts` | `generateMetadata` na stránkách frontendu |
| `src/app/(frontend)/(sitemaps)/*` + `next-sitemap` | `/sitemap.xml`, `/robots.txt` |
| `src/app/llms.txt/route.ts` | `/llms.txt` |

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

# Ochrana formulářů (reCAPTCHA v3)

Klíče: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` a `RECAPTCHA_SECRET`. Bez nich se
ověření **mimo produkci přeskakuje** (dev a CI nepotřebují účet u Googlu),
v produkci se odeslání odmítne. Skóre pod `0.5` neprojde
(`src/utilities/recaptcha/config.ts` — jediný zdroj akcí i thresholdu pro
klient, plugin i server action).

Dva odesílací kanály, dvě různé ochrany, protože plugin
`payload-recaptcha-v3` ověřuje **jen operace přes REST**
(`payloadAPI === 'REST'`, viz jeho `dist/hookBuilder.js`):

| kanál | ochrana |
|---|---|
| `blocks/Form` → `POST /api/form-submissions` | plugin, přes `custom.recaptcha` na `formSubmissionOverrides` |
| `landing/blocks/Contact` → server action, local API | `verifyRecaptchaToken()` v `action.ts` |

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
zrcadla `LANDING_COLORS` (`src/landing/tokens.ts`) — nový mirror záměrně
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
`migration/seed-contact-form.ts` (notifikace klubu + potvrzení odesílateli).
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

Společné díly: `components/ErrorCode.tsx` (obří obrysový kód + `ErrorMeta`),
`components/PuckTrail.tsx`, utility `text-stroke-none`, `hatch-lime` a
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
ani `next/font`. Barvy proto jdou inline z `LANDING_COLORS` a `metadata`
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

`components/EmptyState.tsx` — jedna komponenta místo pěti různých
jednořádkových odstavců, které měl každý výpis vlastní. `actions` je
**povinné**: slepá ulička („Zatím tu žádné články nejsou.") je nejhorší
možná odpověď na aktivní filtr.

Zapojení: `AktualityGrid`, `GalleryGrid` (obojí přes `CardGrid empty`),
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
  správce blok Hero v CMS odstraní, na homepage nebude navigace vůbec.
  Patří do `src/app/(landing)/layout.tsx`.
- ~~`Dockerfile` nekopíruje `bun.lock`~~ — doplněno spolu s větví pro `bun`
  v install i build kroku; base image zvednutý na `node:24-alpine`, protože
  `payload-auditor` má `engines.node: ">=24"`.
- `tests/e2e/frontend.e2e.spec.ts` je nedotčená Payload šablona a padá už
  dnes — regresní síť pro navigaci neexistuje.

# Responzivita — tři stupně, ne dva

Handoffy v `design_*/` jsou kreslené pro **1440px**. `md:` (768px) proto
**není** místo pro desktopovou hodnotu z handoffu; ta patří na `lg:` (1024px)
a mezi mobil a desktop se vkládá mezistupeň. Breakpointy projektu
(`src/app/globals.css`): sm 640, md 768, lg 1024, xl 1280, 2xl 1376.

Pravidlo už dřív platilo pro svislý rytmus (`SectionShell`), navigaci
(`NavPills` je `hidden xl:flex`), mřížky výpisů (`CardGrid`) a watermarky
(`Watermark` od `lg`). Od 22. 8. 2026 platí i pro **vnitřní odsazení
panelů**: každá zelená/bílá karta jede na `p-4.5 md:p-<mezistupeň>
lg:p-<handoff>`. Dřív skákaly rovnou (`p-4.5 md:p-13`), takže si na 768px
displeji braly okraje panelu až pětinu jeho šířky.

Doložení, že se desktop nezměnil: `node shot.mjs --bp=desktop` před a po,
`scrollHeight` v `report.json` musí sedět na pixel na všech routách.

Dvě opakující se pasti:

- **`minmax(<X>rem,1fr)` v `auto-fit` mřížce.** Když je `X` širší než
  vnitřek kontejneru (patička má na 320px displeji 256px), dráha kontejner
  přeteče a `overflow-hidden` obsah ustřihne. Píše se
  `minmax(min(<X>rem,100%),1fr)` — spadne na šířku kontejneru bez
  breakpointu. Platí v `Club`, `Stats`, `ContactForm` a `LandingFooter`.
- **`sizes` u fotek musí kopírovat tytéž zlomy jako mřížka.** Když se
  mřížka posune z `md:grid-cols-3` na `lg:grid-cols-3`, ale `sizes` zůstane
  `(max-width: 48rem) 100vw, 33vw`, tablet si tahá třetinové fotky do
  polovičních dlaždic.

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
- `RailArrows` zůstávají v `components/`, i když je Tréninky už nepoužívají —
  jediný konzument je `zapasy/FixturesRail.tsx`.
- Schéma rozšiřuje migrace `20260821_093653_trainings_cards` (aditivní:
  `venue`, `note`, `hidden_on_web`, `kicker`, `default_venue`) a zužuje
  `20260821_095556_trainings_drop_extras` (**destruktivní** — dropne
  `photo_id`, `photo_title`, `photo_subtitle` a `event_*` na
  `pages_blocks_landing_trainings` i na verzovací tabulce).

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
