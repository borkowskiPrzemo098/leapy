import { FLAGS, isEnabled } from './flags'

describe('feature flags', () => {
  afterEach(() => localStorage.clear())

  it('free flags are on, premium flags off for free learners', () => {
    expect(isEnabled('shareCards')).toBe(true)
    expect(isEnabled('offlinePacks')).toBe(false)
    expect(isEnabled('offlinePacks', 'premium')).toBe(true)
  })

  it('a local override wins', () => {
    localStorage.setItem('leapy:flags', JSON.stringify({ offlinePacks: true, shareCards: false }))
    expect(isEnabled('offlinePacks')).toBe(true)
    expect(isEnabled('shareCards')).toBe(false)
  })

  it('every flag has a description', () => {
    for (const f of Object.values(FLAGS)) expect(f.description.length).toBeGreaterThan(5)
  })
})
