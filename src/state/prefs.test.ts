import { TEXT_SCALE, usePrefs } from './prefs'

describe('prefs store', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('style')
    delete document.documentElement.dataset.motion
  })

  it('applies and persists text size; the default leaves no key behind', () => {
    usePrefs.getState().setTextScale('xl')
    expect(document.documentElement.style.getPropertyValue('--text-scale')).toBe(
      String(TEXT_SCALE.xl),
    )
    expect(localStorage.getItem('leapy:text-scale')).toBe('xl')
    usePrefs.getState().setTextScale('md')
    expect(localStorage.getItem('leapy:text-scale')).toBeNull()
  })

  it('reduce-motion sets data-motion and clears it when back to system', () => {
    usePrefs.getState().setMotion('reduce')
    expect(document.documentElement.dataset.motion).toBe('reduce')
    expect(localStorage.getItem('leapy:motion')).toBe('reduce')
    usePrefs.getState().setMotion('system')
    expect(document.documentElement.dataset.motion).toBeUndefined()
    expect(localStorage.getItem('leapy:motion')).toBeNull()
  })
})
