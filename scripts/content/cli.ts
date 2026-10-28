// npm run content:check  → validate everything, print issues, exit 1 on any error
// npm run content:build  → the same, then write public/data/*, content/ids.lock.json and docs/content-report.md
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { coverageReport, runPipeline } from './pipeline'
import { buildSearchIndex } from './search'
import { compileSite } from './site'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const mode = process.argv[2] === 'build' ? 'build' : 'check'
const lockFile = join(root, 'content/ids.lock.json')

const r = runPipeline(root, { lockFile, renamesFile: join(root, 'content/renames.json') })
const site = compileSite(root)
r.issues.push(...site.issues)
const errors = r.issues.filter((i) => i.level === 'error')
const warnings = r.issues.filter((i) => i.level === 'warning')

for (const i of r.issues)
  console[i.level === 'error' ? 'error' : 'warn'](
    `${i.level === 'error' ? '✖' : '⚠'} ${i.file}: ${i.message}`,
  )

const subjects = r.catalog.exams.reduce((n, e) => n + e.subjects.length, 0)
console.log(
  `content: ${r.catalog.exams.length} egzaminy, ${subjects} przedmiotów, ${r.lessons.size} lekcji, ${r.tasks.length} zadań (${r.verified} sprawdzonych automatycznie), ${site.site.posts.length} wpisów, ${Object.keys(site.site.pages).length} stron, ${errors.length} błędów, ${warnings.length} ostrzeżeń`,
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
  writeFileSync(join(out, 'site.json'), JSON.stringify(site.site))
  writeFileSync(join(out, 'search.json'), JSON.stringify(buildSearchIndex(r.catalog, r.packs)))
  for (const p of r.packs) {
    mkdirSync(join(out, p.exam), { recursive: true })
    writeFileSync(join(out, p.exam, `${p.subject}.json`), JSON.stringify(p))
    // Small per-topic files, so a topic screen does not wait for the whole subject pack.
    mkdirSync(join(out, p.exam, p.subject), { recursive: true })
    const topics = new Set([...Object.keys(p.lessons), ...p.tasks.map((t) => t.topic)])
    for (const topic of topics) {
      const file = {
        version: p.version,
        lesson: p.lessons[topic] ?? null,
        taskCount: p.tasks.filter((t) => t.topic === topic).length,
      }
      writeFileSync(join(out, p.exam, p.subject, `${topic}.json`), JSON.stringify(file))
    }
  }
  writeFileSync(lockFile, JSON.stringify(r.ids, null, 2) + '\n')
  writeFileSync(join(root, 'docs/content-report.md'), coverageReport(r))
  console.log('content: zapisano public/data, content/ids.lock.json, docs/content-report.md')
}
