import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { YouTubeBlock } from '@/landing/blocks/YouTube/Component'
import { ClickToLoadEmbed, EmbedLoader } from '@/landing/ui/ClickToLoadEmbed'

afterEach(cleanup)

const mapUrl = 'http://maps.google.com/maps?q=Zimn%C3%AD%20stadion&output=embed'

describe('ClickToLoadEmbed', () => {
  it('před kliknutím nevykreslí iframe, jen tlačítko, poznámku a záložní odkaz', () => {
    const { container, getByRole } = render(
      createElement(ClickToLoadEmbed, { src: mapUrl, title: 'Mapa stadionu' }),
    )

    expect(container.querySelector('iframe')).toBeNull()
    expect(getByRole('button', { name: 'Načíst Google Mapy' })).toBeTruthy()
    expect(container.textContent).toContain('IP adresa')
    const link = getByRole('link', { name: 'Otevřít v novém okně' })
    expect(link.getAttribute('href')).toBe(
      'https://maps.google.com/maps?q=Zimn%C3%AD%20stadion&output=embed',
    )
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
  })

  it('po kliknutí vloží iframe s https adresou a přesune na něj fokus', () => {
    const { container, getByRole } = render(
      createElement(ClickToLoadEmbed, {
        src: mapUrl,
        title: 'Mapa stadionu',
        sandbox: 'allow-scripts',
      }),
    )

    act(() => {
      fireEvent.click(getByRole('button', { name: 'Načíst Google Mapy' }))
    })

    const iframe = container.querySelector('iframe')
    expect(iframe?.getAttribute('src')).toBe(
      'https://maps.google.com/maps?q=Zimn%C3%AD%20stadion&output=embed',
    )
    expect(iframe?.getAttribute('title')).toBe('Mapa stadionu')
    expect(iframe?.getAttribute('sandbox')).toBe('allow-scripts')
    expect(container.querySelector('button')).toBeNull()
    expect(document.activeElement).toBe(iframe)
  })

  it('YouTube se vkládá z youtube-nocookie.com', () => {
    const { container, getByRole } = render(
      createElement(ClickToLoadEmbed, {
        src: 'http://www.youtube.com/embed/SY-B0FvrnZE',
        title: 'Video',
      }),
    )
    act(() => {
      fireEvent.click(getByRole('button', { name: 'Načíst YouTube' }))
    })
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(
      'https://www.youtube-nocookie.com/embed/SY-B0FvrnZE',
    )
  })

  it('nepovolená adresa nevykreslí nic', () => {
    const { container } = render(
      createElement(ClickToLoadEmbed, { src: 'https://evil.example/x', title: 'x' }),
    )
    expect(container.innerHTML).toBe('')
  })
})

describe('EmbedLoader', () => {
  it('po kliknutí na tlačítko v legacy HTML vloží iframe', () => {
    document.body.innerHTML =
      '<div><span data-embed="http://www.youtube.com/embed/abcdef1" data-embed-title="Video"><button type="button" data-embed-load>Načíst YouTube</button></span></div>'
    render(createElement(EmbedLoader))

    expect(document.querySelector('iframe')).toBeNull()
    act(() => {
      fireEvent.click(document.querySelector('[data-embed-load]') as Element)
    })
    expect(document.querySelector('iframe')?.getAttribute('src')).toBe(
      'https://www.youtube-nocookie.com/embed/abcdef1',
    )
  })
})

describe('blok YouTube', () => {
  it('běžný odkaz na video vykreslí zástupný rámeček a po kliknutí nocookie iframe', () => {
    const { container, getByRole } = render(
      createElement(YouTubeBlock, {
        url: 'https://www.youtube.com/watch?v=SY-B0FvrnZE',
        blockType: 'youtube',
      }),
    )
    expect(container.querySelector('iframe')).toBeNull()
    act(() => {
      fireEvent.click(getByRole('button', { name: 'Načíst YouTube' }))
    })
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(
      'https://www.youtube-nocookie.com/embed/SY-B0FvrnZE',
    )
  })
})
