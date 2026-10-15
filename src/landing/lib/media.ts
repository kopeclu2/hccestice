import type { Photo, PersonCard } from '@/landing/types'
import { CLUB_NAME } from '@/lib/club'
import type { Media, Person } from '@/payload-types'

/** Payload `media` / upload pole → `Photo` view-model pro `next/image`. */

/** Media dokument → Photo view-model pro `next/image`. */
export const toPhoto = (media: Media): Photo => ({
  url: media.url ?? '',
  alt: media.alt || CLUB_NAME,
  width: media.width ?? 1600,
  height: media.height ?? 1200,
  updatedAt: media.updatedAt ?? null,
})

/** Upload pole (populated přes depth) → Photo, jinak null. */
export const uploadToPhoto = (value: number | Media | null | undefined): Photo | null =>
  typeof value === 'object' && value ? toPhoto(value) : null

/** Person dokument → PersonCard view-model (null pro nepopulovanou relaci). */
export const toPersonCard = (person: number | Person): PersonCard | null => {
  if (typeof person !== 'object') return null
  return {
    name: person.name,
    role: person.role,
    note: person.note ?? null,
    mail: person.email ?? null,
    phone: person.phone ?? null,
    photo: uploadToPhoto(person.photo),
  }
}
