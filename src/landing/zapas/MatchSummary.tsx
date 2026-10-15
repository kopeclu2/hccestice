import React from 'react'

import { Badge } from '../components/Badge'
import { Eyebrow } from '../components/Kicker'
import { countLabel } from '../data/format'
import type { MatchSummary as MatchSummaryData } from '../data/matchSummary'

import { MatchPanel } from './MatchPanel'

/** Číselná buňka tabulky: úzká, zarovnaná vpravo, tabulkové číslice. */
const NUM = 'w-8 text-right tabular-nums'

/**
 * Souhrn zápasu za HC Čestice vedle časové osy: kanadské body, tresty po
 * hráčích a góly v přesilovce / oslabení. Na desktopu vyplňuje pravý sloupec,
 * aby osa nemusela přes celých 1320 px (stav po gólu by stál daleko od jména);
 * na mobilu jde pod osu.
 *
 * Data počítá `buildMatchSummary` z osy, takže souhlasí s tím, co je vidět
 * vlevo. Prázdná sekce se nevykreslí, prázdný souhrn vůbec.
 */
export function MatchSummary({ summary }: { summary: MatchSummaryData }) {
  const { points, penalties, penaltyMinutes, ppGoals, shGoals } = summary
  if (points.length === 0 && penalties.length === 0) return null

  return (
    <MatchPanel id="zapas-souhrn" title="Souhrn">
      <div className="mt-5 space-y-6">
        {points.length > 0 && (
          <div>
            <h3>
              <Eyebrow tone="club">Kanadské body</Eyebrow>
            </h3>
            <table className="mt-2 w-full text-sm md:text-base">
              <caption className="sr-only">
                Kanadské body hráčů HC Čestice: góly, asistence a body
              </caption>
              <thead>
                <tr className="text-faint text-xs font-bold">
                  <th className="py-1.5 text-left font-bold" scope="col">
                    Hráč
                  </th>
                  <th className={NUM} scope="col">
                    <abbr className="no-underline" title="Góly">
                      G
                    </abbr>
                  </th>
                  <th className={NUM} scope="col">
                    <abbr className="no-underline" title="Asistence">
                      A
                    </abbr>
                  </th>
                  <th className={NUM} scope="col">
                    <abbr className="no-underline" title="Body">
                      B
                    </abbr>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-line-soft divide-y border-line-soft border-t">
                {points.map((row) => (
                  <tr key={row.name}>
                    <th className="py-2 pr-2 text-left font-bold break-words" scope="row">
                      {row.name}
                    </th>
                    <td className={`${NUM} text-ink-soft font-semibold`}>{row.goals}</td>
                    <td className={`${NUM} text-ink-soft font-semibold`}>{row.assists}</td>
                    <td className={`${NUM} font-extrabold`}>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(ppGoals > 0 || shGoals > 0) && (
              <p className="mt-3 flex flex-wrap gap-2">
                {ppGoals > 0 && (
                  <Badge size="sm" variant="chip">
                    {countLabel(ppGoals, ['gól', 'góly', 'gólů'])} v přesilovce
                  </Badge>
                )}
                {shGoals > 0 && (
                  <Badge size="sm" variant="chip">
                    {countLabel(shGoals, ['gól', 'góly', 'gólů'])} v oslabení
                  </Badge>
                )}
              </p>
            )}
          </div>
        )}

        {penalties.length > 0 && (
          <div>
            <h3 className="flex items-baseline justify-between gap-3">
              <Eyebrow tone="club">Tresty</Eyebrow>
              <span className="text-sm font-extrabold tabular-nums">
                {`${penaltyMinutes} `}
                <span aria-hidden>TM</span>
                <span className="sr-only">trestných minut celkem</span>
              </span>
            </h3>
            <ul className="divide-line-soft border-line-soft mt-2 divide-y border-t text-sm md:text-base">
              {penalties.map((row) => (
                <li className="flex items-baseline justify-between gap-3 py-2" key={row.name}>
                  <span className="min-w-0 font-bold break-words">{row.name}</span>
                  <span className="text-ink-soft flex-none font-semibold tabular-nums">
                    {row.minutes}&nbsp;min
                    {row.count > 1 && <span className="text-faint text-xs"> ({row.count}×)</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </MatchPanel>
  )
}
