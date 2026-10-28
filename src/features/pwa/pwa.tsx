import { clsx } from 'clsx'
import {
  CloudOff,
  Download,
  Ellipsis,
  EllipsisVertical,
  Menu,
  MonitorDown,
  RefreshCw,
  Share,
  X,
} from 'lucide-react'
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { LogoMark } from '@/brand/Logo'
import { Button } from '@/ui/Button'
import { IconButton } from '@/ui/controls'

// ---------- online / offline ----------

const subscribeOnline = (cb: () => void) => {
  window.addEventListener('online', cb)
  window.addEventListener('offline', cb)
  return () => {
    window.removeEventListener('online', cb)
    window.removeEventListener('offline', cb)
  }
}

function useOnline() {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  )
}

/** Offline is normal for Leapy, so this is a quiet chip, not an error banner. */
export function OfflineChip() {
  const online = useOnline()
  if (online) return null
  return (
    <div
      role="status"
      className="fixed top-[calc(env(safe-area-inset-top)+0.75rem)] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 py-2 text-small font-bold text-bg shadow-md"
    >
      <CloudOff aria-hidden className="size-4" />
      Offline: nauka działa dalej
    </div>
  )
}

// ---------- service worker updates ----------

/** A new version waits until the learner chooses to reload, so no session is cut off mid-task. */
export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      // Check for updates hourly while the app stays open.
      if (reg) setInterval(() => void reg.update(), 60 * 60 * 1000)
    },
  })

  if (!needRefresh) return null
  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-40 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-ink p-3 pl-4 text-bg shadow-lg md:bottom-6"
    >
      <RefreshCw aria-hidden className="size-5 shrink-0" />
      <p className="flex-1 text-small font-bold">Jest nowa wersja Leapy.</p>
      <Button size="md" onClick={() => void updateServiceWorker(true)}>
        Odśwież
      </Button>
      <IconButton
        label="Później"
        onClick={() => setNeedRefresh(false)}
        className="text-bg hover:bg-ink-2 hover:text-bg"
      >
        <X aria-hidden className="size-5" />
      </IconButton>
    </div>
  )
}

// ---------- install ----------

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'leapy:install-dismissed'
const DISMISS_DAYS = 30

let deferred: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    listeners.forEach((l) => l())
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    listeners.forEach((l) => l())
  })
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export type Platform = 'ios' | 'android' | 'samsung' | 'inapp' | 'desktop'

/** Which add-to-home-screen instruction fits this browser. */
function detectPlatform(): Platform {
  const ua = navigator.userAgent
  // Facebook, Messenger and Instagram open links in their own browser, which cannot install.
  if (/FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger/i.test(ua)) return 'inapp'
  if (
    /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
    return 'ios'
  if (/SamsungBrowser/i.test(ua)) return 'samsung'
  if (/android/i.test(ua)) return 'android'
  return 'desktop'
}

function recentlyDismissed() {
  try {
    const t = Number(localStorage.getItem(DISMISS_KEY))
    return t > 0 && Date.now() - t < DISMISS_DAYS * 86_400_000
  } catch {
    return false
  }
}

/** Subscribe to the browser's install prompt becoming available or used. */
function useInstallPrompt() {
  const [, rerender] = useState(0)
  useEffect(() => {
    const l = () => rerender((n) => n + 1)
    listeners.add(l)
    return () => void listeners.delete(l)
  }, [])
  const install = async () => {
    if (!deferred) return false
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    deferred = null
    rerender((n) => n + 1)
    return outcome === 'accepted'
  }
  return { canPrompt: !!deferred, install }
}

/**
 * Install card shown inline on Start (never as a pop-up) on phones and tablets, and on
 * desktop only when the browser offers installing. Chromium gets a real install button;
 * every other browser gets its own short steps.
 */
export function InstallCard() {
  const { canPrompt, install } = useInstallPrompt()
  const [hidden, setHidden] = useState(() => isStandalone() || recentlyDismissed())
  const platform = detectPlatform()
  if (hidden || (platform === 'desktop' && !canPrompt)) return null

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      /* ignore */
    }
    setHidden(true)
  }

  return (
    <section
      aria-labelledby="install"
      className="rounded-2xl border-2 border-brand bg-brand-soft p-4 sm:p-5"
    >
      <div className="flex items-center gap-3">
        <LogoMark size={44} className="shrink-0 rounded-[11px]" />
        <h2 id="install" className="min-w-0 flex-1 font-extrabold text-ink">
          Dodaj Leapy do ekranu telefonu
        </h2>
        <IconButton label="Nie teraz" onClick={dismiss} className="-my-2 -mr-2">
          <X aria-hidden className="size-5" />
        </IconButton>
      </div>
      <div>
        <p className="mt-3 text-small text-ink-2">
          Ikonka obok innych aplikacji: otwierasz jednym stuknięciem, bez paska przeglądarki, także
          offline.
        </p>
        {canPrompt ? (
          <Button
            className="mt-3"
            icon={<Download aria-hidden className="size-5" />}
            onClick={() => void install().then((ok) => ok && setHidden(true))}
          >
            Dodaj ikonkę
          </Button>
        ) : (
          <InstallSteps platform={platform} className="mt-3" />
        )}
      </div>
    </section>
  )
}

const icon = 'inline size-4 align-[-2px]'

const STEPS: Record<Platform, { title: string; steps: ReactNode[] }> = {
  ios: {
    title: 'iPhone i iPad (Safari)',
    steps: [
      <>
        Stuknij <Share aria-label="Udostępnij" className={icon} /> <b>Udostępnij</b> na dolnym pasku
        (w Chrome: w pasku adresu).
      </>,
      <>
        Przewiń w dół i wybierz <b>Do ekranu początkowego</b>.
      </>,
      <>
        Stuknij <b>Dodaj</b> w prawym górnym rogu.
      </>,
    ],
  },
  android: {
    title: 'Android (Chrome)',
    steps: [
      <>
        Stuknij <EllipsisVertical aria-label="menu" className={icon} /> <b>menu</b> w prawym górnym
        rogu.
      </>,
      <>
        Wybierz <b>Dodaj do ekranu głównego</b> albo <b>Zainstaluj aplikację</b>.
      </>,
      <>
        Potwierdź <b>Zainstaluj</b>.
      </>,
    ],
  },
  samsung: {
    title: 'Samsung Internet',
    steps: [
      <>
        Stuknij <Menu aria-label="menu" className={icon} /> <b>menu</b> na dolnym pasku.
      </>,
      <>
        Wybierz <b>Dodaj stronę do</b>, potem <b>Ekran startowy</b>.
      </>,
      <>
        Potwierdź <b>Dodaj</b>.
      </>,
    ],
  },
  inapp: {
    title: 'Otwarte z Facebooka, Messengera lub Instagrama',
    steps: [
      <>
        Ta przeglądarka nie dodaje ikonek. Stuknij <Ellipsis aria-label="więcej" className={icon} />{' '}
        w rogu ekranu.
      </>,
      <>
        Wybierz <b>Otwórz w przeglądarce</b> (Safari albo Chrome).
      </>,
      <>Tam dodaj ikonkę według instrukcji dla swojego telefonu.</>,
    ],
  },
  desktop: {
    title: 'Komputer (Chrome, Edge)',
    steps: [
      <>
        Kliknij ikonkę <MonitorDown aria-label="instalacji" className={icon} /> po prawej stronie
        paska adresu.
      </>,
      <>
        Potwierdź <b>Zainstaluj</b>.
      </>,
    ],
  },
}

export function InstallSteps({ platform, className }: { platform: Platform; className?: string }) {
  return (
    <ol className={clsx('flex flex-col gap-2', className)}>
      {STEPS[platform].steps.map((s, i) => (
        <li key={i} className="flex gap-3 text-small text-ink">
          <span
            aria-hidden
            className="tabular grid size-6 shrink-0 place-items-center rounded-full bg-brand text-small font-extrabold text-on-brand"
          >
            {i + 1}
          </span>
          <span className="pt-0.5">{s}</span>
        </li>
      ))}
    </ol>
  )
}

/** Profil: every instruction, this browser's first. */
export function InstallGuide() {
  const { canPrompt, install } = useInstallPrompt()
  const [installed, setInstalled] = useState(() => isStandalone())
  if (installed)
    return <p className="text-ink-2">Leapy jest już na ekranie głównym. Otwierasz ją z ikonki.</p>
  const platform = detectPlatform()
  const all: Platform[] = ['ios', 'android', 'samsung', 'inapp', 'desktop']
  const order = [platform, ...all.filter((p) => p !== platform)]
  return (
    <div className="flex flex-col gap-5">
      <p className="text-ink-2">
        Ikonka Leapy działa jak zwykła aplikacja: bez sklepu i bez konta, za darmo, także offline.
      </p>
      {canPrompt && (
        <Button
          className="self-start"
          icon={<Download aria-hidden className="size-5" />}
          onClick={() => void install().then((ok) => ok && setInstalled(true))}
        >
          Dodaj ikonkę
        </Button>
      )}
      {order.map((p, i) => (
        <div key={p}>
          <h3 className="font-extrabold text-ink">
            {STEPS[p].title}
            {i === 0 && (
              <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-small font-bold whitespace-nowrap text-brand-text">
                ta przeglądarka
              </span>
            )}
          </h3>
          <InstallSteps platform={p} className="mt-2" />
        </div>
      ))}
    </div>
  )
}
