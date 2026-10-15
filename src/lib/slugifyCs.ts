import { fold } from './fold'

/**
 * Český text → slug do URL: bez diakritiky (NFD), malá písmena, každá
 * souvislá řada jiných znaků než `a-z0-9` je jedno `-`, okraje se ořežou.
 *
 * Záměrně ne `slugify` z Payloadu (`payload/dist/utilities/slugify.js`):
 * ten diakritiku zahazuje i s písmenem (`Žamberk` → `amberk`). Soupeři mají
 * slug ve tvaru `sk-zamberk`, což odpovídá tomuto helperu.
 */
export function slugifyCs(text: string): string {
  return fold(text, { alnumOnly: true }).replaceAll(' ', '-')
}
