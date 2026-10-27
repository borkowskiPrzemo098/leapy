// Appends authored tasks to topic files with the next free ids:
//   node scripts/content/append-tasks.mjs <exam>/<subject> <additions.json>
// additions.json: { "<topic>": [task without id, ...], ... }. Existing tasks and ids stay untouched.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [scope, file] = process.argv.slice(2)
if (!scope || !file) throw new Error('użycie: append-tasks.mjs <egzamin>/<przedmiot> <plik.json>')
const additions = JSON.parse(readFileSync(file, 'utf8'))
for (const [topic, tasks] of Object.entries(additions)) {
  const path = join('content', scope, 'tasks', `${topic}.json`)
  const raw = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : { tasks: [] }
  const doc = Array.isArray(raw) ? { tasks: raw } : raw
  doc.updatedAt ??= new Date().toISOString().slice(0, 10)
  const used = doc.tasks.map((t) => Number(String(t.id).slice(-3)))
  let next = Math.max(0, ...used) + 1
  for (const t of tasks) doc.tasks.push({ id: String(next++).padStart(3, '0'), ...t })
  writeFileSync(path, JSON.stringify(Array.isArray(raw) ? doc.tasks : doc, null, 2) + '\n')
  console.log(`${path}: +${tasks.length}`)
}
