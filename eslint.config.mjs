import { globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    // Plugin `import` registruje eslint-config-next jen pro tyto přípony,
    // takže pravidlo smí platit jen na nich (jinak ESLint hlásí „could not
    // find plugin"). Nic dalšího se neinstaluje.
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    // Soubory v `(payload)` generuje Payload (`DO NOT MODIFY`) a po úpravě
    // šablony je přepíše zpátky, takže pořadí importů v nich nehlídáme.
    ignores: ['src/app/(payload)/**'],
    rules: {
      // `@/**` je alias na `src/` a `@payload-config` míří na `payload.config.ts`
      // (oba z `tsconfig#paths`) — bez `pathGroups` by je plugin bral jako externí
      // balíčky a smíchal s `react`, `next` apod.
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            { pattern: '@/**', group: 'internal' },
            { pattern: '@payload-config', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  {
    // Payload generuje `up`/`down({ payload, req, ... })` s pevným podpisem
    // podle `MigrateUpArgs`/`MigrateDownArgs` — nevyužité destrukturované
    // parametry tu nejsou chyba, jsou to schéma migrací a `payload
    // migrate:create` je bude produkovat stejně i příště.
    files: ['src/migrations/**'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    // Jednorázové seed/import skripty spouštěné ručně přes `bun`, ne
    // součást buildu ani runtime aplikace — pracují s volně tvarovanými
    // daty z CMS importu, kde `any` je legitimní.
    files: ['migration/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      // seed-home-landing.ts je záměrně zamrzlý historický skript — typ,
      // ze kterého čte, byl po migraci odstraněný z configu.
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  globalIgnores(['.next/', 'src/payload-types.ts', 'src/payload-generated-schema.ts']),
]

export default eslintConfig
