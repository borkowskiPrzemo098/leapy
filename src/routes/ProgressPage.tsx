import { ButtonLink } from '@/ui/Button'
import { EmptyState, Page, StairsArt } from '@/ui/Page'

export default function ProgressPage() {
  return (
    <Page title="Postępy">
      <EmptyState
        art={<StairsArt size={136} />}
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
