// Ve vitestu není Next runtime, který balíček `server-only` rozpozná —
// původní modul hází při importu mimo server bundle. Stub dovolí
// importovat serverové moduly (`src/landing/data/*`) v unit testech.
export {}
