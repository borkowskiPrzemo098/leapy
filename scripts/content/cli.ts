// npm run content:check  → validate everything, print issues, exit 1 on any error
// npm run content:build  → the same, then write public/data/*, content/ids.lock.json and docs/content-report.md
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { coverageReport, runPipeline } from './pipeline'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const mode = process.argv[2] === 'build' ? 'build' : 'check'
const lockFile = join(root, 'content/ids.lock.json')

const r = runPipeline(root, { lockFile, renamesFile: join(root, 'content/renames.json') })
const errors = r.issues.filter((i) => i.level === 'error')
const warnings = r.issues.filter((i) => i.level === 'warning')

for (const i of r.issues)
  console[i.level === 'error' ? 'error' : 'warn'](
    `${i.level === 'error' ? '✖' : '⚠'} ${i.file}: ${i.message}`,
  )

const subjects = r.catalog.exams.reduce((n, e) => n + e.subjects.length, 0)
console.log(
  `content: ${r.catalog.exams.length} egzaminy, ${subjects} przedmiotów, ${r.lessons.size} lekcji, ${r.tasks.length} zadań (${r.verified} sprawdzonych automatycznie), ${errors.length} błędów, ${warnings.length} ostrzeżeń`,
)

if (errors.length) {
  console.error('content: treść zawiera błędy, build zatrzymany.')
  process.exit(1)
}

if (mode === 'build') {
  const out = join(root, 'public/data')
  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })
  writeFileSync(join(out, 'catalog.json'), JSON.stringify(r.catalog))
  for (const p of r.packs) {
    mkdirSync(join(out, p.exam), { recursive: true })
    writeFileSync(join(out, p.exam, `${p.subject}.json`), JSON.stringify(p))
  }
  writeFileSync(lockFile, JSON.stringify(r.ids, null, 2) + '\n')
  writeFileSync(join(root, 'docs/content-report.md'), coverageReport(r))
  console.log('content: zapisano public/data, content/ids.lock.json, docs/content-report.md')
}
