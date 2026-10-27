// "Zgłoś błąd": on the MVP a prepared e-mail. The task id and app version make reports actionable.

export const CONTACT_EMAIL = 'rob.lewandowski987@gmail.com'

export function reportMailto(opts: { taskId?: string; topic?: string; what?: string }) {
  const subject = opts.taskId
    ? `Leapy: błąd w zadaniu ${opts.taskId}`
    : `Leapy: błąd (${opts.what ?? 'treść'})`
  const body = [
    'Opisz, co jest nie tak (np. zła odpowiedź, literówka, niejasne polecenie):',
    '',
    '',
    '---',
    opts.taskId ? `Zadanie: ${opts.taskId}` : null,
    opts.topic ? `Temat: ${opts.topic}` : null,
    `Wersja aplikacji: ${__APP_VERSION__}`,
  ]
    .filter((l) => l !== null)
    .join('\n')
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
