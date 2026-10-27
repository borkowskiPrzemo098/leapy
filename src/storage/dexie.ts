import Dexie, { type EntityTable } from 'dexie'
import type {
  Attempt,
  BackupData,
  Bookmark,
  KvRecord,
  ProgressStore,
  SessionRecord,
  SrsRecord,
  TopicStats,
} from './types'

// IndexedDB schema. Bump the version and add an .upgrade() for every change;
// never edit an existing version, learners' data depends on it.
class LeapyDB extends Dexie {
  attempts!: EntityTable<Attempt, 'id'>
  sessions!: EntityTable<SessionRecord, 'id'>
  srs!: EntityTable<SrsRecord, 'taskId'>
  bookmarks!: EntityTable<Bookmark, 'taskId'>
  kv!: EntityTable<KvRecord, 'key'>

  constructor(name: string) {
    super(name)
    this.version(1).stores({
      attempts: '++id, taskId, ts, [exam+subject], [exam+subject+topic], sessionId',
      sessions: 'id, startedAt, mode',
      srs: 'taskId, due',
      bookmarks: 'taskId, ts',
      kv: 'key',
    })
  }
}

interface Table<T> {
  toArray(): Promise<T[]>
  bulkAdd(rows: readonly T[]): Promise<unknown>
}

async function addMissing<T>(table: Table<T>, rows: T[], key: (r: T) => string) {
  const have = new Set((await table.toArray()).map(key))
  await table.bulkAdd(rows.filter((r) => !have.has(key(r))))
}

export function createDexieStore(name = 'leapy'): ProgressStore & { db: LeapyDB } {
  const db = new LeapyDB(name)
  const tables = [db.attempts, db.sessions, db.srs, db.bookmarks, db.kv]

  return {
    db,
    async recordAttempt(a) {
      await db.attempts.add(a as Attempt)
    },

    async attempts(f = {}) {
      let c =
        f.exam && f.subject && f.topic
          ? db.attempts.where('[exam+subject+topic]').equals([f.exam, f.subject, f.topic])
          : f.exam && f.subject
            ? db.attempts.where('[exam+subject]').equals([f.exam, f.subject])
            : db.attempts.toCollection()
      if (f.since !== undefined) {
        const since = f.since
        c = c.filter((a) => a.ts >= since)
      }
      return (await c.toArray()).sort((x, y) => x.ts - y.ts)
    },

    async topicStats(exam, subject) {
      const out = new Map<string, TopicStats>()
      await db.attempts
        .where('[exam+subject]')
        .equals([exam, subject])
        .each((a) => {
          const key = `${a.exam}/${a.subject}/${a.topic}`
          const s = out.get(key) ?? { topicKey: key, attempts: 0, correct: 0, lastTs: 0 }
          s.attempts++
          if (a.correct) s.correct++
          s.lastTs = Math.max(s.lastTs, a.ts)
          out.set(key, s)
        })
      return out
    },

    async saveSession(s) {
      await db.sessions.put(s)
    },

    async sessions(limit = 50) {
      return db.sessions.orderBy('startedAt').reverse().limit(limit).toArray()
    },

    async toggleBookmark(taskId) {
      return db.transaction('rw', db.bookmarks, async () => {
        if (await db.bookmarks.get(taskId)) {
          await db.bookmarks.delete(taskId)
          return false
        }
        await db.bookmarks.put({ taskId, ts: Date.now() })
        return true
      })
    },

    async bookmarks() {
      return db.bookmarks.orderBy('ts').reverse().toArray()
    },

    async getKv<T>(key: string) {
      return (await db.kv.get(key))?.value as T | undefined
    },

    async setKv(key, value) {
      await db.kv.put({ key, value })
    },

    async deleteKv(key) {
      await db.kv.delete(key)
    },

    async exportData(): Promise<BackupData> {
      const [attempts, sessions, srs, bookmarks, kv] = await Promise.all([
        db.attempts.toArray(),
        db.sessions.toArray(),
        db.srs.toArray(),
        db.bookmarks.toArray(),
        db.kv.toArray(),
      ])
      return { attempts, sessions, srs, bookmarks, kv }
    },

    async importData(data, mode) {
      await db.transaction('rw', tables, async () => {
        if (mode === 'replace') await Promise.all(tables.map((t) => t.clear()))
        // Attempts get new auto ids; a merge skips ones already present (same task + time + session).
        const existing =
          mode === 'merge'
            ? new Set(
                (await db.attempts.toArray()).map((a) => `${a.taskId}|${a.ts}|${a.sessionId}`),
              )
            : new Set<string>()
        const fresh = data.attempts
          .filter((a) => !existing.has(`${a.taskId}|${a.ts}|${a.sessionId}`))
          .map(({ id: _id, ...a }) => a as Attempt)
        await db.attempts.bulkAdd(fresh)
        if (mode === 'replace') {
          await db.sessions.bulkPut(data.sessions)
          await db.srs.bulkPut(data.srs)
          await db.bookmarks.bulkPut(data.bookmarks)
          await db.kv.bulkPut(data.kv)
        } else {
          // Merge never overwrites what is on this device.
          await addMissing<SessionRecord>(db.sessions, data.sessions, (r) => r.id)
          await addMissing<SrsRecord>(db.srs, data.srs, (r) => r.taskId)
          await addMissing<Bookmark>(db.bookmarks, data.bookmarks, (r) => r.taskId)
          await addMissing<KvRecord>(db.kv, data.kv, (r) => r.key)
        }
      })
    },

    async clearAll() {
      await db.transaction('rw', tables, () => Promise.all(tables.map((t) => t.clear())))
    },
  }
}
