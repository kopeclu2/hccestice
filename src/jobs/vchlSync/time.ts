const TZ = 'Europe/Prague'

const fmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function partsOf(ms: number) {
  const p = Object.fromEntries(fmt.formatToParts(new Date(ms)).map((x) => [x.type, x.value]))
  return {
    y: +p.year,
    mo: +p.month,
    d: +p.day,
    h: +p.hour,
    mi: +p.minute,
    s: +p.second,
  }
}

/** Posun Europe/Prague proti UTC v ms (7 200 000 v létě, 3 600 000 v zimě). */
function offsetMs(utcMs: number): number {
  const p = partsOf(utcMs)
  return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(utcMs / 1000) * 1000
}

/**
 * Lokální čas z ahl.cz (`YYYY-MM-DDTHH:mm:ss`, bez zóny) → UTC `Date`.
 *
 * Nestačí `new Date(local)`: ten bere zónu stroje, takže na Docker kontejneru
 * v UTC by se každý zápas posunul o 1–2 hodiny. Offset se proto zjišťuje
 * z `Intl` a po prvním odhadu se ověří znovu — kolem přechodu na letní čas
 * (poslední neděle března / října) se offset liší mezi odhadem a výsledkem.
 * Neexistující hodina (jarní skok 2:00 → 3:00) a opakovaná (podzimní) se
 * vyřeší deterministicky; zápasy se v noci nehrají.
 */
export function pragueLocalToUtc(local: string): Date {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/)
  if (!m) throw new Error(`Neplatné lokální datum „${local}"`)
  const asUtc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0))
  const off1 = offsetMs(asUtc)
  let utc = asUtc - off1
  const off2 = offsetMs(utc)
  if (off2 !== off1) utc = asUtc - off2
  return new Date(utc)
}

const pad = (n: number) => String(n).padStart(2, '0')

/** UTC okamžik → lokální den a čas v Europe/Prague. */
export function utcToPragueLocal(date: Date | string): { day: string; time: string } {
  const p = partsOf(new Date(date).getTime())
  return { day: `${p.y}-${pad(p.mo)}-${pad(p.d)}`, time: `${pad(p.h)}:${pad(p.mi)}` }
}
