import type { CollectionBeforeValidateHook } from 'payload'
import { describe, expect, it } from 'vitest'

import { validateMediaUpload } from '@/hooks/validateMediaUpload'
import {
  MEDIA_CONTENT_SECURITY_POLICY,
  MEDIA_DOWNLOAD_EXTENSIONS,
  checkUploadExtension,
  mediaSecurityHeaders,
} from '@/lib/mediaTypes'

describe('checkUploadExtension', () => {
  it.each([
    ['foto.jpg', 'image/jpeg'],
    ['FOTO.JPG', 'image/jpeg'],
    ['logo.png', 'image/png'],
    ['stary.png', 'image/jpeg'], // import z eStránky: nesoulad dvou obrázkových přípon je neškodný
    ['rozpis.pdf', 'application/pdf'],
    ['skladba.mp3', 'audio/mpeg'],
    ['tabulka.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['dopis.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['stare.doc', 'application/x-cfb'],
    ['stare.xls', 'application/x-cfb'],
    ['foto.jpg', 'image/jpeg; charset=binary'],
  ])('povolí %s jako %s', (filename, mime) => {
    expect(checkUploadExtension(filename, mime)).toBeNull()
  })

  it.each([
    ['x.html', 'audio/mpeg'],
    ['x.html', 'application/pdf'],
    ['x.htm', 'image/png'],
    ['x.svg', 'image/png'],
    ['x.xhtml', 'image/jpeg'],
    ['x.php', 'image/jpeg'],
    ['x.js', 'audio/mpeg'],
    ['x', 'application/pdf'],
    ['.htaccess', 'application/pdf'],
    ['x.mp3.html', 'audio/mpeg'],
    ['x.pdf', 'image/png'],
    ['x.jpg', 'audio/mpeg'],
  ])('odmítne %s s typem %s', (filename, mime) => {
    expect(checkUploadExtension(filename, mime)).toEqual(expect.any(String))
  })

  it('odmítne typ mimo whitelist i prázdný typ', () => {
    expect(checkUploadExtension('x.html', 'text/html')).toContain('není povolený')
    expect(checkUploadExtension('x.svg', 'image/svg+xml')).toContain('není povolený')
    expect(checkUploadExtension('x.jpg', '')).toContain('není povolený')
  })

  it('bere jen poslední příponu a ignoruje cestu', () => {
    expect(checkUploadExtension('a.html/b.jpg', 'image/jpeg')).toBeNull()
    expect(checkUploadExtension('foto.html.jpg', 'image/jpeg')).toBeNull()
  })
})

describe('mediaSecurityHeaders', () => {
  it('obrázek a zvuk zůstanou inline, jen s CSP', () => {
    expect(mediaSecurityHeaders('image/jpeg')).toEqual({
      'Content-Security-Policy': MEDIA_CONTENT_SECURITY_POLICY,
    })
    expect(mediaSecurityHeaders('audio/mpeg')).not.toHaveProperty('Content-Disposition')
  })

  it('PDF, Office, HTML a neznámý typ se stahují', () => {
    for (const type of ['application/pdf', 'text/html', 'application/octet-stream', null]) {
      expect(mediaSecurityHeaders(type)['Content-Disposition']).toBe('attachment')
    }
  })

  it('CSP obsahuje sandbox a zakazuje vše ostatní', () => {
    expect(MEDIA_CONTENT_SECURITY_POLICY).toMatch(/^sandbox;/)
    expect(MEDIA_CONTENT_SECURITY_POLICY).toContain("default-src 'none'")
  })

  it('přípony ke stažení jsou jen dokumenty, žádný obrázek', () => {
    expect(MEDIA_DOWNLOAD_EXTENSIONS).toEqual(
      expect.arrayContaining(['pdf', 'doc', 'docx', 'xls', 'xlsx']),
    )
    expect(MEDIA_DOWNLOAD_EXTENSIONS).not.toContain('jpg')
    expect(MEDIA_DOWNLOAD_EXTENSIONS).not.toContain('mp3')
  })
})

describe('validateMediaUpload', () => {
  const run = async (args: {
    data?: Record<string, unknown>
    file?: { name: string; mimetype: string }
  }) =>
    validateMediaUpload({
      data: args.data,
      req: { file: args.file },
    } as unknown as Parameters<CollectionBeforeValidateHook>[0])

  it('odmítne soubor s příponou, která nesedí k typu', async () => {
    await expect(
      run({
        data: { filename: 'x.html', mimeType: 'audio/mpeg' },
        file: { name: 'x.html', mimetype: 'audio/mpeg' },
      }),
    ).rejects.toThrow()
  })

  it('pustí správný soubor', async () => {
    const data = { filename: 'foto.jpg', mimeType: 'image/jpeg' }
    await expect(run({ data, file: { name: 'foto.jpg', mimetype: 'image/jpeg' } })).resolves.toBe(
      data,
    )
  })

  it('bez nahrávaného souboru (úprava alt) nic nekontroluje', async () => {
    const data = { alt: 'popis', filename: '.htaccess', mimeType: null }
    await expect(run({ data })).resolves.toBe(data)
  })
})
