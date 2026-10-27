import { clsx } from 'clsx'
import { Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { CompiledTask } from '@/content/schema'
import { parseNumber, type Grade, type Response } from '@/engine/grade'
import { Html, Prose } from '@/features/content/Prose'
import { AnswerOption, type AnswerState } from '@/ui/AnswerOption'

// One task on screen. Inputs keep their draft locally; `onSubmit` hands the engine a response in
// ORIGINAL option indices. After grading, `graded` freezes the view and shows what was right.
// Exam mode (`onChange` set): nothing is graded, every edit is reported and answers stay editable.

export interface TaskViewProps {
  task: CompiledTask
  /** Display order of options (from the session item) */
  order: number[]
  graded?: { response: Response; grade: Grade }
  onSubmit: (r: Response) => void
  /** Lets the bottom bar run "Sprawdź": null when the draft is not complete yet */
  onDraft: (submit: (() => void) | null) => void
  /** Exam mode: the current answer after every edit (null = blank) */
  onChange?: ((r: Response | null) => void) | undefined
  /** Exam mode: the answer given earlier, restored when returning to the task */
  initial?: Response | undefined
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8']

export function TaskView(props: TaskViewProps) {
  const { task } = props
  return (
    <div>
      <Prose html={task.prompt} className="task-prompt text-heading" />
      <div className="mt-6">
        {task.type === 'single' && <Single {...props} task={task} />}
        {task.type === 'multi' && <Multi {...props} task={task} />}
        {task.type === 'truefalse' && <TrueFalse {...props} task={task} />}
        {(task.type === 'numeric' || task.type === 'short') && (
          <TextAnswer {...props} task={task} />
        )}
        {task.type === 'ordering' && <Ordering {...props} task={task} />}
        {task.type === 'match' && <Match {...props} task={task} />}
      </div>
    </div>
  )
}

type Of<T extends CompiledTask['type']> = Omit<TaskViewProps, 'task'> & {
  task: Extract<CompiledTask, { type: T }>
}

/** Reports the draft in exam mode. */
function useReport(onChange: TaskViewProps['onChange'], r: Response | null) {
  const json = JSON.stringify(r)
  useEffect(() => {
    onChange?.(r)
    // r is compared by value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [json, onChange])
}

const from = <T extends Response['type']>(r: Response | undefined, t: T) =>
  r?.type === t ? (r as Extract<Response, { type: T }>) : undefined

function useNumberKeys(count: number, onKey: (i: number) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return
      const i = KEYS.indexOf(e.key)
      if (i >= 0 && i < count) {
        e.preventDefault()
        onKey(i)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [count, onKey, enabled])
}

// ---------- single: tap answers immediately ----------

function Single({ task, order, graded, onSubmit, onDraft, onChange, initial }: Of<'single'>) {
  const exam = !!onChange
  const [draft, setDraft] = useState<number | null>(from(initial, 'single')?.choice ?? null)
  useEffect(() => onDraft(null), [onDraft])
  useReport(onChange, draft === null ? null : { type: 'single', choice: draft })
  const pick = (i: number) => {
    const original = order[i]
    if (graded || original === undefined) return
    if (exam) setDraft(original)
    else onSubmit({ type: 'single', choice: original })
  }
  useNumberKeys(order.length, pick, !graded)
  const chosen = graded?.response.type === 'single' ? graded.response.choice : draft
  return (
    <div className="flex flex-col gap-3">
      {order.map((o, i) => {
        let state: AnswerState = 'idle'
        if (graded) {
          if (o === chosen) state = o === task.answer ? 'correct' : 'wrong'
          else if (o === task.answer) state = 'missed'
        } else if (o === chosen) state = 'selected'
        return (
          <AnswerOption
            key={o}
            keyLabel={KEYS[i] ?? ''}
            state={state}
            disabled={!!graded}
            onSelect={() => pick(i)}
          >
            <Html as="span" html={task.options[o] ?? ''} />
          </AnswerOption>
        )
      })}
    </div>
  )
}

// ---------- multi: toggle, then check ----------

function Multi({ task, order, graded, onSubmit, onDraft, onChange, initial }: Of<'multi'>) {
  const [chosen, setChosen] = useState<number[]>(from(initial, 'multi')?.choices ?? [])
  useReport(onChange, chosen.length ? { type: 'multi', choices: chosen } : null)
  const toggle = (i: number) => {
    const o = order[i]
    if (graded || o === undefined) return
    setChosen((c) => (c.includes(o) ? c.filter((x) => x !== o) : [...c, o]))
  }
  useNumberKeys(order.length, toggle, !graded)
  useEffect(() => {
    onDraft(
      !graded && !onChange && chosen.length > 0
        ? () => onSubmit({ type: 'multi', choices: chosen })
        : null,
    )
  }, [chosen, graded, onDraft, onSubmit, onChange])
  const picked = graded?.response.type === 'multi' ? graded.response.choices : chosen
  return (
    <div className="flex flex-col gap-3">
      <p className="text-small font-bold text-ink-3">Zaznacz wszystkie poprawne odpowiedzi.</p>
      {order.map((o, i) => {
        const on = picked.includes(o)
        const should = task.answer.includes(o)
        const state: AnswerState = graded
          ? on
            ? should
              ? 'correct'
              : 'wrong'
            : should
              ? 'missed'
              : 'idle'
          : on
            ? 'selected'
            : 'idle'
        return (
          <AnswerOption
            key={o}
            keyLabel={KEYS[i] ?? ''}
            state={state}
            disabled={!!graded}
            onSelect={() => toggle(i)}
          >
            <Html as="span" html={task.options[o] ?? ''} />
          </AnswerOption>
        )
      })}
    </div>
  )
}

// ---------- truefalse: P / F per statement ----------

function TrueFalse({ task, graded, onSubmit, onDraft, onChange, initial }: Of<'truefalse'>) {
  const [values, setValues] = useState<(boolean | null)[]>(
    () => from(initial, 'truefalse')?.values ?? task.options.map(() => null),
  )
  useReport(onChange, values.some((v) => v !== null) ? { type: 'truefalse', values } : null)
  const shown = graded?.response.type === 'truefalse' ? graded.response.values : values
  useEffect(() => {
    onDraft(
      !graded && !onChange && values.every((v) => v !== null)
        ? () => onSubmit({ type: 'truefalse', values })
        : null,
    )
  }, [values, graded, onDraft, onSubmit, onChange])
  return (
    <ol className="flex flex-col gap-3">
      {task.options.map((html, i) => {
        const v = shown[i] ?? null
        const right = graded ? v === task.answer[i] : null
        return (
          <li
            key={i}
            className={clsx(
              'rounded-xl border-2 p-4',
              right === true && 'border-correct bg-correct-soft',
              right === false && 'border-wrong bg-wrong-soft',
              right === null && 'border-line bg-surface',
            )}
          >
            <div className="flex items-start gap-3">
              <Html html={html} className="flex-1 font-semibold text-ink" />
              {right !== null && (
                <span className="sr-only">
                  {right ? 'Dobrze' : `Źle, poprawnie: ${task.answer[i] ? 'prawda' : 'fałsz'}`}
                </span>
              )}
            </div>
            <div
              role="radiogroup"
              aria-label={`Zdanie ${i + 1}`}
              className="mt-3 grid grid-cols-2 gap-2"
            >
              {([true, false] as const).map((b) => {
                const on = v === b
                const isAnswer = graded && task.answer[i] === b
                return (
                  <button
                    key={String(b)}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={!!graded}
                    onClick={() => setValues((vs) => vs.map((x, j) => (j === i ? b : x)))}
                    className={clsx(
                      'flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 font-bold transition-colors duration-[var(--dur-fast)]',
                      on && !graded && 'border-brand bg-brand text-on-brand',
                      !on &&
                        !graded &&
                        'border-line-strong bg-surface text-ink-2 hover:bg-surface-2',
                      graded && isAnswer && 'border-correct bg-correct text-on-feedback',
                      graded &&
                        !isAnswer &&
                        on &&
                        'border-wrong bg-surface text-wrong-text line-through',
                      graded && !isAnswer && !on && 'border-line bg-surface text-ink-3',
                    )}
                  >
                    {graded && isAnswer && <Check aria-hidden className="size-4" strokeWidth={3} />}
                    {b ? 'Prawda' : 'Fałsz'}
                  </button>
                )
              })}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// ---------- numeric / short: typed answer ----------

function TextAnswer({
  task,
  graded,
  onSubmit,
  onDraft,
  onChange,
  initial,
}: Of<'numeric' | 'short'>) {
  const numeric = task.type === 'numeric'
  const restored = initial?.type === 'numeric' || initial?.type === 'short' ? initial.text : ''
  const [text, setText] = useState(restored)
  const [problem, setProblem] = useState<string | null>(null)
  useReport(
    onChange,
    text.trim() ? (numeric ? { type: 'numeric', text } : { type: 'short', text }) : null,
  )
  const submit = () => {
    if (numeric && parseNumber(text) === null) {
      setProblem('Wpisz liczbę, np. 12, 0,75 albo 3/4.')
      return
    }
    onSubmit(numeric ? { type: 'numeric', text } : { type: 'short', text })
  }
  useEffect(() => {
    onDraft(!graded && !onChange && text.trim() ? submit : null)
    // submit closes over text only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, graded, onDraft])
  const value =
    graded && (graded.response.type === 'numeric' || graded.response.type === 'short')
      ? graded.response.text
      : text
  const unit = task.type === 'numeric' ? task.answer.unit : undefined
  return (
    <div>
      <label htmlFor="answer" className="mb-2 block text-small font-bold text-ink-2">
        Twoja odpowiedź
      </label>
      <div className="flex items-center gap-3">
        <input
          id="answer"
          value={value}
          onChange={(e) => {
            setText(e.target.value)
            setProblem(null)
          }}
          onBlur={() => {
            if (onChange && numeric && text.trim() && parseNumber(text) === null)
              setProblem('Wpisz liczbę, np. 12, 0,75 albo 3/4.')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && text.trim() && !graded && !onChange) submit()
          }}
          disabled={!!graded}
          inputMode={numeric ? 'decimal' : 'text'}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-invalid={graded ? !graded.grade.correct : !!problem}
          aria-describedby={problem ? 'answer-problem' : undefined}
          className={clsx(
            'tabular min-h-14 w-full flex-1 rounded-xl border-2 px-4 text-lead font-bold text-ink outline-none',
            'focus-visible:border-brand',
            graded?.grade.correct === true && 'border-correct bg-correct-soft',
            graded?.grade.correct === false && 'border-wrong bg-wrong-soft',
            !graded && (problem ? 'border-wrong bg-surface' : 'border-line-strong bg-surface'),
          )}
        />
        {unit && <span className="text-lead font-bold text-ink-2">{unit}</span>}
      </div>
      {problem && (
        <p id="answer-problem" role="alert" className="mt-2 text-small font-bold text-wrong-text">
          {problem}
        </p>
      )}
    </div>
  )
}

// ---------- ordering: tap items in order ----------

function Ordering({ task, order, graded, onSubmit, onDraft, onChange, initial }: Of<'ordering'>) {
  const [seq, setSeq] = useState<number[]>(from(initial, 'ordering')?.order ?? [])
  useReport(onChange, seq.length ? { type: 'ordering', order: seq } : null)
  const shownSeq = graded?.response.type === 'ordering' ? graded.response.order : seq
  const pool = order.filter((o) => !shownSeq.includes(o))
  useEffect(() => {
    onDraft(
      !graded && !onChange && seq.length === order.length
        ? () => onSubmit({ type: 'ordering', order: seq })
        : null,
    )
  }, [seq, graded, order.length, onDraft, onSubmit, onChange])
  return (
    <div className="flex flex-col gap-5">
      <ol
        aria-label="Twoja kolejność"
        className="flex min-h-16 flex-col gap-2 rounded-2xl border-2 border-dashed border-line-strong p-2"
      >
        {shownSeq.length === 0 && (
          <li className="grid min-h-12 place-items-center text-small text-ink-3">
            Stuknij elementy w dobrej kolejności.
          </li>
        )}
        {shownSeq.map((o, pos) => {
          const right = graded ? task.answer[pos] === o : null
          return (
            <li key={o}>
              <button
                type="button"
                disabled={!!graded}
                onClick={() => setSeq((s) => s.filter((x) => x !== o))}
                aria-label={graded ? undefined : 'Usuń z kolejności'}
                className={clsx(
                  'flex min-h-12 w-full items-center gap-3 rounded-lg border-2 px-3 py-2 text-left',
                  right === null && 'border-brand bg-brand-soft',
                  right === true && 'border-correct bg-correct-soft',
                  right === false && 'border-wrong bg-wrong-soft',
                )}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-brand text-small font-extrabold text-on-brand">
                  {pos + 1}
                </span>
                <Html
                  as="span"
                  html={task.options[o] ?? ''}
                  className="flex-1 font-semibold text-ink"
                />
                {right === true && (
                  <Check aria-label="Dobre miejsce" className="size-5 text-correct-text" />
                )}
                {right === false && (
                  <X aria-label="Złe miejsce" className="size-5 text-wrong-text" />
                )}
              </button>
            </li>
          )
        })}
      </ol>
      {!graded && pool.length > 0 && (
        <ul aria-label="Do ułożenia" className="flex flex-wrap gap-2">
          {pool.map((o) => (
            <li key={o}>
              <button
                type="button"
                onClick={() => setSeq((s) => [...s, o])}
                className="mb-[3px] min-h-12 rounded-lg border-2 border-line-strong bg-surface px-4 py-2 font-semibold text-ink shadow-[0_3px_0_var(--line-strong)] active:translate-y-[3px] active:shadow-none"
              >
                <Html as="span" html={task.options[o] ?? ''} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------- match: tap a left item, then its partner ----------

function Match({ task, order, graded, onSubmit, onDraft, onChange, initial }: Of<'match'>) {
  const [pairs, setPairs] = useState<(number | null)[]>(
    () => from(initial, 'match')?.pairs ?? task.options.left.map(() => null),
  )
  useReport(onChange, pairs.some((p) => p !== null) ? { type: 'match', pairs } : null)
  const [active, setActive] = useState<number | null>(0)
  const shown = graded?.response.type === 'match' ? graded.response.pairs : pairs
  useEffect(() => {
    onDraft(
      !graded && !onChange && pairs.every((p) => p !== null)
        ? () => onSubmit({ type: 'match', pairs })
        : null,
    )
  }, [pairs, graded, onDraft, onSubmit, onChange])

  const chooseRight = (r: number) => {
    if (graded || active === null) return
    const next = pairs.map((p) => (p === r ? null : p))
    next[active] = r
    setPairs(next)
    const free = next.findIndex((p) => p === null)
    setActive(free === -1 ? null : free)
  }
  const leftOf = (r: number) => shown.findIndex((p) => p === r)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ol aria-label="Elementy do dopasowania" className="flex flex-col gap-2">
        {task.options.left.map((html, l) => {
          const r = shown[l] ?? null
          const right = graded ? task.answer[l] === r : null
          return (
            <li key={l}>
              <button
                type="button"
                disabled={!!graded}
                aria-pressed={active === l}
                onClick={() => setActive(l)}
                className={clsx(
                  'flex min-h-14 w-full items-center gap-3 rounded-xl border-2 px-3 py-2 text-left transition-colors duration-[var(--dur-fast)]',
                  right === true && 'border-correct bg-correct-soft',
                  right === false && 'border-wrong bg-wrong-soft',
                  right === null &&
                    (active === l ? 'border-brand bg-brand-soft' : 'border-line bg-surface'),
                )}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-ink text-small font-extrabold text-bg">
                  {String.fromCharCode(65 + l)}
                </span>
                <Html as="span" html={html} className="flex-1 font-semibold text-ink" />
                {r !== null && (
                  <span className="rounded-md bg-brand px-2 py-1 text-micro font-extrabold text-on-brand">
                    <Html as="span" html={task.options.right[r] ?? ''} />
                  </span>
                )}
              </button>
              {right === false && (
                <p className="mt-1 pl-2 text-small font-bold text-correct-text">
                  Poprawnie: <Html as="span" html={task.options.right[task.answer[l] ?? 0] ?? ''} />
                </p>
              )}
            </li>
          )
        })}
      </ol>
      {!graded && (
        <ul aria-label="Wartości do wyboru" className="flex flex-wrap content-start gap-2">
          {order.map((r) => {
            const used = leftOf(r)
            return (
              <li key={r}>
                <button
                  type="button"
                  onClick={() => chooseRight(r)}
                  aria-label={
                    used >= 0 ? `Przypisane do ${String.fromCharCode(65 + used)}` : undefined
                  }
                  className={clsx(
                    'mb-[3px] flex min-h-12 items-center gap-2 rounded-lg border-2 px-4 py-2 font-semibold shadow-[0_3px_0_var(--line-strong)] active:translate-y-[3px] active:shadow-none',
                    used >= 0
                      ? 'border-brand bg-brand-soft text-ink'
                      : 'border-line-strong bg-surface text-ink',
                  )}
                >
                  {used >= 0 && (
                    <span className="text-micro font-extrabold text-brand-text">
                      {String.fromCharCode(65 + used)}
                    </span>
                  )}
                  <Html as="span" html={task.options.right[r] ?? ''} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
