import type { PostFeatureBlock } from '@/payload-types'

import Link from 'next/link'
import React from 'react'

import type { Photo } from '../../types'

import { CardTitle } from '../../components/Heading'
import { PhotoTile, TileBadge } from '../../components/PhotoTile'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { formatFullDate, relId, toPhoto } from '../../data/format'
import { fetchDefaultPostPhoto, fetchPost, POST_TYPE_LABEL, postHref } from '../../data/posts'

/** Vypíchnutý článek — velká fotokarta se štítkem, datem a titulkem. */
export async function PostFeatureBlockComponent({ block }: { block: PostFeatureBlock }) {
  const postId = relId(block.post)
  if (!postId) return null
  const post = await fetchPost(postId)
  if (!post) return null

  const heroPhoto =
    typeof post.heroImage === 'object' && post.heroImage ? toPhoto(post.heroImage) : null
  const fallback =
    (typeof block.fallbackPhoto === 'object' && block.fallbackPhoto
      ? toPhoto(block.fallbackPhoto)
      : null) ?? (await fetchDefaultPostPhoto())

  return (
    <PostFeatureView
      dateLabel={post.publishedAt ? formatFullDate(post.publishedAt) : ''}
      href={postHref(post)}
      perex={post.meta?.description ?? ''}
      photo={heroPhoto ?? fallback}
      tag={block.tag ?? POST_TYPE_LABEL[post.type ?? 'news'] ?? 'Novinky'}
      title={post.title}
    />
  )
}

function PostFeatureView({
  photo,
  tag,
  dateLabel,
  title,
  perex,
  href,
}: {
  photo: Photo | null
  tag: string
  dateLabel: string
  title: string
  perex: string
  href: string | null
}) {
  const card = (
    <PhotoTile
      className="min-h-90 rounded-section md:min-h-105"
      photo={photo}
      sizes="(max-width: 48rem) 100vw, 90vw"
    >
      <TileBadge className="top-4 left-4" tone="lime">
        {tag}
      </TileBadge>
      <div className="absolute inset-x-5.5 bottom-5.5 text-white">
        <div className="text-caption font-semibold opacity-75">{dateLabel}</div>
        <CardTitle as="h3" className="mt-1.5 max-w-160 text-pretty text-white" size="lg">
          {title}
        </CardTitle>
        {perex && <div className="mt-2 max-w-160 text-meta opacity-85">{perex}</div>}
      </div>
    </PhotoTile>
  )

  return (
    <SectionShell>
      <Reveal>
        {href ? (
          <Link className="block" href={href}>
            {card}
          </Link>
        ) : (
          card
        )}
      </Reveal>
    </SectionShell>
  )
}
