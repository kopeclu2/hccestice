import { createRevalidateHooks } from '@/hooks/createRevalidateHooks'
import { CACHE_TAGS } from '@/landing/data/tags'

export const revalidateFooter = createRevalidateHooks({
  label: 'patičku',
  tags: [CACHE_TAGS.globalFooter],
  profile: 'max',
}).afterChange
