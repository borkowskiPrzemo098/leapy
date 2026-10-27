import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  House,
  UserRound,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** The centre "Ćwicz" action: raised and filled in the tab bar */
  primary?: boolean
}

// Order is the tab-bar order; "Ćwicz" sits in the middle, under the thumb.
export const NAV: NavItem[] = [
  { to: '/app', label: 'Start', icon: House },
  { to: '/app/egzaminy', label: 'Egzaminy', icon: BookOpen },
  { to: '/app/cwicz', label: 'Ćwicz', icon: Zap, primary: true },
  { to: '/app/postepy', label: 'Postępy', icon: ChartNoAxesColumnIncreasing },
  { to: '/app/profil', label: 'Profil', icon: UserRound },
]
