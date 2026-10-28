import { z } from 'zod'
export { DATA_VERSION } from './version'

// Leapy content model. Authored files in content/ are validated against these schemas by
// scripts/content (build fails on any error); the app reads the compiled output, whose
// shapes are at the bottom of this file. Hierarchy: Exam → Subject → Section → Topic → Lesson + Tasks.

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const TASK_ID = /^([a-z0-9-]+)\.([a-z0-9-]+)\.([a-z0-9-]+)\.(\d{3})$/

const slug = z.string().regex(SLUG, 'małe litery, cyfry i myślniki')
const md = z.string().trim().min(1)

// ---------- Exam and subject structure ----------

export const ExamFile = z.strictObject({
  id: slug,
  name: z.string().min(2),
  short: z.string().min(1).max(3),
  audience: z.string().min(2),
  order: z.number().int(),
  phase: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  /** Subject ids in display order; each must have content/<exam>/<subject>/subject.json */
  subjects: z.array(slug).min(1),
  officialUrl: z.url().optional(),
  /** Shown on exam pages, e.g. "Nie jest to oficjalna baza pytań." */
  disclaimer: z.string().optional(),
})
export type ExamFile = z.infer<typeof ExamFile>

export const SubjectFile = z.strictObject({
  id: slug,
  exam: slug,
  name: z.string().min(2),
  level: z.string().optional(),
  /** Practice mock exam: how many tasks and minutes (default: derived from the task pool) */
  mock: z
    .strictObject({
      tasks: z.number().int().min(5).max(60),
      minutes: z.number().int().min(10).max(240),
    })
    .optional(),
  sections: z
    .array(
      z.strictObject({
        id: slug,
        name: z.string().min(2),
        topics: z.array(z.strictObject({ id: slug, name: z.string().min(2) })).min(1),
      }),
    )
    .min(1),
})
export type SubjectFile = z.infer<typeof SubjectFile>

// ---------- Lessons (Markdown with YAML frontmatter) ----------

export const LessonMeta = z.strictObject({
  title: z.string().min(2),
  /** "Najważniejsze w 30 sekund": 2–5 short points */
  summary: z.array(md).min(2).max(5),
  mistakes: z.array(md).min(1).max(6),
  cheatsheet: z
    .array(z.strictObject({ label: md, formula: md }))
    .max(12)
    .default([]),
  /** Extra flashcards beyond the cheatsheet (definitions, dates, vocabulary) */
  cards: z
    .array(z.strictObject({ front: md, back: md }))
    .max(40)
    .default([]),
  reviewed: z.boolean(),
  updatedAt: z.iso.date(),
})
export type LessonMeta = z.infer<typeof LessonMeta>

// ---------- Tasks ----------

const base = {
  id: z.string().regex(TASK_ID, 'egzamin.przedmiot.temat.NNN'),
  exam: slug,
  subject: slug,
  topic: slug,
  difficulty: z.number().int().min(1).max(5),
  /** Markdown + KaTeX ($...$ inline, $$...$$ display) */
  prompt: md,
  /** Step-by-step explanation, Markdown + KaTeX */
  explanation: md,
  hint: md.optional(),
  tags: z.array(slug).default([]),
  source: z.literal('original'),
  /** false until a human has checked the task */
  reviewed: z.boolean(),
  updatedAt: z.iso.date(),
  /** Points in a mock exam */
  points: z.number().int().min(1).max(6).default(1),
  /**
   * Machine check: a math expression whose value must equal the answer
   * (numeric: answer.value; single: the correct option, and no other option may equal it).
   */
  verify: z.string().min(1).optional(),
}

const fraction = z.string().regex(/^-?\d+(?:[.,]\d+)?(?:\/\d+)?$/, 'liczba lub ułamek a/b')

export const SingleTask = z.strictObject({
  ...base,
  type: z.literal('single'),
  options: z.array(md).min(2).max(6),
  answer: z.number().int().min(0),
})
export const MultiTask = z.strictObject({
  ...base,
  type: z.literal('multi'),
  options: z.array(md).min(3).max(8),
  answer: z.array(z.number().int().min(0)).min(1),
})
export const TrueFalseTask = z.strictObject({
  ...base,
  type: z.literal('truefalse'),
  /** Statements to judge, each true or false */
  options: z.array(md).min(1).max(4),
  answer: z.array(z.boolean()).min(1).max(4),
})
export const NumericTask = z.strictObject({
  ...base,
  type: z.literal('numeric'),
  answer: z.strictObject({
    value: z.union([z.number(), fraction]),
    /** Absolute tolerance; default exact (1e-9) */
    tolerance: z.number().min(0).optional(),
    unit: z.string().optional(),
  }),
})
export const OrderingTask = z.strictObject({
  ...base,
  type: z.literal('ordering'),
  options: z.array(md).min(3).max(7),
  /** Option indices in the correct order */
  answer: z.array(z.number().int().min(0)),
})
export const MatchTask = z.strictObject({
  ...base,
  type: z.literal('match'),
  options: z.strictObject({ left: z.array(md).min(2).max(6), right: z.array(md).min(2).max(8) }),
  /** answer[i] = index in `right` matching left[i] */
  answer: z.array(z.number().int().min(0)),
})
export const ShortTask = z.strictObject({
  ...base,
  type: z.literal('short'),
  /** Accepted answers; compared after normalisation (case, spaces, punctuation at ends) */
  answer: z.array(z.string().trim().min(1)).min(1),
  caseSensitive: z.boolean().optional(),
})

const isPermutation = (a: number[], n: number) =>
  a.length === n && new Set(a).size === n && a.every((i) => i >= 0 && i < n)

export const Task = z
  .discriminatedUnion('type', [
    SingleTask,
    MultiTask,
    TrueFalseTask,
    NumericTask,
    OrderingTask,
    MatchTask,
    ShortTask,
  ])
  .superRefine((t, ctx) => {
    const issue = (message: string, path: (string | number)[] = ['answer']) =>
      ctx.addIssue({ code: 'custom', message, path })
    const m = TASK_ID.exec(t.id)
    if (m && (m[1] !== t.exam || m[2] !== t.subject || m[3] !== t.topic))
      issue('id musi zaczynać się od exam.subject.topic', ['id'])
    switch (t.type) {
      case 'single':
        if (t.answer >= t.options.length) issue('indeks odpowiedzi poza listą opcji')
        if (new Set(t.options).size !== t.options.length) issue('powtórzone opcje', ['options'])
        break
      case 'multi':
        if (t.answer.some((i) => i >= t.options.length)) issue('indeks odpowiedzi poza listą')
        if (new Set(t.answer).size !== t.answer.length) issue('powtórzone indeksy')
        if (t.answer.length === t.options.length) issue('nie wszystkie opcje mogą być poprawne')
        break
      case 'truefalse':
        if (t.answer.length !== t.options.length) issue('answer musi mieć tyle wartości co options')
        break
      case 'ordering':
        if (!isPermutation(t.answer, t.options.length)) issue('answer musi być permutacją opcji')
        break
      case 'match':
        if (t.answer.length !== t.options.left.length)
          issue('jedna odpowiedź na każdy element left')
        if (t.answer.some((i) => i >= t.options.right.length)) issue('indeks poza listą right')
        if (new Set(t.answer).size !== t.answer.length) issue('każdy element right użyty raz')
        break
      default:
        break
    }
  })
export type Task = z.infer<typeof Task>
export type TaskType = Task['type']
export const TaskFile = z.array(Task)

// ---------- Compiled output (public/data, read by the app) ----------

export interface CatalogTopic {
  id: string
  name: string
  tasks: number
  hasLesson: boolean
}
export interface CatalogSection {
  id: string
  name: string
  topics: CatalogTopic[]
}
export interface CatalogSubject {
  id: string
  name: string
  level?: string
  tasks: number
  /** Flashcards in the subject (cheatsheet entries + lesson cards) */
  cards: number
  mock?: { tasks: number; minutes: number }
  sections: CatalogSection[]
}
export interface CatalogExam extends Omit<ExamFile, 'subjects'> {
  subjects: CatalogSubject[]
}
export interface Catalog {
  version: number
  exams: CatalogExam[]
}

/** Markdown fields are compiled to HTML (KaTeX pre-rendered) so the app ships no parser. */
export type Html = string

export interface CompiledLesson extends Omit<
  LessonMeta,
  'summary' | 'mistakes' | 'cheatsheet' | 'cards'
> {
  topic: string
  summary: Html[]
  mistakes: Html[]
  cheatsheet: { label: Html; formula: Html }[]
  body: Html
}

type Compiled<T, Extra> = Omit<T, 'prompt' | 'explanation' | 'hint' | 'options' | 'verify'> & {
  prompt: Html
  explanation: Html
  hint?: Html
} & Extra

export type CompiledTask =
  | Compiled<z.infer<typeof SingleTask>, { options: Html[] }>
  | Compiled<z.infer<typeof MultiTask>, { options: Html[] }>
  | Compiled<z.infer<typeof TrueFalseTask>, { options: Html[] }>
  | Compiled<z.infer<typeof NumericTask>, object>
  | Compiled<z.infer<typeof OrderingTask>, { options: Html[] }>
  | Compiled<z.infer<typeof MatchTask>, { options: { left: Html[]; right: Html[] } }>
  | Compiled<z.infer<typeof ShortTask>, object>

/** A flashcard. id: <exam>.<subject>.<topic>.card.<slug of the front>, stable like task ids. */
export interface CompiledCard {
  id: string
  exam: string
  subject: string
  topic: string
  front: Html
  back: Html
}

export interface SubjectPack {
  version: number
  exam: string
  subject: string
  lessons: Record<string, CompiledLesson>
  tasks: CompiledTask[]
  cards: CompiledCard[]
}

/** Search: one document per topic (data/search.json, built with the content). */
export interface SearchDoc {
  /** exam/subject/topic */
  id: string
  title: string
  /** "Matura · Matematyka, poziom podstawowy · Liczby rzeczywiste" */
  where: string
  /** Plain-text start of the lesson */
  text: string
}
export interface SearchIndex {
  version: number
  docs: SearchDoc[]
}

/** One topic's lesson without the rest of the pack: the topic screen opens from this. */
export interface TopicFile {
  version: number
  lesson: CompiledLesson | null
  taskCount: number
}

// ---------- Site content: blog, static pages, FAQ (public pages) ----------

export const BlogMeta = z.strictObject({
  title: z.string().min(10).max(90),
  /** Meta description and listing lead, 70–170 characters */
  description: z.string().min(70).max(170),
  date: z.iso.date(),
  tags: z.array(slug).default([]),
  /** Exam the post is mainly about, for links */
  exam: slug.optional(),
  reviewed: z.boolean(),
})
export type BlogMeta = z.infer<typeof BlogMeta>

export const PageMeta = z.strictObject({
  title: z.string().min(3),
  description: z.string().min(50).max(170),
  updatedAt: z.iso.date(),
})

export const FaqFile = z.array(z.strictObject({ q: z.string().min(8), a: md })).min(3)

export interface CompiledPost extends BlogMeta {
  slug: string
  html: Html
  /** Minutes to read, rounded up */
  minutes: number
}

export interface SiteData {
  version: number
  posts: CompiledPost[]
  pages: Record<string, z.infer<typeof PageMeta> & { slug: string; html: Html }>
  faq: { q: string; a: Html }[]
}
