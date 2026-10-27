import type { SessionMode, SessionSummary } from '@/engine/session'

// Storage contract. The app talks only to ProgressStore; today it is IndexedDB (Dexie)
// on the device, later a cloud-synced implementation can sit behind the same interface.

export interface Attempt {
  id?: number | undefined
  taskId: string
  exam: string
  subject: string
  topic: string
  /** epoch ms */
  ts: number
  correct: boolean
  score: number
  ms: number
  mode: SessionMode
  sessionId: string
  hintUsed: boolean
}

export interface SessionRecord {
  id: string
  mode: SessionMode
  scope: string
  startedAt: number
  finishedAt: number
  summary: SessionSummary
}

/** Spaced-repetition state per task (filled in E3). */
export interface SrsRecord {
  taskId: string
  due: number
  interval: number
  ease: number
  reps: number
  lapses: number
}

export interface Bookmark {
  taskId: string
  ts: number
}

export interface KvRecord {
  key: string
  value: unknown
}

export interface BackupData {
  attempts: Attempt[]
  sessions: SessionRecord[]
  srs: SrsRecord[]
  bookmarks: Bookmark[]
  kv: KvRecord[]
}

export interface TopicStats {
  topicKey: string
  attempts: number
  correct: number
  lastTs: number
}

export interface ProgressStore {
  recordAttempt(a: Omit<Attempt, 'id'>): Promise<void>
  attempts(filter?: {
    exam?: string
    subject?: string
    topic?: string
    since?: number
  }): Promise<Attempt[]>
  /** Aggregates per "exam/subject/topic" */
  topicStats(exam: string, subject: string): Promise<Map<string, TopicStats>>
  saveSession(s: SessionRecord): Promise<void>
  sessions(limit?: number): Promise<SessionRecord[]>
  toggleBookmark(taskId: string): Promise<boolean>
  bookmarks(): Promise<Bookmark[]>
  getKv<T>(key: string): Promise<T | undefined>
  setKv(key: string, value: unknown): Promise<void>
  deleteKv(key: string): Promise<void>
  exportData(): Promise<BackupData>
  /** replace: wipe then load. merge: add records that are not there yet. */
  importData(data: BackupData, mode: 'replace' | 'merge'): Promise<void>
  clearAll(): Promise<void>
}
