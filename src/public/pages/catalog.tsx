import { clsx } from 'clsx'
import { AlertTriangle, ArrowRight, BookOpen, ExternalLink, Lightbulb } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { findSubject, findTopic, subjectLabel, useCatalog, usePack } from '@/content/data'
import type { CatalogExam } from '@/content/schema'
import { Html, Prose } from '@/features/content/Prose'
import { ButtonLink } from '@/ui/Button'
import { StairsBackdrop } from '@/ui/Page'
import { useHead } from '../head'
import { AppCta, Shell } from '../PublicApp'
import { SITE_URL } from '../site'
import { Breadcrumbs, Loading, PageTitle } from './common'
import { breadcrumbLd, tasksLabel, type Crumb } from '../seo'
import { PublicNotFound } from './notfound'

const examCrumbs = (exam: CatalogExam): Crumb[] => [
  { to: '/', label: 'Leapy' },
  { to: '/egzaminy', label: 'Egzaminy' },
  { to: `/egzaminy/${exam.id}`, label: exam.name },
]

// ---------- /egzaminy ----------

export function ExamsIndexPage() {
  const catalog = useCatalog()
  useHead({
    title: 'Egzaminy: ósmoklasisty i matura',
    description:
      'Przygotuj się do egzaminu ósmoklasisty i matury: tematy z lekcjami, zadania z wyjaśnieniami krok po kroku, powtórki i egzaminy próbne. Za darmo.',
    path: '/egzaminy',
  })
  if (catalog.status !== 'ready') return <Loading />
  return (
    <Shell>
      <PageTitle
        title="Egzaminy"
        lead="Wybierz egzamin, a zobaczysz przedmioty, działy i tematy. Każdy temat ma lekcję i zadania z wyjaśnieniami."
      />
      <ul className="mt-10 grid gap-5 md:grid-cols-2">
        {catalog.data.exams.map((e) => (
          <li key={e.id}>
            <ExamTile exam={e} />
          </li>
        ))}
      </ul>
    </Shell>
  )
}

export function ExamTile({ exam }: { exam: CatalogExam }) {
  const tasks = exam.subjects.reduce((n, s) => n + s.tasks, 0)
  return (
    <Link
      to={`/egzaminy/${exam.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-brand p-6 pb-24 text-on-brand no-underline shadow-md transition-transform duration-[var(--dur-fast)] hover:-translate-y-1 sm:p-8 sm:pb-28"
    >
      <StairsBackdrop className="w-1/2 max-w-64" />
      <span className="relative text-small font-bold text-on-brand-2">{exam.audience}</span>
      <span className="relative mt-1 text-title text-on-brand">{exam.name}</span>
      <span className="relative mt-4 flex flex-wrap gap-2">
        {exam.subjects.map((s) => (
          <span
            key={s.id}
            className="rounded-lg bg-brand-deep/60 px-3 py-1.5 text-small font-bold text-on-brand"
          >
            {subjectLabel(s)}
          </span>
        ))}
      </span>
      <span className="relative mt-6 inline-flex items-center gap-2 font-extrabold text-on-brand">
        {tasks > 0 ? `${tasksLabel(tasks)} z wyjaśnieniami` : 'Zobacz tematy'}
        <ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  )
}

// ---------- /egzaminy/:exam ----------

export function ExamPublicPage() {
  const { exam: examId = '' } = useParams()
  const catalog = useCatalog()
  const exam =
    catalog.status === 'ready' ? catalog.data.exams.find((e) => e.id === examId) : undefined
  const crumbs = exam ? examCrumbs(exam) : []
  useHead({
    title: exam ? `${exam.name}: przygotowanie, tematy i zadania` : 'Egzamin',
    description: exam
      ? `${exam.name} w Leapy: ${exam.subjects.map((s) => subjectLabel(s).toLowerCase()).join(', ')}. Lekcje, zadania z wyjaśnieniami, powtórki i egzamin próbny. Za darmo, bez konta.`.slice(
          0,
          170,
        )
      : 'Egzamin w Leapy.',
    path: `/egzaminy/${examId}`,
    jsonLd: exam ? [breadcrumbLd(crumbs)] : [],
  })
  if (catalog.status !== 'ready') return <Loading />
  if (!exam) return <PublicNotFound />

  return (
    <Shell>
      <PageTitle
        kicker={<Breadcrumbs items={crumbs} />}
        title={exam.name}
        lead={`${exam.audience}. Wybierz przedmiot, żeby zobaczyć działy i tematy z lekcjami.`}
      >
        {exam.officialUrl && (
          <p className="mt-4 text-small text-ink-2">
            Terminy, zasady i oficjalne arkusze:{' '}
            <a
              href={exam.officialUrl}
              rel="noopener"
              className="inline-flex items-center gap-1 font-bold"
            >
              strona CKE <ExternalLink aria-hidden className="size-4" />
            </a>
            . Leapy nie jest powiązane z CKE.
          </p>
        )}
      </PageTitle>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exam.subjects.map((s) => {
          const topics = s.sections.reduce((n, x) => n + x.topics.length, 0)
          return (
            <li key={s.id}>
              <Link
                to={`/egzaminy/${exam.id}/${s.id}`}
                className="flex h-full flex-col rounded-2xl bg-surface p-5 no-underline shadow-sm transition-[box-shadow,transform] duration-[var(--dur-fast)] hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="grid size-14 place-items-center rounded-2xl bg-brand text-on-brand">
                  <BookOpen aria-hidden className="size-7" />
                </span>
                <span className="mt-4 text-heading text-ink">{subjectLabel(s)}</span>
                <span className="tabular mt-1 text-small text-ink-2">
                  {s.sections.length} działów · {topics} tematów
                  {s.tasks > 0 ? ` · ${tasksLabel(s.tasks)}` : ''}
                </span>
                <span className="mt-auto pt-5 font-extrabold text-brand-text">Zobacz tematy</span>
              </Link>
            </li>
          )
        })}
      </ul>
      <AppCta
        title={`Ucz się do: ${exam.name.toLowerCase()}`}
        text="Wybierz przedmioty w aplikacji i zacznij od krótkiego testu na start. Bez konta, działa offline."
      />
    </Shell>
  )
}

// ---------- /egzaminy/:exam/:subject ----------

export function SubjectPublicPage() {
  const { exam: examId = '', subject: subjectId = '' } = useParams()
  const catalog = useCatalog()
  const found = catalog.status === 'ready' ? findSubject(catalog.data, examId, subjectId) : null
  const crumbs = found
    ? [
        ...examCrumbs(found.exam),
        { to: `/egzaminy/${examId}/${subjectId}`, label: subjectLabel(found.subject) },
      ]
    : []
  const name = found ? `${found.exam.name}: ${subjectLabel(found.subject).toLowerCase()}` : ''
  useHead({
    title: found ? `${name} – działy, tematy i zadania` : 'Przedmiot',
    description: found
      ? `${name}. ${found.subject.sections.map((s) => s.name).join(', ')}. Lekcje w pigułce i zadania z wyjaśnieniami krok po kroku.`.slice(
          0,
          170,
        )
      : 'Przedmiot w Leapy.',
    path: `/egzaminy/${examId}/${subjectId}`,
    jsonLd: found
      ? [
          breadcrumbLd(crumbs),
          {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name,
            description: `Przygotowanie do egzaminu: ${name}.`,
            inLanguage: 'pl',
            isAccessibleForFree: true,
            provider: { '@type': 'Organization', name: 'Leapy', url: SITE_URL },
          },
        ]
      : [],
  })
  if (catalog.status !== 'ready') return <Loading />
  if (!found) return <PublicNotFound />
  const { exam, subject } = found

  return (
    <Shell>
      <PageTitle
        kicker={<Breadcrumbs items={crumbs} />}
        title={subjectLabel(subject)}
        lead={`${exam.name}. ${subject.sections.length} działów. Tematy z lekcją możesz przeczytać tutaj, a zadania rozwiązać w aplikacji.`}
      />
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {subject.sections.map((sec, i) => (
          <section
            key={sec.id}
            aria-labelledby={`sec-${sec.id}`}
            className="rounded-2xl bg-surface p-5 shadow-sm sm:p-6"
          >
            <h2 id={`sec-${sec.id}`} className="flex items-center gap-3 text-heading text-ink">
              <span className="tabular grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-small font-extrabold text-on-brand">
                {i + 1}
              </span>
              {sec.name}
            </h2>
            <ul className="mt-4 flex flex-col">
              {sec.topics.map((t) => (
                <li key={t.id} className="border-t border-line first:border-t-0">
                  {t.hasLesson ? (
                    <Link
                      to={`/egzaminy/${exam.id}/${subject.id}/${t.id}`}
                      className="flex min-h-14 items-center justify-between gap-3 py-2 font-bold text-ink no-underline hover:text-brand-text"
                    >
                      {t.name}
                      <span className="tabular shrink-0 text-small text-ink-3">
                        {t.tasks > 0 ? tasksLabel(t.tasks) : 'lekcja'}
                      </span>
                    </Link>
                  ) : (
                    <p className="flex min-h-14 items-center justify-between gap-3 py-2 text-ink-2">
                      {t.name}
                      <span className="shrink-0 text-small text-ink-3">w przygotowaniu</span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <AppCta
        title="Ćwicz w aplikacji"
        text="Powtórki wracają do zadań, w których był błąd, a egzamin próbny sprawdzi cię z całego przedmiotu."
      />
    </Shell>
  )
}

// ---------- /egzaminy/:exam/:subject/:topic ----------

export function TopicPublicPage() {
  const { exam: examId = '', subject: subjectId = '', topic: topicId = '' } = useParams()
  const catalog = useCatalog()
  const pack = usePack(examId, subjectId)
  const found =
    catalog.status === 'ready' ? findTopic(catalog.data, examId, subjectId, topicId) : null
  const lesson = pack.status === 'ready' ? pack.data.lessons[topicId] : undefined
  const sample =
    pack.status === 'ready'
      ? pack.data.tasks.find((t) => t.topic === topicId && t.type === 'single')
      : undefined
  const crumbs = found
    ? [
        ...examCrumbs(found.exam),
        { to: `/egzaminy/${examId}/${subjectId}`, label: subjectLabel(found.subject) },
        { to: `/egzaminy/${examId}/${subjectId}/${topicId}`, label: found.topic.name },
      ]
    : []
  const strip = (html: string) =>
    html
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  useHead({
    title: found
      ? `${found.topic.name}: lekcja i zadania (${found.exam.name.toLowerCase()})`
      : 'Temat',
    description:
      found && lesson
        ? `${found.topic.name} w pigułce: ${strip(lesson.summary[0] ?? '')}`.slice(0, 165)
        : 'Temat w Leapy.',
    path: `/egzaminy/${examId}/${subjectId}/${topicId}`,
    type: 'article',
    jsonLd:
      found && lesson
        ? [
            breadcrumbLd(crumbs),
            {
              '@context': 'https://schema.org',
              '@type': 'LearningResource',
              name: found.topic.name,
              inLanguage: 'pl',
              learningResourceType: 'lesson',
              educationalLevel: found.exam.name,
              isAccessibleForFree: true,
              dateModified: lesson.updatedAt,
              provider: { '@type': 'Organization', name: 'Leapy', url: SITE_URL },
            },
          ]
        : [],
  })
  if (catalog.status !== 'ready' || pack.status === 'loading') return <Loading />
  if (!found || !lesson) return <PublicNotFound />
  const appTopic = `/app/egzaminy/${examId}/${subjectId}/${topicId}`

  return (
    <Shell>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="min-w-0">
          <PageTitle kicker={<Breadcrumbs items={crumbs} />} title={found.topic.name}>
            <p className="mt-3 text-small text-ink-3">
              {subjectLabel(found.subject)} · {found.exam.name} · aktualizacja {lesson.updatedAt}
              {!lesson.reviewed && ' · czeka na sprawdzenie przez redakcję'}
            </p>
          </PageTitle>

          <section
            aria-labelledby="tldr"
            className="mt-8 rounded-2xl bg-brand p-6 text-on-brand sm:p-8"
          >
            <h2 id="tldr" className="text-heading text-on-brand">
              Najważniejsze w 30 sekund
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {lesson.summary.map((s, i) => (
                <li key={i} className="flex gap-3 text-lead">
                  <span className="tabular grid size-7 shrink-0 place-items-center rounded-md bg-reward text-small font-extrabold text-on-reward">
                    {i + 1}
                  </span>
                  <Html as="span" html={s} className="min-w-0" />
                </li>
              ))}
            </ul>
          </section>

          <Prose html={lesson.body} className="mt-10 max-w-[68ch]" />

          {lesson.cheatsheet.length > 0 && (
            <section aria-labelledby="sheet" className="mt-10">
              <h2 id="sheet" className="text-heading text-ink">
                Ściąga
              </h2>
              <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                {lesson.cheatsheet.map((c, i) => (
                  <div key={i} className="rounded-xl bg-brand-soft px-4 py-3">
                    <Html
                      as="dt"
                      html={c.label}
                      className="block text-small font-bold text-brand-text"
                    />
                    <Html
                      as="dd"
                      html={c.formula}
                      className="math-scroll mt-1 block text-lead text-ink"
                    />
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section
            aria-labelledby="mistakes"
            className="mt-10 rounded-2xl bg-wrong-soft p-5 sm:p-6"
          >
            <h2 id="mistakes" className="flex items-center gap-2 text-heading text-wrong-text">
              <AlertTriangle aria-hidden className="size-6" /> Typowe błędy
            </h2>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-ink">
              {lesson.mistakes.map((m, i) => (
                <Html key={i} as="li" html={m} />
              ))}
            </ul>
          </section>

          {sample && sample.type === 'single' && (
            <section
              aria-labelledby="sample"
              className="mt-10 rounded-2xl bg-surface p-5 shadow-sm sm:p-6"
            >
              <h2 id="sample" className="flex items-center gap-2 text-heading text-ink">
                <Lightbulb aria-hidden className="size-6 text-brand-text" /> Przykładowe zadanie
              </h2>
              <Prose html={sample.prompt} className="mt-3 text-lead" />
              <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                {sample.options.map((o, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-xl border-2 border-line px-4 py-3"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-2 text-small font-extrabold text-ink-2">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <Html as="span" html={o} />
                  </li>
                ))}
              </ol>
              <details className="mt-4">
                <summary className="inline-flex min-h-12 cursor-pointer items-center font-bold text-brand-text">
                  Pokaż rozwiązanie
                </summary>
                <p className="mt-2 font-bold text-ink">
                  Odpowiedź {String.fromCharCode(65 + sample.answer)}.
                </p>
                <Prose html={sample.explanation} className="mt-2" />
              </details>
            </section>
          )}
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-ink p-6 text-bg">
            <p className="text-heading text-bg">Ćwicz ten temat</p>
            <p className="mt-2 text-small text-bg/80">
              {found.topic.tasks > 0
                ? `${tasksLabel(found.topic.tasks)} z wyjaśnieniami krok po kroku. Błędy wrócą w powtórkach.`
                : 'Zadania do tego tematu są w przygotowaniu.'}
            </p>
            <ButtonLink to={appTopic} variant="reward" block size="lg" className="mt-5">
              Otwórz w aplikacji
            </ButtonLink>
          </div>
          <OtherTopics exam={examId} subject={subjectId} current={topicId} />
        </aside>
      </div>
    </Shell>
  )
}

function OtherTopics({
  exam,
  subject,
  current,
}: {
  exam: string
  subject: string
  current: string
}) {
  const catalog = useCatalog()
  if (catalog.status !== 'ready') return null
  const found = findSubject(catalog.data, exam, subject)
  const section = found?.subject.sections.find((s) => s.topics.some((t) => t.id === current))
  const others = section?.topics.filter((t) => t.id !== current && t.hasLesson) ?? []
  if (!section || !others.length) return null
  return (
    <nav aria-labelledby="others" className="mt-5 rounded-2xl bg-surface p-5 shadow-sm">
      <h2 id="others" className="font-extrabold text-ink">
        {section.name}: inne tematy
      </h2>
      <ul className="mt-2">
        {others.map((t) => (
          <li key={t.id}>
            <Link
              to={`/egzaminy/${exam}/${subject}/${t.id}`}
              className={clsx('flex min-h-12 items-center font-bold no-underline')}
            >
              {t.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
