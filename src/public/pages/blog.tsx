import { ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useSite } from '@/content/data'
import type { CompiledPost } from '@/content/schema'
import { Prose } from '@/features/content/Prose'
import { useHead } from '../head'
import { AppCta, Shell } from '../PublicApp'
import { SITE_URL } from '../site'
import { Breadcrumbs, Loading, PageTitle } from './common'
import { breadcrumbLd } from '../seo'
import { PublicNotFound } from './notfound'

const dateFmt = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
const postDate = (d: string) => dateFmt.format(new Date(`${d}T12:00:00`))

export function PostCard({ post }: { post: CompiledPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex h-full flex-col rounded-2xl bg-surface p-6 no-underline shadow-sm transition-[box-shadow,transform] duration-[var(--dur-fast)] hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="text-small font-bold text-ink-3">
        {postDate(post.date)} · {post.minutes} min czytania
      </span>
      <span className="mt-2 text-heading text-ink group-hover:text-brand-text">{post.title}</span>
      <span className="mt-2 text-ink-2">{post.description}</span>
      <span className="mt-auto inline-flex items-center gap-2 pt-5 font-extrabold text-brand-text">
        Czytaj <ArrowRight aria-hidden className="size-5" />
      </span>
    </Link>
  )
}

export function BlogIndexPage() {
  const site = useSite()
  useHead({
    title: 'Blog: jak się uczyć do egzaminów',
    description:
      'Porady do nauki przed egzaminem ósmoklasisty i maturą: plany nauki, powtórki, omówienia najtrudniejszych tematów.',
    path: '/blog',
  })
  if (site.status !== 'ready') return <Loading />
  return (
    <Shell>
      <PageTitle
        title="Blog"
        lead="Jak się uczyć, żeby pamiętać. Plany, omówienia tematów i sprawdzone sposoby."
      />
      <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {site.data.posts.map((p) => (
          <li key={p.slug}>
            <PostCard post={p} />
          </li>
        ))}
      </ul>
    </Shell>
  )
}

export function BlogPostPage() {
  const { slug = '' } = useParams()
  const site = useSite()
  const post = site.status === 'ready' ? site.data.posts.find((p) => p.slug === slug) : undefined
  const crumbs = post
    ? [
        { to: '/', label: 'Leapy' },
        { to: '/blog', label: 'Blog' },
        { to: `/blog/${slug}`, label: post.title },
      ]
    : []
  useHead({
    title: post?.title ?? 'Blog',
    description: post?.description ?? 'Blog Leapy',
    path: `/blog/${slug}`,
    type: 'article',
    jsonLd: post
      ? [
          breadcrumbLd(crumbs),
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            inLanguage: 'pl',
            mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
            author: { '@type': 'Organization', name: 'Leapy', url: SITE_URL },
            publisher: { '@type': 'Organization', name: 'Leapy', url: SITE_URL },
          },
        ]
      : [],
  })
  if (site.status !== 'ready') return <Loading />
  if (!post) return <PublicNotFound />
  const more = site.data.posts.filter((p) => p.slug !== slug).slice(0, 2)
  return (
    <Shell>
      <article className="max-w-[72ch]">
        <PageTitle kicker={<Breadcrumbs items={crumbs} />} title={post.title}>
          <p className="mt-3 text-small font-bold text-ink-3">
            {postDate(post.date)} · {post.minutes} min czytania
          </p>
        </PageTitle>
        <p className="mt-6 text-lead text-ink-2">{post.description}</p>
        <Prose html={post.html} className="mt-8" />
      </article>
      <AppCta
        title="Wypróbuj to w Leapy"
        text="Powtórki ułożą się same. Ty wybierasz egzamin i ćwiczysz kilka minut dziennie."
      />
      {more.length > 0 && (
        <section aria-labelledby="more" className="mt-16">
          <h2 id="more" className="text-heading text-ink">
            Czytaj dalej
          </h2>
          <ul className="mt-4 grid gap-5 md:grid-cols-2">
            {more.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </Shell>
  )
}
