import { usePrefs } from './prefs'

describe('prefs store', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('style')
    delete document.documentElement.dataset.motion
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
