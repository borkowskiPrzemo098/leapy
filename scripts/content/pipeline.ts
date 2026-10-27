// Content pipeline: load → validate (Zod) → cross-check → verify → dedupe → ID stability →
// compile. Used by check.ts (report only) and build.ts (report + write public/data).
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { parse as parseYaml } from 'yaml'
import {
  DATA_VERSION,
  ExamFile,
  LessonMeta,
  SubjectFile,
  TaskFile,
  type Catalog,
  type CatalogExam,
  type CompiledCard,
  type CompiledLesson,
  type CompiledTask,
  type SubjectPack,
  type Task,
} from '../../src/content/schema'
import { mdBlock, mdInline } from './markdown'
import { verifyTask } from './verify'

export interface Issue {
  level: 'error' | 'warning'
  file: string
  message: string
}

export interface PipelineResult {
  issues: Issue[]
  catalog: Catalog
  packs: SubjectPack[]
  tasks: Task[]
  lessons: Map<string, LessonMeta>
  verified: number
  ids: string[]
}

const readJson = (f: string): unknown => JSON.parse(readFileSync(f, 'utf8'))
const ls = (dir: string, ext: string) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith(ext))
        .sort()
    : []

function splitFrontmatter(src: string): { meta: unknown; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(src)
  if (!m) throw new Error('brak frontmattera YAML (--- ... ---)')
  return { meta: parseYaml(m[1] ?? ''), body: (m[2] ?? '').trim() }
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/\$[^$]*\$/g, (x) => x.replace(/\s+/g, ''))
    .replace(/[^\p{L}\p{N}$\\^{}+\-*/=]+/gu, ' ')
    .trim()

function shingles(s: string) {
  const w = normalize(s).split(' ')
  const out = new Set<string>()
  for (let i = 0; i + 2 < w.length; i++) out.add(w.slice(i, i + 3).join(' '))
  return out
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  return inter / (a.size + b.size - inter)
}

const PL: Record<string, string> = {
  ą: 'a',
  ć: 'c',
  ę: 'e',
  ł: 'l',
  ń: 'n',
  ó: 'o',
  ś: 's',
  ź: 'z',
  ż: 'z',
}

/** "Logarytm iloczynu" → "logarytm-iloczynu". Math is dropped, Polish letters folded. */
export function cardSlug(front: string) {
  const s = front
    .toLowerCase()
    .replace(/\$[^$]*\$/g, ' ')
    .replace(/[ąćęłńóśźż]/g, (c) => PL[c] ?? c)
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/, '')
  return s || 'karta'
}

function compileTask(t: Task): CompiledTask {
  const common = {
    prompt: mdBlock(t.prompt),
    explanation: mdBlock(t.explanation),
    ...(t.hint ? { hint: mdBlock(t.hint) } : {}),
  }
  const { verify: _v, prompt: _p, explanation: _e, hint: _h, ...rest } = t
  switch (rest.type) {
    case 'match':
      return {
        ...rest,
        ...common,
        options: { left: rest.options.left.map(mdInline), right: rest.options.right.map(mdInline) },
      }
    case 'numeric':
    case 'short':
      return { ...rest, ...common }
    default:
      return { ...rest, ...common, options: rest.options.map(mdInline) } as CompiledTask
  }
}

export function runPipeline(
  root: string,
  opts: { lockFile?: string; renamesFile?: string } = {},
): PipelineResult {
  const issues: Issue[] = []
  const rel = (f: string) => relative(root, f).replaceAll('\\', '/')
  const err = (file: string, message: string) =>
    issues.push({ level: 'error', file: rel(file), message })
  const warn = (file: string, message: string) =>
    issues.push({ level: 'warning', file: rel(file), message })

  const contentDir = join(root, 'content')
  const exams: CatalogExam[] = []
  const packs: SubjectPack[] = []
  const allTasks: Task[] = []
  const lessonsByKey = new Map<string, LessonMeta>()
  const seenIds = new Map<string, string>()
  let verified = 0

  for (const examFileName of ls(join(contentDir, 'exams'), '.json')) {
    const examPath = join(contentDir, 'exams', examFileName)
    const parsed = ExamFile.safeParse(readJson(examPath))
    if (!parsed.success) {
      for (const i of parsed.error.issues) err(examPath, `${i.path.join('.')}: ${i.message}`)
      continue
    }
    const exam = parsed.data
    if (basename(examFileName, '.json') !== exam.id) err(examPath, 'nazwa pliku musi być równa id')
    const catalogExam: CatalogExam = { ...exam, subjects: [] }

    for (const subjectId of exam.subjects) {
      const dir = join(contentDir, exam.id, subjectId)
      const subjectPath = join(dir, 'subject.json')
      if (!existsSync(subjectPath)) {
        err(examPath, `brak ${rel(subjectPath)}`)
        continue
      }
      const sp = SubjectFile.safeParse(readJson(subjectPath))
      if (!sp.success) {
        for (const i of sp.error.issues) err(subjectPath, `${i.path.join('.')}: ${i.message}`)
        continue
      }
      const subject = sp.data
      if (subject.id !== subjectId || subject.exam !== exam.id)
        err(subjectPath, 'id/exam niezgodne ze ścieżką')

      const topicIds = new Set<string>()
      for (const sec of subject.sections)
        for (const tp of sec.topics) {
          if (topicIds.has(tp.id)) err(subjectPath, `temat "${tp.id}" występuje dwa razy`)
          topicIds.add(tp.id)
        }

      // Lessons, and the flashcards made from their cheatsheets and cards
      const lessons: Record<string, CompiledLesson> = {}
      const cards: CompiledCard[] = []
      for (const f of ls(join(dir, 'lessons'), '.md')) {
        const path = join(dir, 'lessons', f)
        const topic = basename(f, '.md')
        if (!topicIds.has(topic)) {
          err(path, `lekcja dla nieistniejącego tematu "${topic}"`)
          continue
        }
        try {
          const { meta, body } = splitFrontmatter(readFileSync(path, 'utf8'))
          const lm = LessonMeta.safeParse(meta)
          if (!lm.success) {
            for (const i of lm.error.issues) err(path, `${i.path.join('.')}: ${i.message}`)
            continue
          }
          if (body.length < 200) warn(path, 'notatka krótsza niż 200 znaków')
          lessonsByKey.set(`${exam.id}/${subject.id}/${topic}`, lm.data)
          const { cards: extraCards, ...lessonMeta } = lm.data
          const seenCards = new Set<string>()
          for (const c of [
            ...lm.data.cheatsheet.map((x) => ({ front: x.label, back: x.formula })),
            ...extraCards,
          ]) {
            const id = `${exam.id}.${subject.id}.${topic}.card.${cardSlug(c.front)}`
            if (seenCards.has(id)) err(path, `fiszka „${c.front}” się powtarza (id ${id})`)
            seenCards.add(id)
            cards.push({
              id,
              exam: exam.id,
              subject: subject.id,
              topic,
              front: mdInline(c.front),
              back: mdInline(c.back),
            })
          }
          lessons[topic] = {
            ...lessonMeta,
            topic,
            summary: lm.data.summary.map(mdInline),
            mistakes: lm.data.mistakes.map(mdInline),
            cheatsheet: lm.data.cheatsheet.map((c) => ({
              label: mdInline(c.label),
              formula: mdInline(c.formula),
            })),
            body: mdBlock(body),
          }
        } catch (e) {
          err(path, (e as Error).message)
        }
      }

      // Tasks
      const tasks: Task[] = []
      for (const f of ls(join(dir, 'tasks'), '.json')) {
        const path = join(dir, 'tasks', f)
        const topic = basename(f, '.json')
        if (!topicIds.has(topic)) err(path, `zadania dla nieistniejącego tematu "${topic}"`)
        const tp = TaskFile.safeParse(readJson(path))
        if (!tp.success) {
          for (const i of tp.error.issues) err(path, `[${i.path.join('.')}] ${i.message}`)
          continue
        }
        for (const t of tp.data) {
          if (t.exam !== exam.id || t.subject !== subject.id || t.topic !== topic)
            err(path, `${t.id}: exam/subject/topic niezgodne ze ścieżką pliku`)
          const prev = seenIds.get(t.id)
          if (prev) err(path, `${t.id}: zduplikowane id (też w ${prev})`)
          seenIds.set(t.id, rel(path))
          for (const p of verifyTask(t)) err(path, `${t.id}: ${p}`)
          if (t.verify) verified++
          try {
            compileTask(t)
          } catch (e) {
            err(path, `${t.id}: ${(e as Error).message}`)
          }
          tasks.push(t)
        }
      }

      const counts = new Map<string, number>()
      for (const t of tasks) counts.set(t.topic, (counts.get(t.topic) ?? 0) + 1)
      for (const topic of topicIds) {
        const lessonPath = join(dir, 'lessons', `${topic}.md`)
        if ((counts.get(topic) ?? 0) > 0 && !lessons[topic])
          err(lessonPath, 'temat ma zadania, ale nie ma lekcji')
      }

      catalogExam.subjects.push({
        id: subject.id,
        name: subject.name,
        ...(subject.level ? { level: subject.level } : {}),
        tasks: tasks.length,
        cards: cards.length,
        ...(subject.mock ? { mock: subject.mock } : {}),
        sections: subject.sections.map((s) => ({
          id: s.id,
          name: s.name,
          topics: s.topics.map((tp) => ({
            id: tp.id,
            name: tp.name,
            tasks: counts.get(tp.id) ?? 0,
            hasLesson: !!lessons[tp.id],
          })),
        })),
      })
      let compiled: CompiledTask[] = []
      try {
        compiled = tasks.map(compileTask)
      } catch {
        /* reported per task above */
      }
      packs.push({
        version: DATA_VERSION,
        exam: exam.id,
        subject: subject.id,
        lessons,
        tasks: compiled,
        cards,
      })
      allTasks.push(...tasks)
    }
    exams.push(catalogExam)
  }
  exams.sort((a, b) => a.order - b.order)

  // Duplicates: identical prompts are errors, near-identical (3-gram Jaccard ≥ 0.85) warnings.
  const byNorm = new Map<string, string>()
  const sh = allTasks.map((t) => shingles(t.prompt))
  allTasks.forEach((t, i) => {
    const key = normalize(t.prompt) + '|' + JSON.stringify('options' in t ? t.options : '')
    const prev = byNorm.get(key)
    if (prev) err(seenIds.get(t.id) ?? '', `${t.id}: identyczna treść jak ${prev}`)
    else byNorm.set(key, t.id)
    for (let j = 0; j < i; j++) {
      const a = sh[i]
      const b = sh[j]
      const other = allTasks[j]
      if (a && b && other && other.topic === t.topic && jaccard(a, b) >= 0.85 && key !== '')
        warn(seenIds.get(t.id) ?? '', `${t.id}: bardzo podobne do ${other.id}`)
    }
  })

  // ID stability: ids that existed before must still exist or be listed in renames.json.
  const ids = [...seenIds.keys()].sort()
  if (opts.lockFile && existsSync(opts.lockFile)) {
    const locked = readJson(opts.lockFile) as string[]
    const renames =
      opts.renamesFile && existsSync(opts.renamesFile)
        ? (readJson(opts.renamesFile) as Record<string, string | null>)
        : {}
    const now = new Set(ids)
    for (const id of locked)
      if (!now.has(id) && !(id in renames))
        err(
          rel(opts.lockFile),
          `zadanie ${id} zniknęło. Postępy uczniów zależą od id: przywróć je albo wpisz do content/renames.json`,
        )
  }

  return {
    issues,
    catalog: { version: DATA_VERSION, exams },
    packs,
    tasks: allTasks,
    lessons: lessonsByKey,
    verified,
    ids,
  }
}

// ---------- Coverage report (Markdown) ----------

export function coverageReport(r: PipelineResult, target = { tasks: 25 }): string {
  const lines: string[] = [
    '# Raport pokrycia treści',
    '',
    `Wygenerowano: ${new Date().toISOString().slice(0, 10)} (\`npm run content:build\`).`,
    '',
  ]
  const total = r.tasks.length
  const reviewed = r.tasks.filter((t) => t.reviewed).length
  const types = new Map<string, number>()
  for (const t of r.tasks) types.set(t.type, (types.get(t.type) ?? 0) + 1)
  lines.push(
    `- Zadania: **${total}** (zweryfikowane przez człowieka: ${reviewed}, czekają: ${total - reviewed})`,
    `- Sprawdzone automatycznie (\`verify\`): ${r.verified}`,
    `- Typy: ${[...types].map(([k, v]) => `${k} ${v}`).join(', ') || 'brak'}`,
    `- Błędy: ${r.issues.filter((i) => i.level === 'error').length}, ostrzeżenia: ${r.issues.filter((i) => i.level === 'warning').length}`,
    '',
    `Cel Fazy 1: co najmniej ${target.tasks} zadań na dział i lekcja dla każdego tematu.`,
    '',
  )
  for (const exam of r.catalog.exams) {
    lines.push(`## ${exam.name}`, '')
    for (const s of exam.subjects) {
      lines.push(
        `### ${s.name}${s.level ? ` (${s.level})` : ''}: ${s.tasks} zadań`,
        '',
        '| Dział | Temat | Zadania | Lekcja |',
        '| --- | --- | ---: | :---: |',
      )
      for (const sec of s.sections) {
        const secTasks = sec.topics.reduce((n, t) => n + t.tasks, 0)
        sec.topics.forEach((t, i) => {
          const secCell =
            i === 0 ? `${sec.name} (${secTasks}${secTasks < target.tasks ? ' ⚠' : ''})` : ''
          lines.push(`| ${secCell} | ${t.name} | ${t.tasks} | ${t.hasLesson ? 'tak' : '—'} |`)
        })
      }
      lines.push('')
    }
  }
  const unreviewed = r.tasks.filter((t) => !t.reviewed)
  if (unreviewed.length) {
    lines.push(
      '## Do weryfikacji przez człowieka',
      '',
      'Najpierw zadania bez automatycznej weryfikacji i o wyższej trudności.',
      '',
    )
    const risk = (t: Task) => (t.verify ? 0 : 10) + t.difficulty + (t.type === 'short' ? 3 : 0)
    for (const t of [...unreviewed].sort((a, b) => risk(b) - risk(a)).slice(0, 200))
      lines.push(
        `- \`${t.id}\` (${t.type}, trudność ${t.difficulty}${t.verify ? ', verify ✓' : ''})`,
      )
    lines.push('')
  }
  const warnings = r.issues.filter((i) => i.level === 'warning')
  if (warnings.length) {
    lines.push('## Ostrzeżenia', '')
    for (const w of warnings) lines.push(`- ${w.file}: ${w.message}`)
    lines.push('')
  }
  return lines.join('\n')
}
