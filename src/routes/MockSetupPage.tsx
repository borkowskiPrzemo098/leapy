import { Clock, ListChecks, Timer, Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { subjectLabel, useCatalog } from '@/content/data'
import type { CatalogExam, CatalogSubject } from '@/content/schema'
import { mockConfig, remainingMs, type MockState } from '@/engine/mock'
import { activeMock, dropActiveMock, mockPath } from '@/features/mock/store'
import { useStudy } from '@/state/study'
import { progress, type SessionRecord } from '@/storage'
import { ButtonLink } from '@/ui/Button'
import { Button } from '@/ui/Button'
import { ConfirmDialog } from '@/ui/Dialog'
import { LoadError } from '@/ui/LoadError'
import { Page } from '@/ui/Page'
import { ScreenSkeleton } from '@/app/AppLayout'
import { tasksLabel } from '@/lib/plural'

const rules = [
  { icon: Timer, text: 'Czas biegnie od startu, także po zamknięciu aplikacji.' },
  { icon: Undo2, text: 'Możesz wracać do zadań i zmieniać odpowiedzi do końca.' },
  { icon: ListChecks, text: 'Wynik, poprawne odpowiedzi i wyjaśnienia zobaczysz po oddaniu.' },
]

export default function MockSetupPage() {
  const catalog = useCatalog()
  const { exam: myExam } = useStudy()
  const [active, setActive] = useState<MockState | null | undefined>()
  const [minutesLeft, setMinutesLeft] = useState(0)
  const [history, setHistory] = useState<SessionRecord[]>([])
  const [confirmDrop, setConfirmDrop] = useState(false)

  useEffect(() => {
    void activeMock().then((m) => {
      setActive(m ?? null)
      if (m) setMinutesLeft(Math.ceil(remainingMs(m, Date.now()) / 60_000))
    })
    void progress()
      .sessions(200)
      .then((s) => setHistory(s.filter((x) => x.mode === 'mock')))
  }, [])

  if (catalog.status === 'loading' || active === undefined) return <ScreenSkeleton />
  if (catalog.status === 'error') return <LoadError message={catalog.error} />

  // The learner's exam first, then the others; only subjects that already have tasks.
  const exams = [...catalog.data.exams]
    .sort((a, b) => Number(b.id === myExam) - Number(a.id === myExam))
    .map((e) => ({ exam: e, subjects: e.subjects.filter((s) => s.tasks > 0) }))
    .filter((e) => e.subjects.length)
  const activeSubject = active
    ? catalog.data.exams
        .find((e) => e.id === active.exam)
        ?.subjects.find((s) => s.id === active.subject)
    : undefined

  return (
    <Page
      title="Egzamin próbny"
      lead="Arkusz ćwiczebny Leapy: zadania z całego przedmiotu, z czasem i punktacją. To nie jest oficjalny arkusz CKE."
    >
      {active && (
        <section
          aria-labelledby="active"
          className="mb-8 rounded-2xl bg-brand p-5 text-on-brand sm:p-6"
        >
          <p className="text-small font-bold text-on-brand-2">Rozpoczęty arkusz</p>
          <h2 id="active" className="mt-1 text-heading text-on-brand">
            {activeSubject ? subjectLabel(activeSubject) : 'Egzamin próbny'}
          </h2>
          <p className="mt-1 flex items-center gap-2 text-on-brand-2">
            <Clock aria-hidden className="size-4" />
            Zostało {minutesLeft} min
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to={mockPath(active.exam, active.subject)} variant="reward" size="lg">
              Wróć do arkusza
            </ButtonLink>
            <Button variant="secondary" onClick={() => setConfirmDrop(true)}>
              Porzuć bez wyniku
            </Button>
          </div>
        </section>
      )}

      <ul className="grid gap-3 rounded-2xl bg-surface-2 p-4 sm:grid-cols-3 sm:gap-5 sm:p-5">
        {rules.map(({ icon: Icon, text }) => (
          <li key={text} className="flex gap-3 text-small text-ink-2">
            <Icon aria-hidden className="size-5 shrink-0 text-brand-text" />
            {text}
          </li>
        ))}
      </ul>

      {exams.length === 0 && (
        <p className="mt-8 text-ink-2">
          Żaden przedmiot nie ma jeszcze zadań. Arkusze ruszą razem z treściami.
        </p>
      )}
      {exams.map(({ exam, subjects }) => (
        <section key={exam.id} aria-labelledby={`mock-${exam.id}`} className="mt-10">
          <h2 id={`mock-${exam.id}`} className="text-heading text-ink">
            {exam.name}
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {subjects.map((s) => (
              <SubjectRow
                key={s.id}
                exam={exam}
                subject={s}
                last={history.find((h) => h.scope === `${exam.id}/${s.id}`)}
                locked={!!active}
              />
            ))}
          </ul>
        </section>
      ))}

      <ConfirmDialog
        open={confirmDrop}
        title="Porzucić rozpoczęty arkusz?"
        confirmLabel="Porzuć arkusz"
        onCancel={() => setConfirmDrop(false)}
        onConfirm={() =>
          void dropActiveMock().then(() => {
            setConfirmDrop(false)
            setActive(null)
          })
        }
      >
        Odpowiedzi z tego arkusza nie zostaną ocenione ani zapisane w postępach.
      </ConfirmDialog>
    </Page>
  )
}

function SubjectRow({
  exam,
  subject,
  last,
  locked,
}: {
  exam: CatalogExam
  subject: CatalogSubject
  last: SessionRecord | undefined
  locked: boolean
}) {
  const cfg = mockConfig(subject.mock, subject.tasks)
  return (
    <li className="flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-sm sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <h3 className="font-extrabold text-ink">{subjectLabel(subject)}</h3>
        <p className="tabular mt-1 text-small text-ink-2">
          {tasksLabel(cfg.tasks)} · {cfg.minutes} min
        </p>
        {last?.summary.maxPoints !== undefined && (
          <p className="tabular mt-1 text-small font-bold text-ink-3">
            Ostatnio: {last.summary.points ?? 0} z {last.summary.maxPoints} pkt
          </p>
        )}
      </div>
      {locked ? (
        <p className="text-small text-ink-3">Najpierw skończ rozpoczęty arkusz.</p>
      ) : (
        <ButtonLink
          to={mockPath(exam.id, subject.id)}
          aria-label={`Zacznij egzamin próbny: ${subjectLabel(subject)}`}
        >
          Zacznij
        </ButtonLink>
      )}
    </li>
  )
}
