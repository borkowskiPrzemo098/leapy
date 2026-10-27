import { CalendarPlus } from 'lucide-react'
import { useState } from 'react'
import { useProfile } from '@/state/profile'
import { Button } from '@/ui/Button'
import { Segmented, Switch } from '@/ui/controls'
import { downloadIcs, notificationsSupported } from './reminders'

const daily = [5, 10, 20, 30].map((n) => ({ value: String(n), label: String(n) }))
const weekly = [3, 5, 7].map((n) => ({ value: String(n), label: `${n} dni` }))

/** Goals and reminder settings (Profil). */
export function GoalSettings() {
  const { goals, setGoals } = useProfile()
  return (
    <>
      <div className="border-b border-line pb-4">
        <p className="font-bold text-ink">Cel dzienny</p>
        <p className="text-small text-ink-3">Zadania i fiszki w ciągu dnia.</p>
        <div className="mt-3">
          <Segmented
            label="Cel dzienny"
            value={String(goals.daily)}
            options={daily}
            onChange={(v) => setGoals({ daily: Number(v) })}
          />
        </div>
      </div>
      <div className="pt-4">
        <p className="font-bold text-ink">Cel tygodniowy</p>
        <p className="text-small text-ink-3">W ilu dniach tygodnia spełniasz cel dzienny.</p>
        <div className="mt-3">
          <Segmented
            label="Cel tygodniowy"
            value={String(goals.weekly)}
            options={weekly}
            onChange={(v) => setGoals({ weekly: Number(v) })}
          />
        </div>
      </div>
    </>
  )
}

export function ReminderSettings() {
  const { reminder, setReminder } = useProfile()
  const [note, setNote] = useState('')
  const supported = notificationsSupported()

  const toggle = async (on: boolean) => {
    if (!on) {
      setReminder({ enabled: false })
      setNote('')
      return
    }
    if (supported && Notification.permission !== 'granted') {
      const p = await Notification.requestPermission()
      if (p !== 'granted') {
        setNote('Bez zgody na powiadomienia zostaje przypomnienie w kalendarzu (niżej).')
        return
      }
    }
    setReminder({ enabled: true })
    setNote('')
  }

  return (
    <>
      <div className="border-b border-line pb-4">
        <label htmlFor="reminder-time" className="font-bold text-ink">
          Godzina przypomnienia
        </label>
        <input
          id="reminder-time"
          type="time"
          value={reminder.time}
          onChange={(e) => e.target.value && setReminder({ time: e.target.value })}
          className="tabular mt-3 block min-h-12 rounded-xl border-2 border-line-strong bg-surface px-4 text-lead font-bold text-ink outline-none focus-visible:border-brand"
        />
      </div>
      <div className="border-b border-line py-4">
        <p className="font-bold text-ink">Dodaj do kalendarza</p>
        <p className="text-small text-ink-3">
          Codzienne wydarzenie z alarmem w kalendarzu telefonu. Działa też przy zamkniętej
          aplikacji.
        </p>
        <Button
          variant="secondary"
          className="mt-3"
          icon={<CalendarPlus aria-hidden className="size-5" />}
          onClick={() => downloadIcs(reminder.time)}
        >
          Pobierz wydarzenie (.ics)
        </Button>
      </div>
      <div className="pt-3">
        {supported ? (
          <Switch
            checked={reminder.enabled}
            onChange={(on) => void toggle(on)}
            label="Powiadomienie w aplikacji"
            description="Raz dziennie po tej godzinie, jeśli cel nie jest spełniony. Tylko gdy Leapy jest otwarte: aplikacja nie ma serwera, który mógłby je wysłać."
          />
        ) : (
          <p className="text-small text-ink-3">
            Ta przeglądarka nie obsługuje powiadomień. Użyj przypomnienia w kalendarzu.
          </p>
        )}
        {note && (
          <p role="status" className="mt-2 text-small font-bold text-ink-2">
            {note}
          </p>
        )}
      </div>
    </>
  )
}
