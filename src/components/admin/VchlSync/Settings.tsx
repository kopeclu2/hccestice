'use client'

import { Banner, Button, toast } from '@payloadcms/ui'
import React, { useState } from 'react'

import { ApiError, detectIds } from './api'
import s from './styles.module.css'
import type { DetectPayload } from './types'
import { useBusyAction } from './useBusyAction'

export const Settings: React.FC = () => {
  const [detect, setDetect] = useState<DetectPayload | null>(null)
  const { busy, perform } = useBusyAction<'detect' | 'save'>()

  const call = async (save: boolean, overwrite = false) => {
    // `true` = AHL hlásí jiná ID než uložená a správce je potvrdil přepsat.
    const confirmed = await perform(save ? 'save' : 'detect', async () => {
      try {
        setDetect(await detectIds(save, overwrite))
        if (save) toast.success('ID uložena do sezóny.')
        return false
      } catch (e) {
        if (e instanceof ApiError && e.status === 409 && e.data.needsOverwrite === true) {
          // Sezóna už má obě ID a AHL hlásí jiná (typicky mezi sezónami ještě starý ročník).
          return window.confirm(e.message)
        }
        throw e
      }
    })
    if (confirmed) await call(true, true)
  }

  return (
    <>
      <section className={s.card}>
        <h2>Nastavení synchronizace</h2>
        <p className={s.muted}>
          Co se synchronizuje, jak často a komu chodí upozornění, se nastavuje v samostatném
          formuláři.
        </p>
        <div className={s.actions}>
          <Button buttonStyle="primary" el="link" size="medium" to="/admin/globals/vchl-sync">
            Otevřít nastavení
          </Button>
        </div>
      </section>

      <section className={s.card}>
        <h2>ID ročníku a týmu na AHL</h2>
        <p className={s.muted}>
          Mění se s každou sezónou. Prázdné hodnoty si job dohledá sám, tady je můžete zkontrolovat
          nebo přepsat podle toho, co ahl.cz ukazuje právě teď.
        </p>
        {detect && (
          <dl className={`${s.grid} ${s.stat}`}>
            <div className={s.stat}>
              <dt>Sezóna</dt>
              <dd>
                <a href={`/admin/collections/seasons/${detect.season.id}`}>{detect.season.title}</a>
              </dd>
            </div>
            <div className={s.stat}>
              <dt>ID ročníku</dt>
              <dd className={s.mono}>
                {detect.current.competitionYearId ?? '—'} → {detect.detected.competitionYearId}
              </dd>
            </div>
            <div className={s.stat}>
              <dt>ID týmu</dt>
              <dd className={s.mono}>
                {detect.current.participantId ?? '—'} → {detect.detected.participantId}
              </dd>
            </div>
          </dl>
        )}
        {detect && !detect.changed && (
          <Banner type="success">Uložené hodnoty odpovídají AHL.</Banner>
        )}
        <div className={s.actions}>
          <Button
            buttonStyle="secondary"
            disabled={busy !== null}
            onClick={() => call(false)}
            size="medium"
          >
            {busy === 'detect' ? 'Hledám…' : 'Autodetekovat'}
          </Button>
          {detect && detect.changed && !detect.saved && (
            <Button
              buttonStyle="primary"
              disabled={busy !== null}
              onClick={() => call(true)}
              size="medium"
            >
              Uložit do sezóny
            </Button>
          )}
          {detect && (
            <Button
              buttonStyle="subtle"
              el="link"
              size="medium"
              to={`/admin/collections/seasons/${detect.season.id}`}
            >
              Upravit sezónu
            </Button>
          )}
        </div>
      </section>
    </>
  )
}
