import React from 'react'

/**
 * Nahrazuje výchozí Payload ikonu v navigaci (sbalený sidebar, mobilní
 * lišta) znakem klubu. Stejný zdroj jako `Logo` a favicon —
 * `public/icon-512.png`.
 */
export const Icon: React.FC = () => (
  <img alt="HC Čestice" height="100%" src="/icon-512.png" width="100%" />
)
