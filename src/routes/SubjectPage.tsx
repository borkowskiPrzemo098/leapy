import { clsx } from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ScreenSkeleton } from '@/app/AppLayout'
import { findSubject, useCatalog, useResource } from '@/content/data'
import { progress } from '@/storage'
import { Chip } from '@/ui/controls'
import { LoadError } from '@/ui/LoadError'
import { Page } from '@/ui/Page'
import { ProgressBar } from '@/ui/progress'
import NotFoundPage from './NotFoundPage'
import { tasksLabel } from '@/lib/plural'

/** Topic map: sections as flights of stairs, each topic a step with its own progress. */
export default function SubjectPage() {
  const { exam = '', subject = '' } = useParams()
  const catalog = useCatalog()
  const stats = useResource(`stats:${exam}/${subject}`, () => progress().topicStats(exam, subject))

  if (catalog.status === 'loading') return <ScreenSkeleton />
  if (catalog.status === 'error') return <LoadError message={catalog.error} />
  const found = findSubject(catalog.data, exam, subject)
  if (!found) return <NotFoundPage />
  const s = found.subject
  const statsMap = stats.status === 'ready' ? stats.data : new Map()

  return (
    <Page
      title={s.name}
      lead={`${found.exam.name}${s.level ? `, poziom ${s.level}` : ''}. ${
        s.tasks > 0 ? `${tasksLabel(s.tasks)} w tym przedmiocie.` : 'Zadania są w przygotowaniu.'
      }`}
      actions={
        <Link
          to="/app/egzaminy"
          className="grid size-12 shrink-0 place-items-center rounded-lg text-ink-2 hover:bg-surface-2"
          aria-label="Wróć do egzaminów"
        >
          <ChevronLeft aria-hidden className="size-6" />
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        {s.sections.map((sec, si) => {
          const secTasks = sec.topics.reduce((n, t) => n + t.tasks, 0)
          return (
            <section key={sec.id} aria-labelledby={`sec-${sec.id}`}>
              <div className="mb-3 flex items-center gap-3">
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-md bg-brand text-small font-extrabold text-on-brand shadow-[inset_0_-3px_0_var(--brand-deep)]"
                >
                  {si + 1}
                </span>
                <h2 id={`sec-${sec.id}`} className="flex-1 text-heading text-ink">
                  {sec.name}
                </h2>
                {secTasks === 0 && <Chip>W przygotowaniu</Chip>}
              </div>
              <ol className="overflow-hidden rounded-2xl bg-surface shadow-sm">
                {sec.topics.map((t) => {
                  const st = statsMap.get(`${exam}/${subject}/${t.id}`)
                  const ready = t.tasks > 0 || t.hasLesson
                  const accuracy = st && st.attempts ? st.correct / st.attempts : 0
                  const body = (
                    <>
                      <span className="flex-1">
                        <span
                          className={clsx(
                            'block font-extrabold',
                            ready ? 'text-ink' : 'text-ink-3',
                          )}
                        >
                          {t.name}
                        </span>
                        <span className="block text-small text-ink-3">
                          {ready
                            ? `${tasksLabel(t.tasks)}${st ? ` · ${Math.round(accuracy * 100)}% poprawnych` : ''}`
                            : 'w przygotowaniu'}
                        </span>
                        {st && (
                          <ProgressBar
                            value={accuracy}
                            label={`Skuteczność: ${t.name}`}
                            tone={accuracy >= 0.8 ? 'correct' : 'brand'}
                            className="mt-2 h-2.5 max-w-64"
                          />
                        )}
                      </span>
                      {ready && <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-3" />}
                    </>
                  )
                  return (
                    <li key={t.id} className="border-b border-line last:border-b-0">
                      {ready ? (
                        <Link
                          to={`/app/egzaminy/${exam}/${subject}/${t.id}`}
                          className="flex min-h-16 items-center gap-3 px-4 py-3 no-underline hover:bg-surface-2/60"
                        >
                          {body}
                        </Link>
                      ) : (
                        <div className="flex min-h-16 items-center gap-3 px-4 py-3">{body}</div>
                      )}
                    </li>
                  )
                })}
              </ol>
            </section>
          )
        })}
      </div>
    </Page>
  )
}
