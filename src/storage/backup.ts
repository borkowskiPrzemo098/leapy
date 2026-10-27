import { z } from 'zod'
import type { BackupData } from './types'

// Backup file format. Every import is validated before anything touches the database,
// so a broken or foreign file can never corrupt a learner's progress.

export const BACKUP_VERSION = 1

const mode = z.enum(['topic', 'quick', 'review', 'mistakes', 'mock', 'cards'])
const ts = z.number().int().nonnegative()

const Attempt = z.object({
  id: z.number().int().optional(),
  taskId: z.string().min(1),
  exam: z.string().min(1),
  subject: z.string().min(1),
  topic: z.string().min(1),
  ts,
  correct: z.boolean(),
  score: z.number().min(0).max(1),
  ms: z.number().nonnegative(),
  mode,
  sessionId: z.string(),
  hintUsed: z.boolean(),
})

const Summary = z.object({
  total: z.number().int(),
  answered: z.number().int(),
  correct: z.number().int(),
  score: z.number(),
  accuracy: z.number(),
  ms: z.number(),
  wrongTaskIds: z.array(z.string()),
  points: z.number().optional(),
  maxPoints: z.number().optional(),
})

export const Backup = z.object({
  app: z.literal('leapy'),
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.iso.datetime(),
  data: z.object({
    attempts: z.array(Attempt),
    sessions: z.array(
      z.object({
        id: z.string(),
        mode,
        scope: z.string(),
        startedAt: ts,
        finishedAt: ts,
        summary: Summary,
      }),
    ),
    srs: z.array(
      z.object({
        taskId: z.string(),
        due: ts,
        interval: z.number(),
        ease: z.number(),
        reps: z.number().int(),
        lapses: z.number().int(),
      }),
    ),
    bookmarks: z.array(z.object({ taskId: z.string(), ts })),
    kv: z.array(z.object({ key: z.string(), value: z.unknown() })),
  }),
})
export type Backup = z.infer<typeof Backup>

export function makeBackup(data: BackupData, now = new Date()): Backup {
  return { app: 'leapy', version: BACKUP_VERSION, exportedAt: now.toISOString(), data }
}

export type ParseResult = { ok: true; backup: Backup } | { ok: false; error: string }

/** Parses a user-picked file. Errors are written for the learner, not for developers. */
export function parseBackup(text: string): ParseResult {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { ok: false, error: 'To nie jest plik kopii Leapy (nieprawidłowy JSON).' }
  }
  if (typeof json === 'object' && json && 'app' in json && json.app !== 'leapy')
    return { ok: false, error: 'Ten plik nie pochodzi z Leapy.' }
  const r = Backup.safeParse(json)
  if (!r.success) {
    if (typeof json === 'object' && json && 'version' in json && json.version !== BACKUP_VERSION)
      return {
        ok: false,
        error: 'Ta kopia pochodzi z innej wersji Leapy. Zaktualizuj aplikację i spróbuj ponownie.',
      }
    return { ok: false, error: 'Plik kopii jest uszkodzony albo niekompletny.' }
  }
  return { ok: true, backup: r.data }
}

export const backupFileName = (now = new Date()) =>
  `leapy-kopia-${now.toISOString().slice(0, 10)}.json`
