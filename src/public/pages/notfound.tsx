import { useLocation } from 'react-router-dom'
import { ButtonLink } from '@/ui/Button'
import { ClimbArt } from '@/ui/Page'
import { useHead } from '../head'
import { Shell } from '../PublicApp'

export function PublicNotFound() {
  const { pathname } = useLocation()
  useHead({
    title: 'Nie ma takiej strony',
    description: 'Tej strony nie ma w Leapy. Zobacz listę egzaminów albo wróć na stronę główną.',
    path: pathname,
    noindex: true,
  })
  return (
    <Shell>
      <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
        <div aria-hidden className="w-full max-w-56">
          <ClimbArt done={0} />
        </div>
        <h1 className="mt-8 text-title text-ink">Nie ma takiej strony</h1>
        <p className="mt-2 text-ink-2">
          Może ten stopień jeszcze nie powstał. Zacznij od listy egzaminów.
        </p>
        <div className="mt-6 flex w-full flex-col gap-3">
          <ButtonLink to="/egzaminy" block size="lg">
            Zobacz egzaminy
          </ButtonLink>
          <ButtonLink to="/" variant="secondary" block>
            Strona główna
          </ButtonLink>
        </div>
      </div>
    </Shell>
  )
}
