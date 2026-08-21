import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { isLandingBlock, renderLandingBlock } from '@/landing/render'
import { FormBlock } from '@/blocks/Form/Component'
import { RawHtmlBlock } from '@/blocks/RawHtml/Component'

/**
 * Render layoutu dynamických stránek (kolekce Stránky mimo homepage).
 *
 * Většinu bloků obsluhuje klubový design systém (`renderLandingBlock`,
 * viz katalog /widgety); zde zůstávají jen bloky mimo něj:
 * formulář (form builder plugin) a RawHtml (import z eStránek).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blockComponents: Record<string, React.FC<any>> = {
  formBlock: FormBlock,
  rawHtml: RawHtmlBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          // Landing/obecné sekce: typografie Archivo, ořez watermarků a
          // TĚSNĚJŠÍ rytmus než na homepage (200px mezery jsou marketingové,
          // obsahové podstránky potřebují ~1/3)
          if (blockType && isLandingBlock(blockType)) {
            return (
              <div
                className="font-display text-ink overflow-x-clip [&_section]:mt-10! md:[&_section]:mt-16!"
                key={index}
              >
                {renderLandingBlock(block, index)}
              </div>
            )
          }

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
