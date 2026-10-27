// Local reminders without a server. A PWA cannot schedule notifications while it is closed
// (no push backend, Notification Triggers never shipped), so Leapy offers two honest options:
//  1. a daily event for the phone's own calendar (.ics), which alarms even with the app closed;
//  2. a notification while the app is open, once a day, if today's goal is not met yet.

const pad = (n: number) => String(n).padStart(2, '0')

/** Daily recurring calendar event at `time` ("HH:MM", floating local time) with an alarm. */
export function reminderIcs(time: string, now = new Date()) {
  const [h = 18, m = 0] = time.split(':').map(Number)
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const start = `${date}T${pad(h)}${pad(m)}00`
  const endMin = h * 60 + m + 15
  const end = `${date}T${pad(Math.floor(endMin / 60) % 24)}${pad(endMin % 60)}00`
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Leapy//Przypomnienie//PL',
    'BEGIN:VEVENT',
    `UID:leapy-reminder-${date}@leapy`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:Leapy: kilka minut nauki',
    'DESCRIPTION:Krótka sesja w Leapy. Skocz na wyższy poziom.',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Czas na Leapy',
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}

export function downloadIcs(time: string) {
  const blob = new Blob([reminderIcs(time)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'leapy-przypomnienie.ics'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const notificationsSupported = () => typeof Notification !== 'undefined'

/** True when the in-app reminder should fire now (time passed, goal not met, not shown today). */
export function shouldRemind(opts: {
  time: string
  now: Date
  goalMet: boolean
  lastShown: string | null
}) {
  const [h = 18, m = 0] = opts.time.split(':').map(Number)
  const today = `${opts.now.getFullYear()}-${pad(opts.now.getMonth() + 1)}-${pad(opts.now.getDate())}`
  const minutes = opts.now.getHours() * 60 + opts.now.getMinutes()
  return !opts.goalMet && opts.lastShown !== today && minutes >= h * 60 + m ? today : null
}
