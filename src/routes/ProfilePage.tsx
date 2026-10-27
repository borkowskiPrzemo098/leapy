import { Database, Mail, Monitor, Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { usePrefs, type TextScale } from '@/state/prefs'
import { Chip, Segmented, Switch } from '@/ui/controls'
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

      <Group title="Twoje dane">
        <div className="flex items-start gap-4">
          <Database aria-hidden className="mt-0.5 size-6 shrink-0 text-brand-text" />
          <div className="flex-1">
            <p className="font-bold text-ink">Kopia zapasowa</p>
            <p className="text-small text-ink-2">
              Postępy są zapisane w tej przeglądarce. Eksport i import pliku z kopią pojawią się
              razem z zapisem postępów.
            </p>
          </div>
          <Chip>Wkrótce</Chip>
        </div>
      </Group>

      <Group title="O Leapy">
        <p className="text-ink-2">
          Leapy to niezależny projekt edukacyjny. Nie jest powiązany z Centralną Komisją
          Egzaminacyjną, Ministerstwem Edukacji ani żadną uczelnią. Wszystkie zadania są pisane od
          podstaw dla Leapy.
        </p>
        <a
          href="mailto:rob.lewandowski987@gmail.com?subject=Leapy"
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
