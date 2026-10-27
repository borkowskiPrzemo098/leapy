import { useEffect, useState } from 'react'
import { loadCatalog } from '@/content/data'
import {
  BADGES,
  earnedBadges,
  goalProgress,
  levelOf,
  streakWithFreezes,
  totalXp,
  type GoalProgress,
  type Goals,
  type Level,
  type StreakState,
} from '@/engine/gamify'
import { activityByDay, topicMastery } from '@/engine/stats'
import { useProfile } from '@/state/profile'

// Everything the game layer shows, derived from history in one pass.

export interface Game {
  xp: number
  level: Level
  streak: StreakState
  goals: GoalProgress
  /** Earned badge ids, in BADGES order */
  badges: string[]
  answered: number
}

export async function computeGame(goals: Goals, now = Date.now()): Promise<Game> {
  const { progress } = await import('@/storage')
  const [attempts, sessions, catalog] = await Promise.all([
    progress().attempts(),
    progress().sessions(10_000),
    loadCatalog(),
  ])
  const activity = activityByDay(attempts, sessions)
  const xp = totalXp(attempts, sessions)
  const level = levelOf(xp)
  const streak = streakWithFreezes(new Set(activity.keys()), now)

  const topicTasks = new Map<string, number>()
  for (const e of catalog.exams)
    for (const s of e.subjects)
      for (const sec of s.sections)
        for (const t of sec.topics) topicTasks.set(`${e.id}/${s.id}/${t.id}`, t.tasks)
  const mastered = [...topicMastery(attempts).values()].filter(
    (m) => (topicTasks.get(m.key) ?? 0) > 0 && m.mastered >= (topicTasks.get(m.key) ?? 0),
  ).length
  const mocks = sessions.filter((s) => s.mode === 'mock')
  const practice = sessions.filter((s) => s.mode !== 'mock' && s.mode !== 'cards')

  const badges = earnedBadges({
    answered: attempts.length,
    correct: attempts.filter((a) => a.correct).length,
    longestStreak: streak.longest,
    mocks: mocks.length,
    bestMock: Math.max(
      0,
      ...mocks.map((m) =>
        m.summary.maxPoints ? (m.summary.points ?? 0) / m.summary.maxPoints : 0,
      ),
    ),
    perfectSessions: practice.filter(
      (s) => s.summary.total >= 5 && s.summary.correct === s.summary.total,
    ).length,
    cardSessions: sessions.filter((s) => s.mode === 'cards').length,
    topicsMastered: mastered,
    level: level.level,
  })
  return {
    xp,
    level,
    streak,
    goals: goalProgress(activity, goals, now),
    badges,
    answered: attempts.length,
  }
}

/** Game state for a screen; `refresh` re-reads after the learner does something. */
export function useGame(key = '') {
  const goals = useProfile((s) => s.goals)
  const [game, setGame] = useState<Game | null>(null)
  const goalsKey = `${goals.daily}/${goals.weekly}/${key}`
  useEffect(() => {
    let alive = true
    void computeGame(goals).then((g) => alive && setGame(g))
    return () => {
      alive = false
    }
    // goals are captured through goalsKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalsKey])
  return game
}

export const badgeById = (id: string) => BADGES.find((b) => b.id === id)
