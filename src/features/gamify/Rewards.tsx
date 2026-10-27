import { Award, Flame, Snowflake } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { attemptXp, XP } from '@/engine/gamify'
import { useProfile, useProfileHydrated } from '@/state/profile'
import { ProgressBar } from '@/ui/progress'
import { badgeById, useGame } from './useGame'

/** "+42 XP" for a finished session, with the level bar. */
export function XpGain({ sessionId }: { sessionId: string }) {
  const game = useGame(sessionId)
  const [gain, setGain] = useState<number | null>(null)
  useEffect(() => {
    let alive = true
    void import('@/storage').then(async ({ progress }) => {
      const mine = (await progress().attempts()).filter((a) => a.sessionId === sessionId)
      if (alive) setGain(mine.reduce((n, a) => n + attemptXp(a), 0) + XP.session)
    })
    return () => {
      alive = false
    }
  }, [sessionId])
  if (!game || gain === null) return null
  const { level, streak } = game
  return (
    <section
      aria-label="Nagrody za sesję"
      className="mt-4 grid gap-4 rounded-2xl bg-surface p-5 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center"
    >
      <div>
        <p className="flex items-baseline justify-between gap-3">
          <span className="tabular text-heading text-ink">+{gain} XP</span>
          <span className="tabular text-small font-bold text-ink-2">
            Stopień {level.level} · {level.into}/{level.need} XP
          </span>
        </p>
        <ProgressBar
          value={level.into}
          max={level.need}
          tone="reward"
          label={`Postęp do stopnia ${level.level + 1}`}
          className="mt-2"
        />
      </div>
      <p className="flex items-center gap-2 font-extrabold text-ink">
        <span className="grid size-10 place-items-center rounded-xl bg-reward text-on-reward">
          <Flame aria-hidden className="size-5" fill="currentColor" />
        </span>
        Seria: {streak.current}
        {streak.freezes > 0 && (
          <span className="flex items-center gap-1 text-small font-bold text-ink-2">
            <Snowflake aria-hidden className="size-4" />
            <span className="sr-only">Zamrożenia serii:</span> {streak.freezes}
          </span>
        )}
      </p>
    </section>
  )
}

/** Badges earned since the learner last saw them; marks them as seen once shown. */
export function NewBadges() {
  const game = useGame('badges')
  const hydrated = useProfileHydrated()
  const seen = useProfile((s) => s.seenBadges)
  const markSeen = useProfile((s) => s.markBadgesSeen)
  const fresh = game && hydrated ? game.badges.filter((id) => !seen.includes(id)) : []

  // Marked as seen when the learner leaves this screen, so the notice stays while it is read.
  const pending = useRef<string[]>([])
  useEffect(() => {
    pending.current = fresh
  })
  useEffect(() => () => markSeen(pending.current), [markSeen])

  if (!fresh.length) return null
  return (
    <section
      aria-labelledby="new-badges"
      className="mt-4 rounded-2xl bg-reward-soft p-5"
      role="status"
    >
      <h2 id="new-badges" className="text-heading text-ink">
        {fresh.length === 1 ? 'Nowa odznaka' : `Nowe odznaki: ${fresh.length}`}
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {fresh.map((id) => {
          const b = badgeById(id)
          return b ? (
            <li key={id} className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-reward text-on-reward">
                <Award aria-hidden className="size-6" />
              </span>
              <span>
                <span className="block font-extrabold text-ink">{b.title}</span>
                <span className="block text-small text-ink-2">{b.how}</span>
              </span>
            </li>
          ) : null
        })}
      </ul>
    </section>
  )
}
