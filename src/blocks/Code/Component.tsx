import React from 'react'

import { CopyButton } from './CopyButton'

export type CodeBlockProps = {
  code: string
  language?: string
  blockType: 'code'
}

type Props = CodeBlockProps & {
  className?: string
}

/**
 * Blok s kódem — renderuje se **na serveru**, bez zvýrazňování syntaxe.
 *
 * Dřív to byla klientská komponenta nad `prism-react-renderer`. Ta se do
 * klientského grafu dostávala přes `RichText` (konvertor `code:`), a protože
 * `RichText` používá i blok `TextSection`, platila Prism **homepage, detail
 * článku i každá CMS stránka** — 30,4 kB gzip na třech nejnavštěvovanějších
 * routách za zvýraznění syntaxe, které na webu hokejového klubu nikdo
 * nepoužil (ověřeno dotazem do CMS: blok `code` je v obsahu 0×).
 *
 * Blok zůstává funkční a registrovaný v editoru
 * (`src/fields/defaultLexical.ts`, `BlocksFeature`), jen ukazuje kód prostým
 * `<pre>` s čísly řádků. Kdyby zvýrazňování někdy bylo potřeba, patří načíst
 * `import()`em až uvnitř klientské komponenty, ne staticky — jinak se vrátí
 * na všechny tři routy.
 */
export const CodeBlock: React.FC<Props> = ({ className, code }) => {
  if (!code) return null

  const lines = code.replace(/\n$/, '').split('\n')

  return (
    <div className={[className, 'not-prose'].filter(Boolean).join(' ')}>
      <pre className="bg-black p-4 border text-xs border-border rounded overflow-x-auto">
        <code className="table w-full">
          {lines.map((line, i) => (
            <span className="table-row" key={i}>
              <span className="table-cell select-none text-right text-white/25">{i + 1}</span>
              <span className="table-cell pl-4 text-white">{line}</span>
            </span>
          ))}
        </code>
        <CopyButton code={code} />
      </pre>
    </div>
  )
}
