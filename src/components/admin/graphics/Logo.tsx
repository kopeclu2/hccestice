import React from 'react'

/**
 * Nahrazuje výchozí Payload logo na přihlašovací obrazovce znakem klubu.
 * Sdílí soubor s favicon sadou (`public/icon-512.png`, vygenerováno ze
 * `znak_hc_cestice_2850px…`), aby značka nešla ze dvou různých zdrojů.
 */
export const Logo: React.FC = () => (
  <img alt="HC Čestice" height={64} src="/icon-512.png" width={64} />
)
