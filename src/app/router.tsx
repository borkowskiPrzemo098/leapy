import { lazy } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { AppLayout, SessionShell } from './AppLayout'
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
const DesignSystemPage = lazy(() =>
  import('./DesignSystemPage').then((m) => ({ default: m.DesignSystemPage })),
)

export const routes: RouteObject[] = [
  // Public pages (home, exams, SEO) arrive in E5; until then "/" opens the app.
  { path: '/', element: <Navigate to="/app" replace /> },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { index: true, element: <StartPage /> },
      { path: 'egzaminy', element: <ExamsPage /> },
      { path: 'egzaminy/:exam/:subject', element: <SubjectPage /> },
      { path: 'egzaminy/:exam/:subject/:topic', element: <TopicPage /> },
      { path: 'cwicz', element: <PracticePage /> },
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
    ],
  },
  { path: '/dev/ui', element: <DesignSystemPage /> },
  { path: '*', element: <Navigate to="/app" replace /> },
]

export const createRouter = () => createBrowserRouter(routes)
