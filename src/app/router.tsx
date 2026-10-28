import { lazy } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { AppLayout, SessionShell } from './AppLayout'
import { BASENAME } from '@/lib/env'
import { StartPage } from '@/routes/StartPage'

// Start is in the main chunk (it is the first screen); the rest load on demand
// and are precached by the service worker, so they open instantly offline too.
const ExamsPage = lazy(() => import('@/routes/ExamsPage'))
const PracticePage = lazy(() => import('@/routes/PracticePage'))
const ProgressPage = lazy(() => import('@/routes/ProgressPage'))
const ProfilePage = lazy(() => import('@/routes/ProfilePage'))
const NotFoundPage = lazy(() => import('@/routes/NotFoundPage'))
const SubjectPage = lazy(() => import('@/routes/SubjectPage'))
const TopicPage = lazy(() => import('@/routes/TopicPage'))
const SessionPage = lazy(() => import('@/routes/SessionPage'))
const FlashcardsPage = lazy(() => import('@/routes/FlashcardsPage'))
const MockSetupPage = lazy(() => import('@/routes/MockSetupPage'))
const MockPage = lazy(() => import('@/routes/MockPage'))
const OnboardingPage = lazy(() => import('@/routes/OnboardingPage'))
// Public pages (prerendered for SEO). main.tsx loads this chunk before the first render
// on public paths, so the prerendered HTML is replaced without a loading state.
export const loadPublic = () => import('@/public/PublicApp')
const PublicApp = lazy(() => loadPublic().then((m) => ({ default: m.PublicApp })))
const DesignSystemPage = lazy(() =>
  import('./DesignSystemPage').then((m) => ({ default: m.DesignSystemPage })),
)

export const routes: RouteObject[] = [
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { index: true, element: <StartPage /> },
      { path: 'egzaminy', element: <ExamsPage /> },
      { path: 'egzaminy/:exam/:subject', element: <SubjectPage /> },
      { path: 'egzaminy/:exam/:subject/:topic', element: <TopicPage /> },
      { path: 'cwicz', element: <PracticePage /> },
      { path: 'egzamin-probny', element: <MockSetupPage /> },
      { path: 'postepy', element: <ProgressPage /> },
      { path: 'profil', element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    // Sessions are full-screen: no tab bar, one task at a time.
    path: '/app/sesja',
    element: <SessionShell />,
    children: [
      { path: 'temat/:exam/:subject/:topic', element: <SessionPage mode="topic" /> },
      { path: 'szybka', element: <SessionPage mode="quick" /> },
      { path: 'diagnoza', element: <SessionPage mode="quick" diagnostic /> },
      { path: 'powtorki', element: <SessionPage mode="review" /> },
      { path: 'bledy', element: <SessionPage mode="mistakes" /> },
      { path: 'fiszki', element: <FlashcardsPage /> },
      { path: 'fiszki/:exam/:subject/:topic', element: <FlashcardsPage /> },
      { path: 'probny/:exam/:subject', element: <MockPage /> },
    ],
  },
  {
    // First run, full-screen like a session
    path: '/app/witaj',
    element: <SessionShell />,
    children: [{ index: true, element: <OnboardingPage /> }],
  },
  { path: '/dev/ui', element: <DesignSystemPage /> },
  { path: '/*', element: <PublicApp /> },
]

export const createRouter = () => createBrowserRouter(routes, { basename: BASENAME || '/' })
