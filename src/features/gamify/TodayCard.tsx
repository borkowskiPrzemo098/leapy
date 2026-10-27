import { clsx } from 'clsx'
import { Check, Flame, Snowflake } from 'lucide-react'
import { useProfile } from '@/state/profile'
import { GoalRing, ProgressBar } from '@/ui/progress'
import { useGame } from './useGame'

const WEEKDAYS = ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd']

/** Start dashboard: today's goal, streak with freezes, level and the week. */
export function TodayCard() {
  const game = useGame('start')
  const goals = useProfile((s) => s.goals)
  if (!game) return <div aria-busy="true" className="min-h-72 rounded-2xl bg-surface shadow-sm" />
  const { goals: g, streak, level } = game

  return (
    <section aria-labelledby="today" className="rounded-2xl bg-surface p-5 shadow-sm sm:p-6">
      <h2 id="today" className="text-heading text-ink">
        Dziś
      </h2>
      <div className="mt-4 flex items-center gap-5">
        <div className="shrink-0 rounded-2xl bg-brand p-3">
          <GoalRing
            value={g.todayItems}
            goal={goals.daily}
            size={104}
            label={`Cel dzienny: ${g.todayItems} z ${goals.daily}`}
          >
            <span className="tabular block text-heading text-on-brand">
              {Math.min(g.todayItems, goals.daily)}
            </span>
            <span className="tabular block text-micro text-on-brand-2">z {goals.daily}</span>
          </GoalRing>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-ink">
            {g.todayDone
              ? 'Cel na dziś spełniony'
              : `Jeszcze ${goals.daily - g.todayItems} do celu`}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-ink-2">
            <span className="flex items-center gap-1.5 font-bold text-ink">
              <span className="grid size-7 place-items-center rounded-lg bg-reward text-on-reward">
                <Flame aria-hidden className="size-4" fill="currentColor" />
              </span>
              Seria: {streak.current}
            </span>
            <span className="flex items-center gap-1">
              <Snowflake aria-hidden className="size-4" />
              Zamrożenia: {streak.freezes}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="flex items-baseline justify-between text-small">
          <span className="font-extrabold text-ink">Stopień {level.level}</span>
          <span className="tabular font-bold text-ink-3">
            {level.into} / {level.need} XP
          </span>
        </p>
        <ProgressBar
          value={level.into}
          max={level.need}
          tone="reward"
          label={`Postęp do stopnia ${level.level + 1}`}
          className="mt-1.5"
        />
      </div>

      <div className="mt-5">
        <p className="flex items-baseline justify-between text-small">
          <span className="font-extrabold text-ink">Ten tydzień</span>
          <span className="tabular font-bold text-ink-3">
            {g.weekDays} / {goals.weekly} dni
          </span>
        </p>
        <ol className="mt-2 grid grid-cols-7 gap-1.5" aria-label="Dni tygodnia z celem">
          {g.week.map((d, i) => (
            <li
              key={d.key}
              aria-label={`${WEEKDAYS[i]}: ${d.met ? 'cel spełniony' : d.future ? 'jeszcze przed tobą' : 'bez celu'}`}
              className={clsx(
                'grid h-10 place-items-center rounded-lg text-micro font-extrabold',
                d.met && 'bg-reward text-on-reward',
                !d.met && !d.future && 'bg-sunken text-ink-3',
                d.future && 'border-2 border-dashed border-line text-ink-3',
              )}
            >
              {d.met ? <Check aria-hidden className="size-4" strokeWidth={3} /> : WEEKDAYS[i]}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-micro text-ink-3">
          Zamrożenie dostajesz co 7 dni serii (najwyżej 2). Chroni serię, gdy opuścisz dzień.
        </p>
      </div>
    </section>
  )
}
