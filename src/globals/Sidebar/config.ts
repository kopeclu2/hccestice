import type { GlobalConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { AlertBlock } from '../../blocks/AlertBlock/config'
import { ExternalEmbed } from '../../blocks/ExternalEmbed/config'
import { MatchWidget } from '../../blocks/MatchWidget/config'
import { PartnerLinks } from '../../blocks/PartnerLinks/config'
import { RawHtml } from '../../blocks/RawHtml/config'
import { SponsorsBlock } from '../../blocks/SponsorsBlock/config'
import { StandingsTable } from '../../blocks/StandingsTable/config'

export const Sidebar: GlobalConfig = {
  slug: 'sidebar',
  admin: {
    group: 'Nastavení',
  },
  label: 'Postranní panel',
  access: {
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'widgets',
      type: 'blocks',
      blocks: [
        MatchWidget,
        StandingsTable,
        SponsorsBlock,
        PartnerLinks,
        AlertBlock,
        ExternalEmbed,
        RawHtml,
      ],
      admin: { initCollapsed: true },
    },
  ],
}
