import { describe, expect, it } from 'vitest'

import { cn } from '@/lib/utils'

/**
 * Tokeny z `@theme` v globals.css musí znát i twMerge. Neznámou třídu
 * nesloučí s jinou ze stejné skupiny, takže `cn('px-gutter', 'px-4')` by
 * nechal obě a o výsledku by rozhodlo pořadí v CSS, ne pořadí argumentů.
 */
describe('cn: vlastní tokeny', () => {
  it('spacing token se slučuje s výchozí škálou', () => {
    expect(cn('px-gutter', 'px-4')).toBe('px-4')
    expect(cn('px-4', 'px-gutter')).toBe('px-gutter')
    expect(cn('-mx-gutter', '-mx-2')).toBe('-mx-2')
    expect(cn('gap-split-gap', 'gap-2')).toBe('gap-2')
  })

  it('spacing token nesráží jiný směr', () => {
    expect(cn('px-gutter', 'py-4')).toBe('px-gutter py-4')
  })

  it('container token se slučuje s max-w', () => {
    expect(cn('max-w-page', 'max-w-3xl')).toBe('max-w-3xl')
    expect(cn('max-w-article', 'max-w-none')).toBe('max-w-none')
  })

  it('tracking token se slučuje s výchozím trackingem', () => {
    expect(cn('tracking-display', 'tracking-tight')).toBe('tracking-tight')
    expect(cn('tracking-heading', 'tracking-caps-lg')).toBe('tracking-caps-lg')
  })

  it('leading token se slučuje s výchozím řádkováním', () => {
    expect(cn('leading-copy', 'leading-none')).toBe('leading-none')
    expect(cn('leading-title', 'leading-display')).toBe('leading-display')
  })

  it('velikost písma z display škály se nebere za barvu', () => {
    expect(cn('text-title-md', 'text-ink')).toBe('text-title-md text-ink')
    expect(cn('text-title-md', 'text-title-sm')).toBe('text-title-sm')
    expect(cn('text-score', 'text-xl')).toBe('text-xl')
  })
})
