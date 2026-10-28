import { create } from 'zustand'

// The learner's nickname for the Start greeting. Device-only, like the other UI prefs.

const KEY = 'leapy:nick'
export const NICK_MAX = 24

function read() {
  try {
    return localStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

export const cleanNick = (v: string) => v.replace(/\s+/g, ' ').trimStart().slice(0, NICK_MAX)

interface NickState {
  nick: string
  setNick: (v: string) => void
}

export const useNick = create<NickState>((set) => ({
  nick: read(),
  setNick: (v) => {
    const nick = cleanNick(v)
    try {
      if (nick.trim()) localStorage.setItem(KEY, nick.trim())
      else localStorage.removeItem(KEY)
    } catch {
      /* storage blocked: kept for this visit */
    }
    set({ nick })
  },
}))

/** "Cześć, Ola!" or "Cześć!" without a nickname. */
export const greeting = (nick: string) => (nick.trim() ? `Cześć, ${nick.trim()}!` : 'Cześć!')
