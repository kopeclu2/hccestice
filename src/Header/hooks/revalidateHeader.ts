import { createRevalidateHooks } from '@/hooks/createRevalidateHooks'
import { CACHE_TAGS } from '@/landing/data/tags'

export const revalidateHeader = createRevalidateHooks({
  label: 'hlavičku',
  tags: [CACHE_TAGS.globalHeader],
  profile: 'max',
}).afterChange
