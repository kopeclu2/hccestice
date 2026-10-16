/**
 * Ověří cestu, na kterou `/next/preview` po zapnutí draft módu přesměruje.
 * Smí to být jen cesta na tomtéž webu:
 *
 * - začíná `/`, ale ne `//` (protokol-relativní URL → cizí doména);
 * - neobsahuje `\` — prohlížeč ho při parsování URL bere jako `/`,
 *   takže `/\evil.com` je ve skutečnosti `//evil.com`;
 * - po rozparsování vůči základu zůstane původ stejný (zachytí zbytek
 *   triků, třeba řídicí znaky, které parser z cesty vyhodí).
 *
 * Procentově zakódované lomítko (`/%5Cevil`) parser nedekóduje, takže
 * zůstává cestou na tomtéž původu.
 */
export function isSafePreviewPath(path: string, base: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return false
  try {
    return new URL(path, base).origin === new URL(base).origin
  } catch {
    return false
  }
}
