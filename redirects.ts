import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // Archiv /posts a jeho stránkování nahradil výpis /aktuality; routy jsou
  // smazané, redirecty drží staré příchozí odkazy (a indexaci) naživu.
  //
  // POŘADÍ JE ZÁVAZNÉ: Next vyhodnocuje pravidla shora a bere první shodu.
  // Stránkování proto musí být PŘED pravidlem pro detail článku — jinak mu
  // `/posts/page/2` padne do `:slug` jako „page/2“ a skončí na
  // /aktuality/page/2, což je 404.
  const postsPagesToAktuality = {
    source: '/posts/page/:pageNumber',
    destination: '/aktuality?page=:pageNumber',
    permanent: true,
  }

  const postsArchiveToAktuality = {
    source: '/posts',
    destination: '/aktuality',
    permanent: true,
  }

  // Detail článku se přesunul z /posts/{slug} na /aktuality/{slug}. Lookahead
  // je na `page(/|$)`, ne jen `page$` — musí vyloučit i `/posts/page/2`.
  const postsToAktuality = {
    source: '/posts/:slug((?!page(?:/|$)).*)',
    destination: '/aktuality/:slug',
    permanent: true,
  }

  return [
    internetExplorerRedirect,
    postsPagesToAktuality,
    postsArchiveToAktuality,
    postsToAktuality,
  ]
}
