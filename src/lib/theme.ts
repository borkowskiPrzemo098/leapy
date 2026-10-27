export type ThemePref = 'light' | 'dark' | 'auto'

const KEY = 'leapy:theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

export function readThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'auto'
  } catch {
    return 'auto'
  }
}

export function resolveTheme(pref: ThemePref): 'light' | 'dark' {
  return pref === 'auto' ? (media().matches ? 'dark' : 'light') : pref
}

/** Applies the theme to <html>; the same logic runs inline in index.html before first paint. */
export function applyTheme(pref: ThemePref) {
  document.documentElement.dataset.theme = resolveTheme(pref)
  try {
    if (pref === 'auto') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, pref)
  } catch {
    /* storage blocked: theme still applies for this visit */
  }
}

/** Keeps 'auto' in sync with the OS setting. Returns an unsubscribe function. */
export function watchSystemTheme(getPref: () => ThemePref) {
  const mq = media()
  const onChange = () => {
    if (getPref() === 'auto') applyTheme('auto')
  }
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}
