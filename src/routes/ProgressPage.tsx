import { ButtonLink } from '@/ui/Button'
import { ClimbArt, EmptyState, Page } from '@/ui/Page'

export default function ProgressPage() {
  return (
    <Page title="Postępy">
      <EmptyState
        art={<ClimbArt done={0} />}
        title="Tu zbudujesz swoje schody"
        action={
          <ButtonLink block to="/app/cwicz">
            Przejdź do ćwiczeń
          </ButtonLink>
        }
      >
        Po pierwszej sesji zobaczysz tu skuteczność w każdym temacie, serię dni i kalendarz nauki.
      </EmptyState>
    </Page>
  )
}
