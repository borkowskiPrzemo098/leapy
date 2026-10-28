import { NICK_MAX, useNick } from '@/state/nick'

/** Nickname field used in onboarding and Profil. */
export function NickInput({ id = 'nick' }: { id?: string }) {
  const { nick, setNick } = useNick()
  return (
    <input
      id={id}
      type="text"
      value={nick}
      maxLength={NICK_MAX}
      autoComplete="nickname"
      autoCapitalize="words"
      enterKeyHint="done"
      placeholder="np. Ola"
      onChange={(e) => setNick(e.target.value)}
      className="mt-3 block min-h-12 w-full max-w-sm rounded-xl border-2 border-line-strong bg-surface px-4 text-lead font-bold text-ink outline-none placeholder:font-normal placeholder:text-ink-3 focus-visible:border-brand"
    />
  )
}
