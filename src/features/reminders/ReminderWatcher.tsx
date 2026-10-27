import { useEffect } from 'react'
import { computeGame } from '@/features/gamify/useGame'
import { useProfile } from '@/state/profile'
import { notificationsSupported, shouldRemind } from './reminders'

const LAST = 'leapy:reminded'

/** While the app is open: one gentle notification a day after the chosen time, if the goal is open. */
export function ReminderWatcher() {
  const reminder = useProfile((s) => s.reminder)
  useEffect(() => {
    if (!reminder.enabled || !notificationsSupported()) return
    const check = async () => {
      if (Notification.permission !== 'granted') return
      let last: string | null = null
      try {
        last = localStorage.getItem(LAST)
      } catch {
        /* ignore */
      }

      const game = await computeGame(useProfile.getState().goals)
      const day = shouldRemind({
        time: reminder.time,
        now: new Date(),
        goalMet: game.goals.todayDone,
        lastShown: last,
      })
      if (!day) return
      try {
        localStorage.setItem(LAST, day)
      } catch {
        /* ignore */
      }
      const left = useProfile.getState().goals.daily - game.goals.todayItems
      const reg = await navigator.serviceWorker?.getRegistration()
      const body = `Do dzisiejszego celu brakuje ${left}. Kilka minut wystarczy.`
      if (reg)
        await reg.showNotification('Leapy', { body, icon: '/icons/pwa-192.png', tag: 'reminder' })
      else new Notification('Leapy', { body })
    }
    void check()
    const id = window.setInterval(() => void check(), 60_000)
    return () => window.clearInterval(id)
  }, [reminder.enabled, reminder.time])
  return null
}
