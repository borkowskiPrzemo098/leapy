import { Suspense, useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { OfflineChip, UpdateToast } from '@/features/pwa/pwa'
import { watchSystemTheme } from '@/lib/theme'
import { usePrefs } from '@/state/prefs'
import { Skeleton } from '@/ui/controls'
import { ReminderWatcher } from '@/features/reminders/ReminderWatcher'
import { Sidebar, TabBar } from './Navigation'

export function ScreenSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Wczytywanie"
      className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 md:pt-10"
    >
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-3 h-5 w-72 max-w-full" />
      <Skeleton className="mt-8 h-40 rounded-2xl" />
      <Skeleton className="mt-4 h-24 rounded-2xl" />
    </div>
  )
}

/** Full-screen frame for practice sessions: no navigation, same offline/update affordances. */
export function SessionShell() {
  useEffect(() => watchSystemTheme(() => usePrefs.getState().theme), [])
  return (
    <>
      <Suspense fallback={<ScreenSkeleton />}>
        <Outlet />
      </Suspense>
      <OfflineChip />
      <UpdateToast />
      <ScrollRestoration />
    </>
  )
}

export function AppLayout() {
  const { pathname } = useLocation()

  useEffect(() => watchSystemTheme(() => usePrefs.getState().theme), [])

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-brand px-4 py-3 font-bold text-on-brand focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Przejdź do treści
      </a>
      <Sidebar />
      <main
        id="main"
        className="min-w-0 flex-1 pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+6.5rem)] md:pb-12"
      >
        {/* Keyed by path: each screen enters with a short rise (instant under reduced motion) */}
        <div key={pathname} className="animate-screen-in">
          <Suspense fallback={<ScreenSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <TabBar />
      <ReminderWatcher />
      <OfflineChip />
      <UpdateToast />
      <ScrollRestoration />
    </div>
  )
}
