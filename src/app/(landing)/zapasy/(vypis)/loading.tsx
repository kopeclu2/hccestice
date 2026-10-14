/**
 * Fallback pro `/zapasy` — plně dynamická routa webu, jejíž výpis nemá
 * potomky s redirecty (detail `zapasy/[slug]` je mimo tuhle boundary).
 *
 * Tenhle soubor **záměrně nestojí na `(landing)/`**, kde původně byl.
 * `loading.tsx` zavádí Suspense boundary nad celý podstrom, a jakmile
 * začne streaming, `permanentRedirect` v `PayloadRedirects` nemá kam
 * poslat hlavičku — Next ho degraduje na klientský
 * `<meta http-equiv="refresh">` s HTTP **200**. Všechny legacy redirecty
 * z eStránkového importu (`/clanky/*`, `/fotoalbum/*`, přejmenované slugy
 * na `/[slug]`, `/aktuality/[slug]`, `/fotogalerie/[slug]`) tím přestaly
 * být HTTP redirecty. Ověřeno na produkčním buildu: s globálním
 * `loading.tsx` vracelo `/clanky/historie-klubu.html` 200 s meta tagem,
 * bez něj 308 na `/historie-klubu`.
 *
 * `/aktuality` a `/fotogalerie` fallback nedostaly, i když jsou taky
 * dynamické: jejich detailové routy (`[slug]`) redirecty servírují, takže
 * boundary v jejich segmentu by je rozbila stejně. Tagovaná cache jim TTFB
 * stlačila natolik, že je to bez užitku — viz `posts.ts` a `galleries.ts`.
 *
 * Leží v route group `(vypis)`, ne přímo v `zapasy/`, ze stejného důvodu:
 * `zapasy/[slug]` (detail zápasu) volá `notFound()` pro neznámý slug. Kdyby
 * `loading.tsx` stál v `zapasy/`, jeho Suspense boundary by byla nad
 * detailem, streaming by začal dřív, než `notFound()` doběhne, a odpověď by
 * místo 404 dostala HTTP 200 se stránkou „nenalezeno". Route group URL
 * nemění (`/zapasy` zůstává), jen zužuje, na co se boundary vztahuje.
 *
 * Proužek, ne skeleton: znát layout každé stránky by znamenalo držet dvě
 * verze designu synchronně.
 */
export default function Loading() {
  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-1">
      <div className="bg-lime h-full w-1/3 animate-pulse" />
    </div>
  )
}
