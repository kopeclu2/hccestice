import type { DataTableBlockType } from '@/payload-types'

import React from 'react'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/utilities/ui'

import { CardTitle } from '../../components/Heading'
import { Eyebrow, Highlight } from '../../components/Kicker'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'

/**
 * Obecná datová tabulka (shadcn/ui Table v klubovém stylu).
 *
 * Data se zadávají textem — vložením z Excelu/Numbers: řádky na nových
 * řádcích, buňky oddělené tabulátorem, středníkem nebo svislítkem.
 * Oddělovač se detekuje automaticky (tab → ; → |).
 */

/** Rozparsuje vložený text na mřížku buněk. */
function parseTable(data: string | null | undefined): string[][] {
  // live preview / autosave renderuje blok i před vyplněním povinného pole
  const lines = (data ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const delimiter = lines.some((line) => line.includes('\t'))
    ? '\t'
    : lines.some((line) => line.includes(';'))
      ? ';'
      : lines.some((line) => line.includes('|'))
        ? '|'
        : null

  return lines.map((line) =>
    delimiter ? line.split(delimiter).map((cell) => cell.trim()) : [line],
  )
}

/** Číselná buňka (skóre, body, „5:2", „38", „17:45")? → zarovnat doprava. */
const isNumeric = (value: string) => /^[\d\s.,:%+–-]+$/.test(value) && /\d/.test(value)

export function DataTableBlockComponent({ block }: { block: DataTableBlockType }) {
  const grid = parseTable(block.data)
  if (grid.length === 0) return null

  const header = block.firstRowHeader ? grid[0] : null
  const rows = block.firstRowHeader ? grid.slice(1) : grid
  const columnCount = Math.max(...grid.map((row) => row.length))
  const highlight = block.highlight?.trim().toLowerCase()

  // zarovnání sloupce doprava, když jsou všechny jeho datové buňky číselné
  const rightAligned = Array.from(
    { length: columnCount },
    (_, column) =>
      Boolean(block.numericRight) &&
      rows.length > 0 &&
      rows.every((row) => !row[column] || isNumeric(row[column])),
  )

  const cellAlign = (column: number) => (rightAligned[column] ? 'text-right tabular-nums' : '')

  return (
    <SectionShell>
      <Reveal>
        {block.title && (
          <CardTitle className="mb-6" size="md">
            <Highlight>{block.title}</Highlight>
          </CardTitle>
        )}
        <div className="rounded-card bg-surface p-4.5 md:p-8">
          <Table className="text-body">
            {header && (
              <TableHeader>
                <TableRow className="border-line-soft hover:bg-transparent">
                  {header.map((cell, column) => (
                    <TableHead className={cn('h-11', cellAlign(column))} key={column}>
                      <Eyebrow tone="faint">{cell}</Eyebrow>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              {rows.map((row, rowIndex) => {
                const highlighted =
                  highlight && row.some((cell) => cell.toLowerCase().includes(highlight))
                return (
                  <TableRow
                    className={cn(
                      'border-line-soft hover:bg-tint-hover',
                      highlighted && 'bg-tint font-extrabold hover:bg-tint',
                    )}
                    key={rowIndex}
                  >
                    {Array.from({ length: columnCount }, (_, column) => (
                      <TableCell className={cn('py-2.75', cellAlign(column))} key={column}>
                        {row[column] ?? ''}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
            {block.caption && (
              <TableCaption className="text-faint text-left text-caption">
                {block.caption}
              </TableCaption>
            )}
          </Table>
        </div>
      </Reveal>
    </SectionShell>
  )
}
