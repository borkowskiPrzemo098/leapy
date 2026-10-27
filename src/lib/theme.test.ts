import { applyTheme, readThemePref, resolveTheme } from './theme'

const setSystemDark = (dark: boolean) => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: dark,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as typeof window.matchMedia
}

describe('theme', () => {
  beforeEach(() => localStorage.clear())

  it('auto follows the system setting', () => {
    setSystemDark(true)
    expect(resolveTheme('auto')).toBe('dark')
    setSystemDark(false)
    expect(resolveTheme('auto')).toBe('light')
  })

  it('persists explicit choices and forgets auto', () => {
    setSystemDark(false)
    applyTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(readThemePref()).toBe('dark')
    applyTheme('auto')
    expect(readThemePref()).toBe('auto')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
