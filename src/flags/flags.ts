// Feature flags with a free/premium tier, without payments (see docs/monetization.md in E5).
// Today every learner is on "free" and every shipped feature is free. Premium flags exist
// so future paid features can be built behind them and tested with a local override.

export type Tier = 'free' | 'premium'

export interface FlagDef {
  tier: Tier
  description: string
}

export const FLAGS = {
  shareCards: { tier: 'free', description: 'Karty do udostępniania (post i relacja)' },
  reminders: { tier: 'free', description: 'Lokalne przypomnienia o nauce' },
  mockExam: { tier: 'free', description: 'Egzamin próbny z czasem' },
  offlinePacks: {
    tier: 'premium',
    description: 'Pakiety offline całych przedmiotów (planowane)',
  },
  extraMockSheets: {
    tier: 'premium',
    description: 'Dodatkowe arkusze próbne (planowane)',
  },
} as const satisfies Record<string, FlagDef>

export type Flag = keyof typeof FLAGS

const OVERRIDES = 'leapy:flags'

/** Developer overrides: localStorage "leapy:flags" = {"offlinePacks": true} */
function overrides(): Partial<Record<Flag, boolean>> {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES) ?? '{}') as Partial<Record<Flag, boolean>>
  } catch {
    return {}
  }
}

/** The learner's tier. No licence check exists yet, so it is always "free". */
export const currentTier = (): Tier => 'free'

export function isEnabled(flag: Flag, tier: Tier = currentTier()): boolean {
  const o = overrides()[flag]
  if (o !== undefined) return o
  return FLAGS[flag].tier === 'free' || tier === 'premium'
}
