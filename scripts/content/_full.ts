// Full dump for review: each task with answer key, hint and full explanation; or lessons.
import { readFileSync } from 'node:fs'
import { plainText as t } from './search'
const [exam, subject, what = 'tasks'] = process.argv.slice(2)
const p = JSON.parse(readFileSync(`public/data/${exam}/${subject}.json`, 'utf8'))
if (what === 'lessons') {
  for (const [id, l] of Object.entries(p.lessons) as [string, any][]) {
    console.log(`=== ${id}: ${l.title}`)
    console.log('SUM: ' + l.summary.map(t).join(' | '))
    console.log('ERR: ' + l.mistakes.map(t).join(' | '))
    console.log('SHEET: ' + l.cheatsheet.map((c: any) => `${t(c.label)} = ${t(c.formula)}`).join(' | '))
    console.log('BODY: ' + t(l.body))
  }
} else {
  for (const x of p.tasks as any[]) {
    const L = (i: number) => String.fromCharCode(65 + i)
    let key = ''
    if (x.type === 'single') key = L(x.answer)
    else if (x.type === 'multi') key = x.answer.map(L).join(',')
    else if (x.type === 'truefalse') key = x.answer.map((b: boolean) => (b ? 'P' : 'F')).join(',')
    else if (x.type === 'ordering') key = x.answer.map(L).join('<')
    else if (x.type === 'match') key = x.answer.map((r: number, i: number) => `${i + 1}${L(r)}`).join(' ')
    else key = JSON.stringify(x.answer)
    let opts = ''
    if (Array.isArray(x.options)) opts = x.options.map((o: string, i: number) => `${L(i)}) ${t(o)}`).join(' ‖ ')
    else if (x.options) opts = 'L: ' + x.options.left.map(t).join(' ‖ ') + '  R: ' + x.options.right.map((o: string, i: number) => `${L(i)}) ${t(o)}`).join(' ‖ ')
    console.log(`#${x.id.split('.').slice(2).join('.')} [${x.type}] ${t(x.prompt)}`)
    if (opts) console.log('   ' + opts)
    console.log('   KEY: ' + key + (x.hint ? '   HINT: ' + t(x.hint) : ''))
    console.log('   EXP: ' + t(x.explanation))
  }
}
