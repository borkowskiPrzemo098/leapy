import { clsx } from 'clsx'
import { Check, Lock, Mail, Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { CONTACT_EMAIL } from '@/lib/report'
import { ACCENTS, isUnlocked } from '@/lib/accent'
import { useGame } from '@/features/gamify/useGame'
import { usePrefs, type TextScale } from '@/state/prefs'
import { BackupPanel } from '@/features/backup/BackupPanel'
import { GoalSettings, ReminderSettings } from '@/features/reminders/StudySettings'
import { Segmented, Switch } from '@/ui/controls'
import { Page } from '@/ui/Page'

const themeOptions = [
  { value: 'light' as const, label: 'Jasny', icon: <Sun aria-hidden className="size-4" /> },
  { value: 'dark' as const, label: 'Ciemny', icon: <Moon aria-hidden className="size-4" /> },
  { value: 'auto' as const, label: 'Auto', icon: <Monitor aria-hidden className="size-4" /> },
]

const textOptions: { value: TextScale; label: string }[] = [
  { value: 'sm', label: 'A−' },
  { value: 'md', label: 'A' },
  { value: 'lg', label: 'A+' },
  { value: 'xl', label: 'A++' },
]

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`g-${title}`} className="mt-8 first:mt-0">
      <h2 id={`g-${title}`} className="mb-3 text-heading text-ink">
        {title}
      </h2>
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">{children}</div>
    </section>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="border-b border-line py-4 first:pt-0 last:border-b-0 last:pb-0">
      <p className="font-bold text-ink">{label}</p>
      {hint && <p className="text-small text-ink-3">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  )
}

export default function ProfilePage() {
  const { theme, textScale, motion, setTheme, setTextScale, setMotion } = usePrefs()

  return (
    <Page title="Profil" lead="Ustawienia zapisują się tylko na tym urządzeniu.">
      <Group title="Wygląd">
        <Field label="Motyw">
          <Segmented label="Motyw" value={theme} options={themeOptions} onChange={setTheme} />
        </Field>
        <AccentField />
        <Field label="Rozmiar tekstu" hint="Zmienia tekst w całej aplikacji.">
          <Segmented
            label="Rozmiar tekstu"
            value={textScale}
            options={textOptions}
            onChange={setTextScale}
          />
        </Field>
        <div className="pt-3">
          <Switch
            checked={motion === 'reduce'}
            onChange={(on) => setMotion(on ? 'reduce' : 'system')}
            label="Ogranicz animacje"
            description="Wyłącza skoki, konfetti i przejścia między ekranami. Domyślnie Leapy słucha ustawień systemu."
          />
        </div>
      </Group>

      <Group title="Cele">
        <GoalSettings />
      </Group>

      <Group title="Przypomnienia">
        <ReminderSettings />
      </Group>

      <Group title="Twoje dane">
        <BackupPanel />
      </Group>

      <Group title="O Leapy">
        <p className="text-ink-2">
          Leapy to niezależny projekt edukacyjny. Nie jest powiązany z Centralną Komisją
          Egzaminacyjną, Ministerstwem Edukacji ani żadną uczelnią. Wszystkie zadania są pisane od
          podstaw dla Leapy.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=Leapy`}
          className="mt-4 inline-flex min-h-12 items-center gap-2 font-bold"
        >
          <Mail aria-hidden className="size-5" />
          Napisz do nas
        </a>
        <p className="mt-2 text-micro text-ink-3">Wersja {__APP_VERSION__}</p>
      </Group>
    </Page>
  )
}

/** Colour themes, unlocked by level: locked ones say what it takes to get them. */
function AccentField() {
  const { accent, setAccent } = usePrefs()
  const game = useGame()
  const level = game?.level.level ?? 1
  // A colour that is not unlocked (e.g. progress was deleted) falls back to the violet.
  useEffect(() => {
    const current = ACCENTS.find((a) => a.id === accent)
    if (game && current && !isUnlocked(current, game.level.level)) setAccent('fiolet')
  }, [game, accent, setAccent])
  return (
    <Field label="Kolor aplikacji" hint="Nowe kolory odblokowujesz, zdobywając kolejne stopnie.">
      <div
        role="radiogroup"
        aria-label="Kolor aplikacji"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {ACCENTS.map((a) => {
          const open = isUnlocked(a, level)
          const on = accent === a.id
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-disabled={!open}
              onClick={() => open && setAccent(a.id)}
              className={clsx(
                'flex min-h-14 items-center gap-3 rounded-xl border-2 px-3 py-2 text-left',
                on ? 'border-ink bg-surface-2' : 'border-line bg-surface',
                open ? 'hover:bg-surface-2' : 'cursor-not-allowed',
              )}
            >
              <span
                aria-hidden
                className={clsx(
                  'grid size-8 shrink-0 place-items-center rounded-full text-on-brand',
                  !open && 'opacity-40',
                )}
                style={{ background: `var(--swatch-${a.id})` }}
              >
                {on && <Check className="size-4" strokeWidth={3} />}
              </span>
              <span className="min-w-0">
                <span className={clsx('block font-bold', open ? 'text-ink' : 'text-ink-3')}>
                  {a.name}
                </span>
                {!open && (
                  <span className="flex items-center gap-1 text-micro text-ink-3">
                    <Lock aria-hidden className="size-3" /> od stopnia {a.level}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </Field>
  )
}
