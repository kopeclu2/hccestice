import { describe, expect, it } from 'vitest'

import { renderLegacyHtml } from '@/landing/lib/legacyEmbeds'

describe('renderLegacyHtml', () => {
  it('HTML bez iframe vrací jen vyčištěné', () => {
    expect(renderLegacyHtml('<p onclick="x()">Ahoj</p>')).toBe('<p>Ahoj</p>')
  })

  it('iframe z legacy článku nahradí zástupným rámečkem bez iframe v HTML', () => {
    const out = renderLegacyHtml(
      '<p>Video:</p><iframe src="http://www.youtube.com/embed/SY-B0FvrnZE" width="480" height="390" title=""></iframe>',
    )
    expect(out).not.toContain('<iframe')
    expect(out).toContain('data-embed="https://www.youtube-nocookie.com/embed/SY-B0FvrnZE"')
    expect(out).toContain('data-embed-width="480"')
    expect(out).toContain('data-embed-height="390"')
    expect(out).toContain('data-embed-load')
    expect(out).toContain('Načíst YouTube')
    expect(out).toContain('Otevřít v novém okně')
    expect(out).toContain('https://www.youtube.com/watch?v=SY-B0FvrnZE')
    expect(out).toContain('IP adresa')
  })

  it('rozměry vezme i ze style (lidovky, tabulky)', () => {
    const out = renderLegacyHtml(
      '<iframe src="http://vysledky.lidovky.cz/soutez.php?id_soutez=6597" style="position: absolute; width: 711px; height: 1059px"></iframe>',
    )
    expect(out).toContain('data-embed="https://vysledky.lidovky.cz/soutez.php?id_soutez=6597"')
    expect(out).toContain('data-embed-width="711"')
    expect(out).toContain('data-embed-height="1059"')
    expect(out).toContain('Načíst Lidovky.cz')
  })

  it('iframe z nepovoleného hosta zmizí úplně, ani jako zástupný rámeček', () => {
    const out = renderLegacyHtml(
      '<p>a</p><iframe src="https://evil.example/x"></iframe><iframe src="javascript:alert(1)"></iframe>',
    )
    expect(out).toBe('<p>a</p>')
  })

  it('název z legacy dat se nedostane do markupu jako HTML', () => {
    const out = renderLegacyHtml(
      '<iframe src="https://www.youtube.com/embed/abcdef1" title="&lt;img src=x onerror=alert(1)&gt;"></iframe>',
    )
    expect(out).not.toMatch(/<img/i)
    expect(out).toContain('img src=x onerror=alert(1)')
  })

  it('iframe uvnitř tabulky a odstavce zůstane na svém místě', () => {
    const out = renderLegacyHtml(
      '<table><tbody><tr><td><iframe src="https://docs.google.com/spreadsheets/d/abc/pubhtml"></iframe></td></tr></tbody></table>',
    )
    expect(out).toMatch(/<td><span[^>]*data-embed=/)
    expect(out).toContain('Načíst Google Tabulky')
  })

  it('je pevný bod i po opětovném vyčištění nezanechá iframe ani skripty', () => {
    const out = renderLegacyHtml(
      '<script>1</script><iframe src="https://www.youtube.com/embed/abcdef1"></iframe>',
    )
    expect(out).not.toContain('<script')
    expect(out).not.toContain('<iframe')
  })
})
