import { describe, expect, it } from 'vitest'

import { activateEmbed, handleEmbedClick } from '@/lib/embedActivate'
import {
  EMBED_SANDBOX,
  embedNotice,
  embedOpenUrl,
  embedServiceOf,
  normalizeEmbedUrl,
} from '@/lib/embedHosts'

describe('normalizeEmbedUrl', () => {
  it('http přepíše na https', () => {
    expect(normalizeEmbedUrl('http://online-puk.eu/prehledzapasu/88')).toBe(
      'https://online-puk.eu/prehledzapasu/88',
    )
  })

  it('youtube.com/embed přepíše na youtube-nocookie.com a zachová cestu i query', () => {
    expect(normalizeEmbedUrl('http://www.youtube.com/embed/SY-B0FvrnZE')).toBe(
      'https://www.youtube-nocookie.com/embed/SY-B0FvrnZE',
    )
    expect(normalizeEmbedUrl('https://youtube.com/embed/abcdef1?start=5')).toBe(
      'https://www.youtube-nocookie.com/embed/abcdef1?start=5',
    )
  })

  it('protokolově relativní adresu doplní na https', () => {
    expect(normalizeEmbedUrl('//www.youtube-nocookie.com/embed/abcdef1')).toBe(
      'https://www.youtube-nocookie.com/embed/abcdef1',
    )
  })

  it('je pevný bod', () => {
    for (const raw of [
      'http://www.youtube.com/embed/abcdef1',
      'http://maps.google.com/maps?q=a&output=embed',
      'https://docs.google.com/spreadsheets/d/abc/pubhtml?gid=1&single=true',
    ]) {
      const once = normalizeEmbedUrl(raw)
      expect(once, raw).not.toBeNull()
      expect(normalizeEmbedUrl(once)).toBe(once)
    }
  })

  it('zahodí všechno, co neprojde allowlistem', () => {
    for (const raw of [
      null,
      undefined,
      '',
      'javascript:alert(1)',
      'data:text/html,<script>1</script>',
      'ftp://www.youtube.com/embed/x',
      'https://evil.example/embed/x',
      'https://www.youtube.com.evil.example/embed/x',
      'https://www.youtube.com@evil.example/embed/x',
      'https://user:pw@www.youtube.com/embed/x',
      'https://www.youtube.com/watch?v=x',
      '/relativni',
    ]) {
      expect(normalizeEmbedUrl(raw), String(raw)).toBeNull()
    }
  })
})

describe('embedServiceOf / embedOpenUrl / embedNotice', () => {
  it('pojmenuje službu podle hosta a cesty', () => {
    expect(embedServiceOf('https://www.youtube-nocookie.com/embed/x')).toBe('YouTube')
    expect(embedServiceOf('https://maps.google.com/maps?q=a')).toBe('Google Mapy')
    expect(embedServiceOf('https://docs.google.com/forms/d/e/x/viewform')).toBe('Google Formuláře')
    expect(embedServiceOf('https://docs.google.com/spreadsheets/d/x')).toBe('Google Tabulky')
  })

  it('odkaz pro záložní otevření u YouTube vede na stránku videa', () => {
    expect(embedOpenUrl('http://www.youtube.com/embed/SY-B0FvrnZE')).toBe(
      'https://www.youtube.com/watch?v=SY-B0FvrnZE',
    )
    expect(embedOpenUrl('https://maps.google.com/maps?q=a&output=embed')).toBe(
      'https://maps.google.com/maps?q=a&output=embed',
    )
    expect(embedOpenUrl('https://evil.example/x')).toBeNull()
  })

  it('poznámka zmiňuje třetí stranu a IP adresu', () => {
    expect(embedNotice('YouTube')).toContain('třetí strany (YouTube)')
    expect(embedNotice('YouTube')).toContain('IP adresa')
  })
})

function placeholderHtml(src: string, extra = ''): string {
  return `<p><span data-embed="${src}" data-embed-title="Video" ${extra}><button type="button" data-embed-load>Načíst</button><a href="${src}">Otevřít</a></span></p>`
}

describe('activateEmbed', () => {
  it('vymění zástupný rámeček za iframe s pevným sandboxem', () => {
    document.body.innerHTML = placeholderHtml(
      'http://www.youtube.com/embed/abcdef1',
      'data-embed-width="480" data-embed-height="390"',
    )
    const iframe = activateEmbed(document.querySelector('[data-embed]') as Element)

    expect(iframe).not.toBeNull()
    expect(iframe?.getAttribute('src')).toBe('https://www.youtube-nocookie.com/embed/abcdef1')
    expect(iframe?.getAttribute('sandbox')).toBe(EMBED_SANDBOX)
    expect(iframe?.getAttribute('title')).toBe('Video')
    expect(iframe?.getAttribute('width')).toBe('480')
    expect(document.querySelector('[data-embed]')).toBeNull()
    expect(document.querySelectorAll('iframe')).toHaveLength(1)
  })

  it('nepovolenou adresu nevloží a rámeček nechá být', () => {
    for (const src of ['javascript:alert(1)', 'https://evil.example/x', 'data:text/html,x']) {
      document.body.innerHTML = placeholderHtml(src)
      expect(activateEmbed(document.querySelector('[data-embed]') as Element), src).toBeNull()
      expect(document.querySelector('iframe')).toBeNull()
      expect(document.querySelector('[data-embed]')).not.toBeNull()
    }
  })

  it('rozměry bere jen jako číslice', () => {
    document.body.innerHTML = placeholderHtml(
      'https://www.youtube-nocookie.com/embed/abcdef1',
      'data-embed-width="100%;x" data-embed-height="12ab"',
    )
    const iframe = activateEmbed(document.querySelector('[data-embed]') as Element)
    expect(iframe?.hasAttribute('width')).toBe(false)
    expect(iframe?.hasAttribute('height')).toBe(false)
  })
})

describe('handleEmbedClick', () => {
  it('klik na tlačítko načte iframe a přesune na něj fokus', () => {
    document.body.innerHTML = placeholderHtml('https://www.youtube-nocookie.com/embed/abcdef1')
    const button = document.querySelector('[data-embed-load]') as HTMLElement

    expect(handleEmbedClick(button)).toBe(true)
    const iframe = document.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(document.activeElement).toBe(iframe)
  })

  it('klik jinam (např. na odkaz „Otevřít") nic nenačte', () => {
    document.body.innerHTML = placeholderHtml('https://www.youtube-nocookie.com/embed/abcdef1')
    expect(handleEmbedClick(document.querySelector('a'))).toBe(false)
    expect(handleEmbedClick(null)).toBe(false)
    expect(document.querySelector('iframe')).toBeNull()
  })
})
