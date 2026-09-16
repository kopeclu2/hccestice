import React from 'react'

type ManualLink = {
  label: string
  href: string
}

type ManualSection = {
  title: string
  links: ManualLink[]
}

const SECTIONS: ManualSection[] = [
  {
    title: 'Obsah',
    links: [
      { label: 'Nový článek', href: '/admin/collections/posts/create' },
      { label: 'Aktuality — seznam', href: '/admin/collections/posts' },
      { label: 'Fotogalerie', href: '/admin/collections/galleries' },
      { label: 'Média', href: '/admin/collections/media' },
    ],
  },
  {
    title: 'Hokej',
    links: [
      { label: 'Zápasy', href: '/admin/collections/matches' },
      { label: 'Soupiska (hráči)', href: '/admin/collections/players' },
      { label: 'Sezóny', href: '/admin/collections/seasons' },
    ],
  },
  {
    title: 'Nastavení',
    links: [
      { label: 'Nastavení webu (režim údržby, kontakty)', href: '/admin/globals/siteConfig' },
      { label: 'Menu — kontejnery', href: '/admin/collections/navigation-containers' },
      { label: 'Menu — položky', href: '/admin/collections/navigation-items' },
    ],
  },
  {
    title: 'Systém',
    links: [
      { label: 'Auditní log', href: '/admin/collections/audit-log' },
      { label: 'Odeslané formuláře', href: '/admin/collections/form-submissions' },
      { label: 'Přesměrování', href: '/admin/collections/redirects' },
    ],
  },
]

const NOTES = [
  'Pořadí odkazů v menu se mění přetažením myší v poli „Položky menu" na kontejneru Menu — nemění se na jednotlivých položkách.',
  'Nové položky menu se zakládají jako typ „Cesta nebo kotva", nikdy „Interní stránka" — /zapasy, /soupiska, /fotogalerie, /aktuality, /historie-klubu a /sponzori nejsou dokumenty v CMS.',
  'Zapnutí režimu údržby web nezakáže přihlášeným správcům — uvidíte ho fungovat, ostatní návštěvníci dostanou stránku o údržbě.',
  'Auditní log ukazuje jen zápisy (kdo co změnil nebo smazal), ne prohlížení stránek — a maže se automaticky po 90 dnech.',
]

/**
 * `beforeDashboard` komponenta — rychlé odkazy a poznámky k věcem, které
 * nejsou z UI samovysvětlující. Cíleně krátké, aby se dalo udržovat.
 */
export const AdminManual: React.FC = () => (
  <div
    style={{
      display: 'grid',
      gap: '1.5rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
      marginBottom: '2rem',
      padding: '1.5rem',
      border: '1px solid var(--theme-elevation-150)',
      borderRadius: 'var(--style-radius-m)',
      background: 'var(--theme-elevation-50)',
    }}
  >
    {SECTIONS.map((section) => (
      <div key={section.title}>
        <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{section.title}</h4>
        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
          {section.links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </div>
    ))}
    <div style={{ gridColumn: '1 / -1' }}>
      <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Dobré vědět</h4>
      <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
        {NOTES.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  </div>
)
