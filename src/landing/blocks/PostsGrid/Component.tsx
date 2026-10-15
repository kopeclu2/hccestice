import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { relId } from '@/landing/data/format'
import { fetchPostCards } from '@/landing/features/posts/data/posts'
import type { PostCard } from '@/landing/features/posts/types'
import { CardTitle } from '@/landing/ui/Heading'
import { Eyebrow, Highlight } from '@/landing/ui/Kicker'
import { PhotoTile } from '@/landing/ui/PhotoTile'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import type { PostsGridBlock } from '@/payload-types'

/** Widget článků — načte karty článků z kolekce dle filtrů bloku. */
export async function PostsGridBlockComponent({ block }: { block: PostsGridBlock }) {
  const posts = await fetchPostCards({
    type: block.postType === 'all' ? null : (block.postType ?? null),
    seasonId: relId(block.season),
    limit: block.limit ?? 6,
  })
  return (
    <PostsGridView posts={posts} showPhoto={block.showPhoto ?? false} title={block.title ?? null} />
  )
}

/** Články — mřížka karet s datem, štítkem a titulkem (klikací). */
function PostsGridView({
  title,
  posts,
  showPhoto = false,
}: {
  title: string | null
  posts: PostCard[]
  showPhoto?: boolean
}) {
  if (posts.length === 0) return null
  return (
    <SectionShell>
      <Reveal>
        {title && (
          <CardTitle as="h3" className="mb-6" size="md">
            <Highlight>{title}</Highlight>
          </CardTitle>
        )}
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {posts.map((post) => {
            const card = (
              <article className="flex h-full items-start gap-4.5 rounded-tile bg-surface p-5 px-5.5 shadow-tile transition-colors hover:bg-tint-hover">
                {showPhoto && post.photo && (
                  <PhotoTile
                    className="size-18 flex-none"
                    gradient="none"
                    photo={post.photo}
                    sizes="72px"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <Eyebrow tone="club">{post.tag}</Eyebrow>
                    <span className="text-eyebrow font-medium text-faint">{post.dateLabel}</span>
                  </div>
                  <CardTitle as="h4" className="mt-1" size="xs">
                    {post.title}
                  </CardTitle>
                </div>
                <span className="grid size-7.5 flex-none place-items-center rounded-full bg-chip [&_svg]:size-3.5">
                  <ArrowUpRight strokeWidth={2.5} />
                </span>
              </article>
            )
            return post.href ? (
              <Link className="block" href={post.href} key={post.id}>
                {card}
              </Link>
            ) : (
              <div key={post.id}>{card}</div>
            )
          })}
        </div>
      </Reveal>
    </SectionShell>
  )
}
