import { AlertTriangle, ChevronLeft, Flag, Zap } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ScreenSkeleton } from '@/app/AppLayout'
import { findTopic, loadPack, tasksOfTopic, useCatalog, useResource } from '@/content/data'
import { Html, Prose } from '@/features/content/Prose'
import { reportMailto } from '@/lib/report'
import { ButtonLink } from '@/ui/Button'
import { LoadError } from '@/ui/LoadError'
import { Page } from '@/ui/Page'
import NotFoundPage from './NotFoundPage'

export default function TopicPage() {
  const { exam = '', subject = '', topic = '' } = useParams()
  const catalog = useCatalog()
  const pack = useResource(`pack:${exam}/${subject}`, () => loadPack(exam, subject))

  if (catalog.status === 'loading' || pack.status === 'loading') return <ScreenSkeleton />
  if (catalog.status === 'error') return <LoadError message={catalog.error} />
  if (pack.status === 'error') return <LoadError message={pack.error} />
  const found = findTopic(catalog.data, exam, subject, topic)
  if (!found) return <NotFoundPage />

  const lesson = pack.data.lessons[topic]
  const count = tasksOfTopic(pack.data, topic).length
  const back = `/app/egzaminy/${exam}/${subject}`

  return (
    <Page
      title={found.topic.name}
      lead={`${found.subject.name}${found.subject.level ? `, poziom ${found.subject.level}` : ''} · ${found.section.name}`}
      actions={
        <Link
          to={back}
          className="grid size-12 shrink-0 place-items-center rounded-lg text-ink-2 hover:bg-surface-2"
          aria-label="Wróć do tematów"
        >
          <ChevronLeft aria-hidden className="size-6" />
        </Link>
      }
    >
      {lesson ? (
        <div className="flex flex-col gap-5 pb-24 md:pb-0">
          <section aria-labelledby="in30" className="rounded-2xl bg-brand p-5 text-on-brand sm:p-6">
            <h2 id="in30" className="text-heading text-on-brand">
              Najważniejsze w 30 sekund
            </h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {lesson.summary.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-reward" />
                  <Html html={s} as="span" />
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="Notatka" className="rounded-2xl bg-surface p-5 shadow-sm sm:p-6">
            <Prose html={lesson.body} />
          </section>

          {lesson.cheatsheet.length > 0 && (
            <section aria-labelledby="sheet">
              <h2 id="sheet" className="mb-3 text-heading text-ink">
                Ściąga
              </h2>
              <dl className="grid gap-2 sm:grid-cols-2">
                {lesson.cheatsheet.map((c, i) => (
                  <div key={i} className="rounded-xl bg-brand-soft px-4 py-3">
                    <Html
                      as="span"
                      html={c.label}
                      className="block text-small font-bold text-brand-text"
                    />
                    <Html
                      as="span"
                      html={c.formula}
                      className="math-scroll mt-1 block text-lead text-ink"
                    />
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section aria-labelledby="mistakes" className="rounded-2xl bg-wrong-soft p-5 sm:p-6">
            <h2 id="mistakes" className="flex items-center gap-2 text-heading text-wrong-text">
              <AlertTriangle aria-hidden className="size-6" /> Typowe błędy
            </h2>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-ink">
              {lesson.mistakes.map((m, i) => (
                <Html key={i} as="li" html={m} />
              ))}
            </ul>
          </section>

          {!lesson.reviewed && (
            <p className="text-small text-ink-3">
              Ta lekcja czeka jeszcze na sprawdzenie przez nauczyciela.{' '}
              <a
                href={reportMailto({ topic: `${exam}/${subject}/${topic}`, what: 'lekcja' })}
                className="inline-flex items-center gap-1 font-bold"
              >
                <Flag aria-hidden className="size-4" /> Zgłoś błąd
              </a>
            </p>
          )}
        </div>
      ) : (
        <p className="text-ink-2">Lekcja do tego tematu jest w przygotowaniu.</p>
      )}

      {count > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-20 px-4 md:static md:mt-6 md:px-0">
          <ButtonLink
            to={`/app/sesja/temat/${exam}/${subject}/${topic}`}
            size="lg"
            block
            className="mx-auto max-w-md shadow-lg md:mx-0"
          >
            <Zap aria-hidden className="size-5" fill="currentColor" />
            Ćwicz temat · {count} zadań
          </ButtonLink>
        </div>
      )}
    </Page>
  )
}
