import { clsx } from 'clsx'
import { NavLink } from 'react-router-dom'
import { Logo } from '@/brand/Logo'
import { NAV } from './nav'

const isEnd = (to: string) => to === '/app'

/**
 * Phone: fixed bottom tab bar with a raised centre "Ćwicz" button.
 * The bar sits above the home indicator via safe-area padding.
 */
export function TabBar() {
  return (
    <nav
      aria-label="Główna nawigacja"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid h-[4.5rem] max-w-lg grid-cols-5 items-stretch px-1">
        {NAV.map(({ to, label, icon: Icon, primary }) => (
          <li key={to} className="flex">
            <NavLink
              to={to}
              end={isEnd(to)}
              className={({ isActive }) =>
                clsx(
                  'group flex flex-1 flex-col items-center justify-center gap-1 rounded-lg text-micro font-bold',
                  'transition-colors duration-[var(--dur-fast)]',
                  !primary && (isActive ? 'text-brand-text' : 'text-ink-3 hover:text-ink'),
                  primary && 'text-ink',
                )
              }
            >
              {({ isActive }) =>
                primary ? (
                  <>
                    <span
                      className={clsx(
                        '-mt-7 grid size-16 place-items-center rounded-full border-4 border-surface bg-brand text-on-brand',
                        'shadow-[0_4px_0_var(--brand-deep)] transition-[transform,box-shadow] duration-[var(--dur-fast)]',
                        'group-active:translate-y-1 group-active:shadow-none',
                        isActive && 'ring-4 ring-brand-soft',
                      )}
                    >
                      <Icon aria-hidden className="size-7" strokeWidth={2.5} fill="currentColor" />
                    </span>
                    <span className={clsx(isActive ? 'text-brand-text' : 'text-ink-2')}>
                      {label}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={clsx(
                        'grid h-8 w-14 place-items-center rounded-full transition-colors duration-[var(--dur-base)]',
                        isActive && 'bg-brand-soft',
                      )}
                    >
                      <Icon aria-hidden className="size-6" strokeWidth={isActive ? 2.5 : 2} />
                    </span>
                    {label}
                  </>
                )
              }
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Tablet and desktop: the same five destinations as a left rail, "Ćwicz" as the lead action. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-surface px-4 pt-6 pb-6 md:flex">
      <NavLink
        to="/app"
        className="mb-8 flex min-h-12 items-center self-start rounded-lg px-2"
        aria-label="Leapy, Start"
      >
        <Logo height={36} />
      </NavLink>
      <nav aria-label="Główna nawigacja">
        <ul className="flex flex-col gap-1.5">
          {NAV.map(({ to, label, icon: Icon, primary }) => (
            <li key={to} className={clsx(primary && 'order-first mb-4')}>
              <NavLink
                to={to}
                end={isEnd(to)}
                className={({ isActive }) =>
                  clsx(
                    'flex min-h-12 items-center gap-3 rounded-lg px-3 font-bold transition-[background-color,color,box-shadow,transform] duration-[var(--dur-fast)]',
                    primary &&
                      'mb-1 bg-brand text-on-brand shadow-[0_4px_0_var(--brand-deep)] hover:bg-brand-strong active:translate-y-1 active:shadow-none',
                    !primary && isActive && 'bg-brand-soft text-brand-text',
                    !primary && !isActive && 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      aria-hidden
                      className="size-6"
                      strokeWidth={isActive || primary ? 2.5 : 2}
                      fill={primary ? 'currentColor' : 'none'}
                    />
                    {primary ? 'Ćwicz teraz' : label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mt-auto px-3 text-micro text-ink-3">Leapy nie jest powiązane z CKE ani MEN.</p>
    </aside>
  )
}
