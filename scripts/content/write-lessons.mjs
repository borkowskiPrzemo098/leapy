// Writes lesson files from one JSON document (YAML quoting done by the yaml library):
//   node scripts/content/write-lessons.mjs <exam>/<subject> <lessons.json> [--force]
// lessons.json: { "<topic>": { title, summary[], mistakes[], cheatsheet[{label, formula}],
//                cards?[{front, back}], body } }. Existing lessons are kept unless --force.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { stringify } from 'yaml'

const [scope, file, flag] = process.argv.slice(2)
if (!scope || !file) throw new Error('użycie: write-lessons.mjs <egzamin>/<przedmiot> <plik.json>')
const lessons = JSON.parse(readFileSync(file, 'utf8'))
const dir = join('content', scope, 'lessons')
mkdirSync(dir, { recursive: true })
const today = new Date().toISOString().slice(0, 10)
for (const [topic, l] of Object.entries(lessons)) {
  const path = join(dir, `${topic}.md`)
  if (existsSync(path) && flag !== '--force') {
    console.log(`${path}: istnieje, pomijam`)
    continue
  }
  const { body, ...meta } = l
  const front = stringify(
    { cheatsheet: [], ...meta, reviewed: false, updatedAt: today },
    { lineWidth: 0, defaultStringType: 'QUOTE_SINGLE', defaultKeyType: 'PLAIN' },
  )
  writeFileSync(path, `---\n${front}---\n\n${body.trim()}\n`)
  console.log(`${path}: zapisano`)
}
