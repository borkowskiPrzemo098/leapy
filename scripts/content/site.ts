// Blog posts, static pages (privacy, terms, about) and FAQ → public/data/site.json.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { parse as parseYaml } from 'yaml'
import {
  BlogMeta,
  DATA_VERSION,
  FaqFile,
  PageMeta,
  SLUG,
  type SiteData,
} from '../../src/content/schema'
import { mdBlock } from './markdown'
import { splitFrontmatter, type Issue } from './pipeline'

const mdFiles = (dir: string) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.md'))
        .sort()
    : []

/** ~200 words per minute of reading */
const minutes = (md: string) => Math.max(1, Math.ceil(md.split(/\s+/).filter(Boolean).length / 200))

export function compileSite(root: string): { site: SiteData; issues: Issue[] } {
  const issues: Issue[] = []
  const rel = (p: string) => relative(root, p).replaceAll('\\', '/')
  const err = (file: string, message: string) =>
    issues.push({ level: 'error', file: rel(file), message })
  const site: SiteData = { version: DATA_VERSION, posts: [], pages: {}, faq: [] }

  const blogDir = join(root, 'content/blog')
  for (const f of mdFiles(blogDir)) {
    const path = join(blogDir, f)
    const slug = basename(f, '.md')
    if (!SLUG.test(slug)) err(path, 'nazwa pliku: małe litery, cyfry i myślniki')
    try {
      const { meta, body } = splitFrontmatter(readFileSync(path, 'utf8'))
      const m = BlogMeta.safeParse(meta)
      if (!m.success) {
        for (const i of m.error.issues) err(path, `${i.path.join('.')}: ${i.message}`)
        continue
      }
      if (body.length < 1500) err(path, 'wpis krótszy niż 1500 znaków')
      site.posts.push({ ...m.data, slug, html: mdBlock(body), minutes: minutes(body) })
    } catch (e) {
      err(path, (e as Error).message)
    }
  }
  site.posts.sort((a, b) => b.date.localeCompare(a.date))

  const pagesDir = join(root, 'content/pages')
  for (const f of mdFiles(pagesDir)) {
    const path = join(pagesDir, f)
    const slug = basename(f, '.md')
    try {
      const { meta, body } = splitFrontmatter(readFileSync(path, 'utf8'))
      const m = PageMeta.safeParse(meta)
      if (!m.success) {
        for (const i of m.error.issues) err(path, `${i.path.join('.')}: ${i.message}`)
        continue
      }
      site.pages[slug] = { ...m.data, slug, html: mdBlock(body) }
    } catch (e) {
      err(path, (e as Error).message)
    }
  }

  const faqPath = join(root, 'content/faq.yaml')
  if (existsSync(faqPath)) {
    const r = FaqFile.safeParse(parseYaml(readFileSync(faqPath, 'utf8')))
    if (!r.success)
      for (const i of r.error.issues) err(faqPath, `${i.path.join('.')}: ${i.message}`)
    else site.faq = r.data.map((x) => ({ q: x.q, a: mdBlock(x.a) }))
  }
  for (const required of ['prywatnosc', 'regulamin'])
    if (!site.pages[required]) err(join(pagesDir, `${required}.md`), 'brak wymaganej strony')
  return { site, issues }
}
