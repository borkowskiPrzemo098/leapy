import { reminderIcs, shouldRemind } from './reminders'

describe('reminders', () => {
  it('builds a daily calendar event with an alarm at the chosen time', () => {
    const ics = reminderIcs('07:45', new Date(2026, 9, 27, 12))
    expect(ics).toContain('DTSTART:20261027T074500')
    expect(ics).toContain('DTEND:20261027T080000')
    expect(ics).toContain('RRULE:FREQ=DAILY')
    expect(ics).toContain('BEGIN:VALARM')
    expect(ics.split('\r\n')[0]).toBe('BEGIN:VCALENDAR')
  })

  it('reminds once a day, after the time, only when the goal is not met', () => {
    const now = new Date(2026, 9, 27, 18, 30)
    expect(shouldRemind({ time: '18:00', now, goalMet: false, lastShown: null })).toBe('2026-10-27')
    expect(shouldRemind({ time: '19:00', now, goalMet: false, lastShown: null })).toBeNull()
    expect(shouldRemind({ time: '18:00', now, goalMet: true, lastShown: null })).toBeNull()
    expect(shouldRemind({ time: '18:00', now, goalMet: false, lastShown: '2026-10-27' })).toBeNull()
  })
})
