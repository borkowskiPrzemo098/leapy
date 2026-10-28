import type { Catalog, SearchDoc, SearchIndex, SubjectPack } from '../../src/content/schema'

/**
 * Plain text of compiled HTML for the search index. KaTeX output carries the formula twice
 * (MathML for screen readers, aria-hidden HTML for display); the display copy is dropped and the
 * TeX source from the annotation is kept, so "log" or "sqrt" still match.
 */
export function plainText(html: string): string {
  const tex = /<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/
  const s = dropElements(
    html.replace(/<math[\s\S]*?<\/math>/g, (m) => ` ${tex.exec(m)?.[1] ?? ''} `),
    'katex-html',
  )
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/ ([.,:;?!])/g, '$1')
    .trim()
}

/** Removes every <span class="…cls…"> with its whole subtree (spans nest, so depth is counted). */
function dropElements(html: string, cls: string): string {
  const open = new RegExp(`<span[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*>`, 'g')
  let out = ''
  let i = 0
  for (let m = open.exec(html); m; m = open.exec(html)) {
    if (m.index < i) continue
    out += html.slice(i, m.index)
    let depth = 1
    const tag = /<(\/?)span\b[^>]*>/g
    tag.lastIndex = m.index + m[0].length
    let end = html.length
    for (let t = tag.exec(html); t; t = tag.exec(html)) {
      depth += t[1] ? -1 : 1
      if (depth === 0) {
        end = t.index + t[0].length
        break
      }
    }
    i = end
    open.lastIndex = end
  }
  return out + html.slice(i)
}

const MAX_TEXT = 600

/** One document per topic: its name, where it sits, and the start of its lesson. */
export function buildSearchIndex(catalog: Catalog, packs: SubjectPack[]): SearchIndex {
  const docs: SearchDoc[] = []
  for (const exam of catalog.exams)
    for (const subject of exam.subjects) {
      const pack = packs.find((p) => p.exam === exam.id && p.subject === subject.id)
      const subjectName = subject.level ? `${subject.name}, poziom ${subject.level}` : subject.name
      for (const section of subject.sections)
        for (const topic of section.topics) {
          if (!topic.hasLesson && topic.tasks === 0) continue
          const lesson = pack?.lessons[topic.id]
          const text = lesson
            ? plainText(
                [...lesson.summary, ...lesson.cheatsheet.map((c) => c.label), lesson.body].join(
                  ' ',
                ),
              )
            : ''
          docs.push({
            id: `${exam.id}/${subject.id}/${topic.id}`,
            title: topic.name,
            where: `${exam.name} · ${subjectName} · ${section.name}`,
            text: text.length > MAX_TEXT ? text.slice(0, text.lastIndexOf(' ', MAX_TEXT)) : text,
          })
        }
    }
  return { version: catalog.version, docs }
}
