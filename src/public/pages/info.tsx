import { Check, Plus, Sparkles } from 'lucide-react'
import { useSite } from '@/content/data'
import { Html, Prose } from '@/features/content/Prose'
import { ButtonLink } from '@/ui/Button'
import { useHead } from '../head'
import { AppCta, Shell } from '../PublicApp'
import { Breadcrumbs, Loading, PageTitle } from './common'
import { breadcrumbLd } from '../seo'
import { PublicNotFound } from './notfound'

const strip = (html: string) => html.replace(/<[^>]+>/g, '').trim()

// ---------- /faq ----------

export function FaqPage() {
  const site = useSite()
  const faq = site.status === 'ready' ? site.data.faq : []
  useHead({
    title: 'Pytania i odpowiedzi',
    description:
      'Najczęstsze pytania o Leapy: czy jest darmowe, jak przenieść postęp, czy działa offline, skąd są zadania i jak działają powtórki.',
    path: '/faq',
    jsonLd: faq.length
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: strip(f.a) },
            })),
          },
        ]
      : [],
  })
  if (site.status !== 'ready') return <Loading />
  return (
    <Shell>
      <PageTitle
        title="Pytania i odpowiedzi"
        lead="Nie ma tu odpowiedzi? Napisz do nas, adres jest na dole strony."
      />
      <div className="mt-10 flex max-w-3xl flex-col gap-3">
        {faq.map((f) => (
          <details key={f.q} className="group rounded-2xl bg-surface shadow-sm">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-lead font-extrabold text-ink">
              {f.q}
              <span
                aria-hidden
                className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-text transition-transform duration-[var(--dur-fast)] group-open:rotate-45"
              >
                <Plus className="size-5" />
              </span>
            </summary>
            <Html html={f.a} className="prose px-5 pb-5" />
          </details>
        ))}
      </div>
      <AppCta
        title="Sprawdź, jak to działa"
        text="Wybierz egzamin i rozwiąż pierwsze zadania. To zajmie minutę."
      />
    </Shell>
  )
}

// ---------- /cennik ----------

const free = [
  'Wszystkie lekcje i zadania',
  'Wyjaśnienia krok po kroku',
  'Powtórki, tryb „Moje błędy” i fiszki',
  'Egzaminy próbne z czasem i punktacją',
  'Statystyki, seria dni i odznaki',
  'Działa offline, bez konta',
  'Kopia postępów do pliku',
]

export function PricingPage() {
  useHead({
    title: 'Cennik',
    description:
      'Leapy jest darmowe. Wszystkie lekcje, zadania, powtórki i egzaminy próbne bez opłat i bez konta. Plan płatny jest w przygotowaniu.',
    path: '/cennik',
  })
  return (
    <Shell>
      <PageTitle
        title="Cennik"
        lead="Dziś wszystko w Leapy jest darmowe. Nie prosimy o kartę, konto ani e-mail."
      />
      <div className="mt-10 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <section
          aria-labelledby="free"
          className="rounded-2xl bg-brand p-6 text-on-brand shadow-md sm:p-8"
        >
          <p className="text-small font-bold text-on-brand-2">Plan darmowy</p>
          <h2 id="free" className="mt-1 text-display text-on-brand">
            0 zł
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {free.map((f) => (
              <li key={f} className="flex items-start gap-3 font-bold text-on-brand">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-reward text-on-reward">
                  <Check aria-hidden className="size-4" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <ButtonLink to="/app" variant="reward" size="lg" className="mt-8">
            Zacznij za darmo
          </ButtonLink>
        </section>
        <section
          aria-labelledby="plus"
          className="rounded-2xl border-2 border-dashed border-line-strong bg-surface p-6 sm:p-8"
        >
          <span className="grid size-12 place-items-center rounded-xl bg-surface-2 text-brand-text">
            <Sparkles aria-hidden className="size-6" />
          </span>
          <h2 id="plus" className="mt-4 text-heading text-ink">
            Plan płatny: w przygotowaniu
          </h2>
          <p className="mt-2 text-ink-2">
            Myślimy o dodatkach, na przykład pakietach offline całych przedmiotów i dodatkowych
            arkuszach próbnych. Nie ma jeszcze ceny ani daty. Gdy plan płatny się pojawi, wszystko,
            co jest dziś darmowe, takie zostanie.
          </p>
        </section>
      </div>
    </Shell>
  )
}

// ---------- /prywatnosc, /regulamin, /o-leapy ----------

export function LegalPage({ slug }: { slug: string }) {
  const site = useSite()
  const page = site.status === 'ready' ? site.data.pages[slug] : undefined
  const crumbs = page
    ? [
        { to: '/', label: 'Leapy' },
        { to: `/${slug}`, label: page.title },
      ]
    : []
  useHead({
    title: page?.title ?? 'Leapy',
    description: page?.description ?? 'Leapy',
    path: `/${slug}`,
    jsonLd: page ? [breadcrumbLd(crumbs)] : [],
  })
  if (site.status !== 'ready') return <Loading />
  if (!page) return <PublicNotFound />
  return (
    <Shell>
      <PageTitle kicker={<Breadcrumbs items={crumbs} />} title={page.title}>
        <p className="mt-3 text-small text-ink-3">Ostatnia aktualizacja: {page.updatedAt}</p>
      </PageTitle>
      <Prose html={page.html} className="mt-8 max-w-[68ch]" />
    </Shell>
  )
}
