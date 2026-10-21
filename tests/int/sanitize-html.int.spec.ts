import { describe, expect, it } from 'vitest'

import { sanitizeHtml, sanitizeHtmlFieldHook, sanitizeHtmlWithReport } from '@/hooks/sanitizeHtml'
import { isAllowedEmbedUrl } from '@/lib/embedHosts'

describe('sanitizeHtml — XSS', () => {
  it.each([
    ['<img src=x onerror=alert(1)>', 'onerror'],
    ['<svg onload=alert(1)></svg>', 'svg'],
    ['<script>alert(1)</script>', 'script'],
    ['<a href="javascript:alert(1)">x</a>', 'javascript'],
    ['<a href="JaVaScRiPt:alert(1)">x</a>', 'javascript'],
    ['<a href="&#106;avascript:alert(1)">x</a>', 'javascript'],
    ['<a href="java\tscript:alert(1)">x</a>', 'javascript'],
    ['<a href=" &#x6A;avascript:alert(1)">x</a>', 'javascript'],
    ['<a href="vbscript:msgbox(1)">x</a>', 'vbscript'],
    ['<a href="data:text/html,<script>alert(1)</script>">x</a>', 'data:'],
    ['<img src="data:image/svg+xml;base64,PHN2Zy8+">', 'data:'],
    ['<p onclick="alert(1)">x</p>', 'onclick'],
    ['<form action="https://evil"><input name=a></form>', '<form'],
    ['<object data="x.swf"></object><embed src="x.swf">', '<embed'],
    ['<base href="https://evil/">', '<base'],
    ['<meta http-equiv="refresh" content="0;url=https://evil">', '<meta'],
    ['<link rel="stylesheet" href="https://evil/x.css">', '<link'],
    ['<style>body{display:none}</style>', '<style'],
    ['<iframe src="https://evil.example/x"></iframe>', 'evil.example'],
    ['<iframe src="javascript:alert(1)"></iframe>', 'javascript'],
    ['<iframe srcdoc="<script>alert(1)</script>"></iframe>', 'srcdoc'],
    ['<math><mi><style><img src=x onerror=alert(1)></style></mi></math>', 'onerror'],
    ['<div style="background:url(javascript:alert(1))">x</div>', 'url('],
    ['<div style="width:expression(alert(1))">x</div>', 'expression'],
  ])('odstraní %s', (payload, forbidden) => {
    const clean = sanitizeHtml(`<p>před</p>${payload}<p>po</p>`)
    expect(clean.toLowerCase()).not.toContain(forbidden.toLowerCase())
    expect(clean).toContain('před')
    expect(clean).toContain('po')
  })

  it('zachová běžný obsah, odkazy a tabulky', () => {
    const html =
      '<h2>Nadpis</h2><p><strong>Tučně</strong> a <em>kurzíva</em> <a href="/aktuality/x">odkaz</a> ' +
      '<a href="mailto:a@b.cz">mail</a> <a href="tel:+420123456789">tel</a></p>' +
      '<table><tbody><tr><td colspan="2" style="color: red">buňka</td></tr></tbody></table>' +
      '<img src="/media/a.jpg" alt="foto" width="100">'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('odkaz s target=_blank dostane rel noopener noreferrer', () => {
    const clean = sanitizeHtml('<a href="https://example.cz" target="_blank">x</a>')
    expect(clean).toContain('target="_blank"')
    expect(clean).toContain('rel="noopener noreferrer"')
  })

  it('cizí rel a neznámý target se zahodí', () => {
    const clean = sanitizeHtml('<a href="/x" target="_top" rel="opener">x</a>')
    expect(clean).not.toContain('target')
    expect(clean).not.toContain('opener')
  })

  it('zahodí class, id, data-* a on* ale nechá text', () => {
    const clean = sanitizeHtml(
      '<div class="fixed inset-0" id="x" data-a="1" onmouseover="a()">text</div>',
    )
    expect(clean).toBe('<div>text</div>')
  })
})

describe('sanitizeHtml — style', () => {
  it('ponechá typografii a box, zahodí position a url()', () => {
    const clean = sanitizeHtml(
      '<span style="color: rgb(1,2,3); position: absolute; top: 0; font-size: 12px; background: url(x.png)">a</span>',
    )
    expect(clean).toBe('<span style="color: rgb(1,2,3); font-size: 12px">a</span>')
  })

  it('prázdný style se odstraní celý', () => {
    expect(sanitizeHtml('<p style="position:fixed;z-index:9">a</p>')).toBe('<p>a</p>')
  })

  it('středník v uvozovkách nerozdělí deklaraci', () => {
    const clean = sanitizeHtml('<p style="font-family: \'A;B\', serif; color: red">a</p>')
    expect(clean).toContain('color: red')
    expect(clean).toContain('font-family')
  })
})

describe('sanitizeHtml — iframe', () => {
  it('ponechá YouTube a přidá sandbox', () => {
    const clean = sanitizeHtml(
      '<iframe src="https://www.youtube.com/embed/abc123" width="560" height="315" frameborder="0" allowfullscreen></iframe>',
    )
    expect(clean).toContain('src="https://www.youtube-nocookie.com/embed/abc123"')
    expect(clean).toContain('sandbox="allow-scripts allow-same-origin')
    expect(clean).not.toContain('allow-top-navigation')
  })

  it('ponechá Google Tabulky a výsledkový server', () => {
    expect(
      sanitizeHtml('<iframe src="https://docs.google.com/spreadsheets/d/abc/pubhtml"></iframe>'),
    ).toContain('docs.google.com')
    expect(sanitizeHtml('<iframe src="http://online-puk.eu/prehledzapasu/87"></iframe>')).toContain(
      'src="https://online-puk.eu/prehledzapasu/87"',
    )
  })

  it('legacy http a běžný YouTube přepíše na https a youtube-nocookie', () => {
    const clean = sanitizeHtml(
      '<iframe src="http://www.youtube.com/embed/SY-B0FvrnZE" width="480" height="390"></iframe>',
    )
    expect(clean).toContain('src="https://www.youtube-nocookie.com/embed/SY-B0FvrnZE"')
    expect(clean).not.toContain('http://')
  })

  it('zahodí iframe z cizího hosta, špatné cesty i triky s hostem', () => {
    for (const src of [
      'https://evil.example/embed/x',
      'https://www.youtube.com.evil.example/embed/x',
      'https://evil.example/www.youtube.com/embed/x',
      'https://www.youtube.com@evil.example/embed/x',
      'https://www.youtube.com/watch?v=x',
      '//evil.example/x',
      '/relativni',
    ]) {
      expect(sanitizeHtml(`<iframe src="${src}"></iframe>`), src).not.toContain('iframe')
    }
  })

  it('záložní text iframe se vyčistí', () => {
    const clean = sanitizeHtml(
      '<iframe src="https://www.youtube.com/embed/x">Your browser does not support inline frames</iframe>',
    )
    expect(clean).not.toContain('Your browser')
  })
})

describe('sanitizeHtml — vlastnosti', () => {
  it('je idempotentní', () => {
    const dirty =
      '<div class="a" style="color:red;position:absolute"><a href="https://x.cz" target="_blank">x</a>' +
      '<script>1</script><iframe src="https://www.youtube.com/embed/x"></iframe><table><tr><td>1</td></tr></table></div>'
    const once = sanitizeHtml(dirty)
    expect(sanitizeHtml(once)).toBe(once)
  })

  it('prázdný vstup vrací beze změny', () => {
    expect(sanitizeHtml('')).toBe('')
  })

  it('report počítá odstraněné tagy, atributy, iframy a CSS vlastnosti', () => {
    const { report } = sanitizeHtmlWithReport(
      '<script>x</script><p class="a" onclick="b()" style="position:absolute">t</p><iframe src="https://evil.example/x"></iframe>',
    )
    expect(report.tags.script).toBe(1)
    expect(report.attrs.class).toBe(1)
    expect(report.attrs.onclick).toBe(1)
    expect(report.iframeHosts['evil.example']).toBe(1)
    expect(report.styleProps.position).toBe(1)
  })

  it('field hook čistí řetězec a ostatní hodnoty nechá být', () => {
    const run = (value: unknown) =>
      sanitizeHtmlFieldHook({ value } as Parameters<typeof sanitizeHtmlFieldHook>[0])
    expect(run('<script>x</script><p>a</p>')).toBe('<p>a</p>')
    expect(run(null)).toBeNull()
    expect(run(undefined)).toBeUndefined()
  })
})

describe('isAllowedEmbedUrl', () => {
  it.each([
    'https://www.youtube.com/embed/abc',
    'https://www.youtube-nocookie.com/embed/abc',
    'https://player.vimeo.com/video/123',
    'https://www.google.com/maps/embed?pb=x',
    'https://maps.google.com/maps?q=x&output=embed',
    'https://docs.google.com/forms/d/e/x/viewform?embedded=true',
    'https://www.ahl.cz/soutez/vychodoceska_hokejova_liga/tabulky/',
    'https://www.facebook.com/plugins/page.php?href=x',
  ])('povolí %s', (url) => {
    expect(isAllowedEmbedUrl(url)).toBe(true)
  })

  it.each([
    '',
    'ftp://www.youtube.com/embed/x',
    'javascript:alert(1)',
    'https://user:pw@www.youtube.com/embed/x',
    'https://www.google.com/search?q=x',
    'https://evil.example/',
    'not a url',
  ])('zakáže %s', (url) => {
    expect(isAllowedEmbedUrl(url)).toBe(false)
  })

  it('null a undefined jsou zakázané', () => {
    expect(isAllowedEmbedUrl(null)).toBe(false)
    expect(isAllowedEmbedUrl(undefined)).toBe(false)
  })
})
