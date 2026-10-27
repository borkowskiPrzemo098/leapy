import 'fake-indexeddb/auto'
import { makeBackup, parseBackup } from './backup'
import { createDexieStore } from './dexie'
import type { Attempt } from './types'

const attempt = (over: Partial<Attempt> = {}): Omit<Attempt, 'id'> => ({
  taskId: 'matura.matematyka-p.logarytmy.001',
  exam: 'matura',
  subject: 'matematyka-p',
  topic: 'logarytmy',
  ts: 1000,
  correct: true,
  score: 1,
  ms: 4000,
  mode: 'topic',
  sessionId: 's1',
  hintUsed: false,
  ...over,
})

let n = 0
const fresh = () => createDexieStore(`leapy-test-${++n}`)

describe('Dexie ProgressStore', () => {
  it('records attempts and aggregates per topic', async () => {
    const s = fresh()
    await s.recordAttempt(attempt())
    await s.recordAttempt(attempt({ ts: 2000, correct: false, score: 0 }))
    await s.recordAttempt(
      attempt({ topic: 'procenty', taskId: 'matura.matematyka-p.procenty.001', ts: 3000 }),
    )
    const stats = await s.topicStats('matura', 'matematyka-p')
    expect(stats.get('matura/matematyka-p/logarytmy')).toMatchObject({
      attempts: 2,
      correct: 1,
      lastTs: 2000,
    })
    expect(
      (await s.attempts({ exam: 'matura', subject: 'matematyka-p', topic: 'procenty' })).length,
    ).toBe(1)
    expect((await s.attempts({ since: 2000 })).map((a) => a.ts)).toEqual([2000, 3000])
  })

  it('toggles bookmarks and stores key-values', async () => {
    const s = fresh()
    expect(await s.toggleBookmark('x')).toBe(true)
    expect((await s.bookmarks()).map((b) => b.taskId)).toEqual(['x'])
    expect(await s.toggleBookmark('x')).toBe(false)
    await s.setKv('study', { exam: 'e8' })
    expect(await s.getKv('study')).toEqual({ exam: 'e8' })
  })

  it('stores spaced-repetition records', async () => {
    const s = fresh()
    expect(await s.getSrs('x')).toBeUndefined()
    const r = { taskId: 'x', due: 5, interval: 1, ease: 2.5, reps: 1, lapses: 0 }
    await s.putSrs(r)
    await s.putSrs({ ...r, taskId: 'y.card.z' })
    await s.putSrs({ ...r, reps: 2 })
    expect(await s.getSrs('x')).toEqual({ ...r, reps: 2 })
    expect((await s.srs()).map((x) => x.taskId).sort()).toEqual(['x', 'y.card.z'])
  })

  it('round-trips a backup through JSON (replace)', async () => {
    const a = fresh()
    await a.recordAttempt(attempt())
    await a.setKv('study', { exam: 'matura', subjects: ['polski-p'] })
    const file = JSON.stringify(makeBackup(await a.exportData()))

    const parsed = parseBackup(file)
    if (!parsed.ok) throw new Error(parsed.error)
    const b = fresh()
    await b.recordAttempt(attempt({ taskId: 'other', ts: 5 }))
    await b.importData(parsed.backup.data, 'replace')
    const got = await b.exportData()
    expect(got.attempts.map((x) => x.taskId)).toEqual(['matura.matematyka-p.logarytmy.001'])
    expect(got.kv).toEqual([{ key: 'study', value: { exam: 'matura', subjects: ['polski-p'] } }])
  })

  it('merge adds only what is missing and never overwrites', async () => {
    const s = fresh()
    await s.recordAttempt(attempt())
    await s.setKv('study', { exam: 'e8' })
    const data = await s.exportData()
    await s.importData(
      {
        ...data,
        attempts: [...data.attempts, { ...attempt({ ts: 9 }) }],
        kv: [{ key: 'study', value: { exam: 'x' } }],
      },
      'merge',
    )
    const got = await s.exportData()
    expect(got.attempts).toHaveLength(2)
    expect(await s.getKv('study')).toEqual({ exam: 'e8' })
  })

  it('clearAll wipes everything', async () => {
    const s = fresh()
    await s.recordAttempt(attempt())
    await s.clearAll()
    expect((await s.exportData()).attempts).toEqual([])
  })
})

describe('parseBackup', () => {
  it('rejects non-JSON, foreign files and broken data with readable messages', () => {
    expect(parseBackup('nope')).toMatchObject({ ok: false, error: expect.stringMatching(/JSON/) })
    expect(parseBackup('{"app":"other"}')).toMatchObject({
      ok: false,
      error: expect.stringMatching(/nie pochodzi/),
    })
    expect(parseBackup('{"app":"leapy","version":99}')).toMatchObject({
      ok: false,
      error: expect.stringMatching(/innej wersji/),
    })
    const broken = makeBackup({ attempts: [], sessions: [], srs: [], bookmarks: [], kv: [] })
    expect(parseBackup(JSON.stringify({ ...broken, data: { attempts: [{ taskId: 1 }] } })).ok).toBe(
      false,
    )
  })
})
