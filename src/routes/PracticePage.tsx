import { BookmarkX, Layers, RotateCcw, Target, Timer, Zap, type LucideIcon } from 'lucide-react'
import { Chip } from '@/ui/controls'
import { Page } from '@/ui/Page'

const modes: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Target, title: 'Wybrany temat', text: 'Ćwiczysz jeden temat, aż wejdzie.' },
  { icon: RotateCcw, title: 'Powtórki', text: 'Zadania, które warto powtórzyć właśnie dziś.' },
  { icon: BookmarkX, title: 'Moje błędy', text: 'Wracasz tylko do tego, co poszło źle.' },
  { icon: Layers, title: 'Fiszki', text: 'Wzory, definicje i daty w krótkich seriach.' },
  { icon: Timer, title: 'Egzamin próbny', text: 'Pełny arkusz z czasem i punktacją.' },
]

export default function PracticePage() {
  return (
    <Page title="Ćwicz">
      <section
        aria-labelledby="quick"
        className="flex items-center gap-5 rounded-2xl bg-brand p-6 text-on-brand"
      >
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-reward text-on-reward shadow-[0_4px_0_var(--reward-deep)]">
          <Zap aria-hidden className="size-8" fill="currentColor" />
        </span>
        <div className="flex-1">
          <h2 id="quick" className="text-heading text-on-brand">
            Szybka sesja · 5 minut
          </h2>
          <p className="mt-1 text-small text-on-brand-2">
            Mieszanka zadań z twoich przedmiotów. Ruszy, gdy wybierzesz egzamin i pojawią się
            treści.
          </p>
        </div>
      </section>

      <h2 className="mt-10 text-heading text-ink">Inne tryby</h2>
      <ul className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
        {modes.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex min-h-18 items-center gap-4 border-b border-line px-4 py-3 last:border-b-0"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-surface-2 text-brand-text">
              <Icon aria-hidden className="size-6" />
            </span>
            <div className="flex-1">
              <h3 className="font-extrabold text-ink">{title}</h3>
              <p className="text-small text-ink-2">{text}</p>
            </div>
            <Chip>Wkrótce</Chip>
          </li>
        ))}
      </ul>
    </Page>
  )
}
