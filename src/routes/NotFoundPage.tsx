import { ButtonLink } from '@/ui/Button'
import { ClimbArt, EmptyState, Page } from '@/ui/Page'

export default function NotFoundPage() {
  return (
    <Page title="Nie ma takiego ekranu">
      <EmptyState
        art={<ClimbArt done={0} />}
        title="Ten stopień nie istnieje"
        action={
          <ButtonLink block to="/app">
            Wróć na start
          </ButtonLink>
        }
      >
        Link mógł się zmienić albo zawierać literówkę.
      </EmptyState>
    </Page>
  )
}
