import { ButtonLink } from '@/ui/Button'
import { EmptyState, Page, StairsArt } from '@/ui/Page'

export default function NotFoundPage() {
  return (
    <Page title="Nie ma takiego ekranu">
      <EmptyState
        art={<StairsArt size={136} />}
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
