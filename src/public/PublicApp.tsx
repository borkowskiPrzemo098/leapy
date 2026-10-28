import { clsx } from 'clsx'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Logo } from '@/brand/Logo'
import { ButtonLink } from '@/ui/Button'
import { BlogIndexPage, BlogPostPage } from './pages/blog'
import { ExamPublicPage, ExamsIndexPage, SubjectPublicPage, TopicPublicPage } from './pages/catalog'
import { FaqPage, LegalPage, PricingPage } from './pages/info'
import { HomePage } from './pages/home'
import { PublicNotFound } from './pages/notfound'

// The public, indexable part of Leapy: prerendered to static HTML at build time
// (scripts/prerender) and rendered by the same components in the browser.

const nav = [
  { to: '/egzaminy', label: 'Egzaminy' },
  { to: '/blog', label: 'Blog' },
  { to: '/faq', label: 'Pytania' },
  { to: '/cennik', label: 'Cennik' },
]

function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  // Close the mobile menu on navigation
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          to="/"
          aria-label="Leapy, strona główna"
          className="flex min-h-12 shrink-0 items-center no-underline"
        >
          <Logo height={32} />
        </Link>
        <nav aria-label="Główna" className="ml-4 hidden md:block">
          <ul className="flex gap-1">
            {nav.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  className={({ isActive }) =>
                    clsx(
                      'flex min-h-12 items-center rounded-lg px-3 font-bold no-underline',
                      isActive ? 'bg-brand-soft text-brand-text' : 'text-ink-2 hover:bg-surface-2',
                    )
                  }
                >
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden sm:block">
            <ButtonLink to="/app">Otwórz aplikację</ButtonLink>
          </span>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}
            onClick={() => setOpen((o) => !o)}
            className="grid size-12 place-items-center rounded-lg text-ink hover:bg-surface-2 md:hidden"
          >
            {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Główna"
          className="border-t border-line px-4 pb-4 md:hidden"
        >
          <ul className="flex flex-col">
            {nav.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className="flex min-h-14 items-center border-b border-line text-lead font-bold text-ink no-underline"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink to="/app" block size="lg" className="mt-4">
            Otwórz aplikację
          </ButtonLink>
        </nav>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-24 bg-ink text-bg">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo height={32} className="text-bg" />
          <p className="mt-4 max-w-[44ch] text-small text-bg/75">
            Leapy to niezależny projekt edukacyjny. Nie jest powiązany z Centralną Komisją
            Egzaminacyjną, Ministerstwem Edukacji ani żadną szkołą. Zadania piszemy od podstaw.
            Oficjalne informacje o egzaminach:{' '}
            <a href="https://cke.gov.pl" className="font-bold text-bg underline" rel="noopener">
              cke.gov.pl
            </a>
            .
          </p>
        </div>
        <FooterCol
          title="Nauka"
          links={[
            ['/egzaminy/e8', 'Egzamin ósmoklasisty'],
            ['/egzaminy/matura', 'Matura'],
            ['/blog', 'Blog'],
            ['/faq', 'Pytania i odpowiedzi'],
          ]}
        />
        <FooterCol
          title="Leapy"
          links={[
            ['/o-leapy', 'O Leapy'],
            ['/cennik', 'Cennik'],
            ['/prywatnosc', 'Polityka prywatności'],
            ['/regulamin', 'Regulamin'],
          ]}
        />
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="text-small font-extrabold tracking-wide text-bg/60 uppercase">{title}</h2>
      <ul className="mt-3 flex flex-col">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link
              to={to}
              className="flex min-h-11 items-center font-bold text-bg no-underline hover:underline"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Big closing call to action, shared by most public pages. */
export function AppCta({ title, text, to = '/app' }: { title: string; text: string; to?: string }) {
  return (
    <section className="relative mt-16 overflow-hidden rounded-2xl bg-brand p-8 text-on-brand sm:p-10">
      <svg
        aria-hidden
        viewBox="0 0 240 160"
        className="pointer-events-none absolute right-0 bottom-0 h-auto w-1/2 max-w-80"
      >
        <path d="M0 160V128H60V96H120V64H180V32H240V160Z" fill="var(--brand-deep)" opacity=".6" />
      </svg>
      <div className="relative max-w-xl">
        <h2 className="text-title text-on-brand">{title}</h2>
        <p className="mt-2 text-lead text-on-brand-2">{text}</p>
        <ButtonLink
          to={to}

          variant="reward"
          size="lg"
          className="mt-6"
          iconEnd={<ArrowRight aria-hidden className="size-5" />}
        >
          Zacznij za darmo
        </ButtonLink>
      </div>
    </section>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 md:pt-12">
      {children}
    </main>
  )
}

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export function PublicApp() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-brand px-4 py-3 font-bold text-on-brand focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Przejdź do treści
      </a>
      <ScrollTop />
      <Header />
      <div className="flex-1">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="egzaminy" element={<ExamsIndexPage />} />
          <Route path="egzaminy/:exam" element={<ExamPublicPage />} />
          <Route path="egzaminy/:exam/:subject" element={<SubjectPublicPage />} />
          <Route path="egzaminy/:exam/:subject/:topic" element={<TopicPublicPage />} />
          <Route path="blog" element={<BlogIndexPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="cennik" element={<PricingPage />} />
          <Route path="prywatnosc" element={<LegalPage slug="prywatnosc" />} />
          <Route path="regulamin" element={<LegalPage slug="regulamin" />} />
          <Route path="o-leapy" element={<LegalPage slug="o-leapy" />} />
          <Route path="*" element={<PublicNotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
