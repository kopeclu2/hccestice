'use client'

import { Pill } from '@payloadcms/ui'
import React from 'react'

import { STATUS_LABEL, WARNING_LABEL } from './format'
import s from './styles.module.css'
import type { LinkedWarning } from './types'

const STATUS_PILL: Record<string, 'success' | 'error' | 'warning'> = {
  ok: 'success',
  error: 'error',
  partial: 'warning',
}

export const StatusPill: React.FC<{ status: string }> = ({ status }) => (
  <Pill pillStyle={STATUS_PILL[status] ?? 'light-gray'} size="small">
    {STATUS_LABEL[status] ?? status}
  </Pill>
)

export const WarningList: React.FC<{ warnings: LinkedWarning[] }> = ({ warnings }) => (
  <ul className={s.list}>
    {warnings.map((w, i) => (
      <li key={`${w.type}:${w.ref ?? ''}:${i}`}>
        <Pill pillStyle="warning" size="small">
          {WARNING_LABEL[w.type] ?? w.type}
        </Pill>
        <span>{w.message}</span>
        {w.link && (
          <a href={w.link.href} rel="noreferrer" target="_blank">
            {w.link.label} →
          </a>
        )}
      </li>
    ))}
  </ul>
)
