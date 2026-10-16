import type { DetectPayload, RunPayload, StatusPayload } from './types'

/** Odpověď endpointu s chybovým stavem; `data` nese celé tělo (např. `needsOverwrite`). */
export class ApiError extends Error {
  readonly status: number
  readonly data: Record<string, unknown>
  constructor(message: string, status: number, data: Record<string, unknown>) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function api<T>(path: string, init?: { method: 'POST'; body?: unknown }): Promise<T> {
  const res = await fetch(`/api/vchl-sync/${path}`, {
    method: init?.method ?? 'GET',
    credentials: 'same-origin',
    headers: init ? { 'Content-Type': 'application/json' } : undefined,
    body: init ? JSON.stringify(init.body ?? {}) : undefined,
  })
  const data = (await res.json().catch(() => ({}))) as T & { message?: string }
  if (!res.ok) {
    throw new ApiError(
      data.message || `Požadavek selhal (HTTP ${res.status}).`,
      res.status,
      data as Record<string, unknown>,
    )
  }
  return data
}

export const fetchStatus = () => api<StatusPayload>('status')

export const runSync = (dryRun: boolean) =>
  api<RunPayload>('run', { method: 'POST', body: { dryRun } })

export const setSyncEnabled = (enabled: boolean) =>
  api('toggle', { method: 'POST', body: { enabled } })

export const detectIds = (save: boolean, overwrite: boolean) =>
  api<DetectPayload>('detect', { method: 'POST', body: { save, overwrite } })
