/**
 * Kolik prvních uzlů těla (odstavec, nadpis, blok…) se bere za „úvod".
 * Úvodní odstavec a obrázek pod ním jsou na mobilu ještě v prvním plátně;
 * obrázek za delším textem už je pod ohybem a `fetchPriority="high"` by mu
 * jen ubíral šířku pásma hero fotce.
 */
const LEAD_NODE_LIMIT = 3

type LooseNode = {
  type?: string
  fields?: { id?: string | null; blockType?: string }
}

/**
 * `id` prvního bloku `mediaBlock` mezi prvními uzly kořene editoru, jinak
 * `undefined`. Čistá funkce nad daty (ne počítadlo v konvertoru), takže
 * výsledek je stejný na serveru i při hydrataci a při dvojitém renderu.
 */
export function findLeadMediaBlockId(data: {
  root?: { children?: readonly unknown[] }
}): string | undefined {
  const children = (data.root?.children ?? []).slice(0, LEAD_NODE_LIMIT) as LooseNode[]
  const lead = children.find(
    (node) => node.type === 'block' && node.fields?.blockType === 'mediaBlock',
  )
  return lead?.fields?.id ?? undefined
}
