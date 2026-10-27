import { RefreshCw } from 'lucide-react'
import { Button } from './Button'
import { ClimbArt, EmptyState, Page } from './Page'

/** Content failed to load: say what happened and offer the one fix that usually works. */
export function LoadError({ message }: { message: string }) {
  return (
    <Page title="Coś poszło nie tak">
      <EmptyState
        art={<ClimbArt done={0} />}
        title="Nie udało się wczytać treści"
        action={
          <Button
            block
            icon={<RefreshCw aria-hidden className="size-5" />}
            onClick={() => location.reload()}
          >
            Spróbuj ponownie
          </Button>
        }
      >
        {message} Jeśli korzystasz z Leapy pierwszy raz, potrzebne jest połączenie z internetem.
      </EmptyState>
    </Page>
  )
}
