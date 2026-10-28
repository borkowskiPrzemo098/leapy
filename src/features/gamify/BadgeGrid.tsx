import { clsx } from 'clsx'
import { Award, Lock } from 'lucide-react'
import { BADGES } from '@/engine/gamify'
import { ShareButton } from '@/features/share/ShareButton'
import { useGame } from './useGame'
import { plural } from '@/lib/plural'

/** All badges: earned ones in sun yellow, the rest locked with how to get them. */
export function BadgeGrid() {
  const game = useGame('badges-grid')
  if (!game) return null
  const earned = new Set(game.badges)
  return (
    <section aria-labelledby="badges" className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="badges" className="text-heading text-ink">
          Odznaki
        </h2>
        <p className="tabular text-small font-bold text-ink-3">
          {earned.size} z {BADGES.length} · stopień {game.level.level} · {game.xp} XP
        </p>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {BADGES.map((b) => {
          const on = earned.has(b.id)
          return (
            <li
              key={b.id}
              className={clsx(
                'flex flex-col rounded-2xl p-4',
                on ? 'bg-reward-soft' : 'border-2 border-dashed border-line bg-surface',
              )}
            >
              <span
                className={clsx(
                  'grid size-12 place-items-center rounded-xl',
                  on ? 'bg-reward text-on-reward' : 'bg-sunken text-ink-3',
                )}
              >
                {on ? (
                  <Award aria-hidden className="size-6" />
                ) : (
                  <Lock aria-hidden className="size-5" />
                )}
              </span>
              <span className="mt-3 font-extrabold text-ink">{b.title}</span>
              <span className="mt-0.5 text-small text-ink-2">
                <span className="sr-only">{on ? 'Zdobyta. ' : 'Jeszcze nie zdobyta. '}</span>
                {b.how}
              </span>
            </li>
          )
        })}
      </ul>
      {game.streak.current > 0 && (
        <div className="mt-4 max-w-sm">
          <ShareButton
            label="Udostępnij serię"
            content={{
              kicker: 'Seria nauki w Leapy',
              value: `${game.streak.current} ${game.streak.current === 1 ? 'dzień' : 'dni'}`,
              detail: `Stopień ${game.level.level} · ${game.answered} ${plural(game.answered, 'rozwiązane zadanie', 'rozwiązane zadania', 'rozwiązanych zadań')}`,
              steps: Math.min(5, game.level.level),
            }}
          />
        </div>
      )}
    </section>
  )
}
