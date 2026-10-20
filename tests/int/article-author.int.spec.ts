import { describe, expect, it } from 'vitest'

import { toArticleDetail } from '@/landing/features/posts/view/posts'
import type { Person, Post } from '@/payload-types'

const CLUB = 'klub@example.cz'

/** Jen pole, která view-model čte; zbytek dokumentu je pro test lhostejný. */
function post(extra: Partial<Post>): Post {
  // Dokument Payloadu má desítky povinných polí, která karta autora nečte.
  return { id: 1, title: 'Článek', slug: 'clanek', ...extra } as Post
}

describe('karta autora článku', () => {
  it('u článku bez osoby ukáže klubový e-mail, ne adresu uživatele z adminu', () => {
    const article = toArticleDetail(
      post({ populatedAuthors: [{ id: '5', name: 'Jan Správce', role: 'Redaktor' }] }),
      null,
      null,
      CLUB,
    )
    expect(article.author.name).toBe('Jan Správce')
    expect(article.author.email).toBe(CLUB)
  })

  it('u článku s osobou ukáže e-mail osoby', () => {
    const person = { id: 2, name: 'Petr Trenér', email: 'trener@example.cz' } as Person
    expect(toArticleDetail(post({ authorPerson: person }), null, null, CLUB).author.email).toBe(
      'trener@example.cz',
    )
  })

  it('osoba bez e-mailu klubový nedostane — kontakt patří k osobě', () => {
    const person = { id: 2, name: 'Petr Trenér', email: null } as Person
    expect(
      toArticleDetail(post({ authorPerson: person }), null, null, CLUB).author.email,
    ).toBeNull()
  })
})
