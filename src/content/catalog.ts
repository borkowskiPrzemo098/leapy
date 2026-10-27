// Temporary static catalog for the shell (E1). From E2 this is generated from
// content/exams/*.json by the content pipeline, and this file goes away.

export interface CatalogSubject {
  id: string
  name: string
  level?: string
}

export interface CatalogExam {
  id: string
  name: string
  short: string
  audience: string
  subjects: CatalogSubject[]
}

export const CATALOG: CatalogExam[] = [
  {
    id: 'e8',
    name: 'Egzamin ósmoklasisty',
    short: 'E8',
    audience: 'Klasa 8 szkoły podstawowej',
    subjects: [
      { id: 'polski', name: 'Język polski' },
      { id: 'matematyka', name: 'Matematyka' },
      { id: 'angielski', name: 'Język angielski' },
    ],
  },
  {
    id: 'matura',
    name: 'Matura',
    short: 'M',
    audience: 'Szkoła średnia',
    subjects: [
      { id: 'matematyka-p', name: 'Matematyka', level: 'podstawowy' },
      { id: 'matematyka-r', name: 'Matematyka', level: 'rozszerzony' },
      { id: 'polski-p', name: 'Język polski', level: 'podstawowy' },
      { id: 'angielski-p', name: 'Język angielski', level: 'podstawowy' },
      { id: 'angielski-r', name: 'Język angielski', level: 'rozszerzony' },
    ],
  },
]
