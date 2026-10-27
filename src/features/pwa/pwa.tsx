import { CloudOff, Download, RefreshCw, Share, X } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'
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

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

function recentlyDismissed() {
  try {
    const t = Number(localStorage.getItem(DISMISS_KEY))
    return t > 0 && Date.now() - t < DISMISS_DAYS * 86_400_000
  } catch {
    return false
  }
}

/**
 * Install card shown inline on Start (never as a pop-up). Chrome/Edge/Android get a real
 * install button; iOS Safari gets the two-tap instruction because it has no install API.
 */
export function InstallCard() {
  const [, rerender] = useState(0)
  const [hidden, setHidden] = useState(() => isStandalone() || recentlyDismissed())

  useEffect(() => {
    const l = () => rerender((n) => n + 1)
    listeners.add(l)
    return () => void listeners.delete(l)
  }, [])

  const ios = isIOS()
  if (hidden || (!deferred && !ios)) return null

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      /* ignore */
    }
    setHidden(true)
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    deferred = null
    if (outcome === 'accepted') setHidden(true)
    else rerender((n) => n + 1)
  }

  return (
    <section
      aria-label="Instalacja aplikacji"
      className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-4 shadow-sm"
    >
      <LogoMark size={48} className="shrink-0 rounded-[12px]" />
      <div className="flex-1">
        <h2 className="font-extrabold text-ink">Leapy na ekranie głównym</h2>
        {ios ? (
          <p className="mt-1 text-small text-ink-2">
            Stuknij <Share aria-label="Udostępnij" className="inline size-4 align-[-2px]" />, potem
            „Do ekranu początkowego”. Leapy otworzy się jak aplikacja i zadziała offline.
          </p>
        ) : (
          <>
            <p className="mt-1 text-small text-ink-2">
              Otwierasz jednym stuknięciem, działa offline.
            </p>
            <Button
              className="mt-3"
              icon={<Download aria-hidden className="size-5" />}
              onClick={() => void install()}
            >
              Zainstaluj
            </Button>
          </>
        )}
      </div>
      <IconButton label="Nie teraz" onClick={dismiss} className="-mt-2 -mr-2">
        <X aria-hidden className="size-5" />
      </IconButton>
    </section>
  )
}
