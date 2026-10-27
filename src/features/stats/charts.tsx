import { clsx } from 'clsx'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { calendarWeeks, heatLevel, type DayActivity, type DayPoint } from '@/engine/stats'
import { formatDay, itemsLabel, niceMax } from './format'

// Hand-built SVG/CSS charts: one violet ramp for magnitude, thin marks, recessive grid,
// a tooltip on hover AND focus, and a table view so no value depends on hovering or colour.

const heat = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4'] as const

const monthFmt = new Intl.DateTimeFormat('pl-PL', { month: 'short' })
const dayFmt = new Intl.DateTimeFormat('pl-PL', { day: 'numeric' })

/** Width of an element in CSS px, so SVG units equal pixels and text keeps the type ramp. */
function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null)
  const [w, setW] = useState(fallback)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => e && setW(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

interface Tip {
  x: number
  y: number
  title: string
  value: string
}

/** One tooltip per chart, positioned inside the chart's relative frame. */
function useTooltip() {
  const frame = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<Tip | null>(null)
  const show = (el: Element, title: string, value: string) => {
    const f = frame.current?.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    if (!f) return
    setTip({ x: r.left + r.width / 2 - f.left, y: r.top - f.top, title, value })
  }
  const node = tip && (
    <div
      aria-hidden
      className="pointer-events-none absolute z-10 w-max -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-lg bg-ink px-3 py-2 whitespace-nowrap text-bg shadow-md"
      style={{
        left: `clamp(4.5rem, ${tip.x}px, calc(100% - 4.5rem))`,
        top: tip.y,
      }}
    >
      <p className="tabular text-small font-extrabold">{tip.value}</p>
      <p className="text-micro text-bg/75">{tip.title}</p>
    </div>
  )
  return { frame, show, hide: () => setTip(null), node }
}

function TableView({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="mt-3 text-small">
      <summary className="inline-flex min-h-12 cursor-pointer items-center font-bold text-brand-text">
        {summary}
      </summary>
      <div className="max-h-64 overflow-y-auto rounded-xl border border-line">{children}</div>
    </details>
  )
}

// ---------- activity calendar ----------

export function ActivityCalendar({
  activity,
  weeks,
  now,
}: {
  activity: Map<string, DayActivity>
  weeks: number
  now: number
}) {
  const cols = calendarWeeks(weeks, now)
  const { frame, show, hide, node } = useTooltip()
  const active = cols.flat().filter((d) => (activity.get(d.key)?.items ?? 0) > 0)

  return (
    <div>
      <div ref={frame} className="relative">
        {/* Month labels over the first column of each month */}
        <div
          aria-hidden
          className="mb-1 ml-7 grid text-micro font-bold text-ink-3"
          style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}
        >
          {cols.map((col, i) => {
            const first = col[0]
            const prev = cols[i - 1]?.[0]
            const show =
              first && (!prev || new Date(first.ts).getMonth() !== new Date(prev.ts).getMonth())
            return (
              <span key={first?.key ?? i} className="overflow-visible whitespace-nowrap">
                {show && first ? monthFmt.format(first.ts).replace('.', '') : ''}
              </span>
            )
          })}
        </div>
        <div className="flex gap-1">
          <div
            aria-hidden
            className="grid w-6 shrink-0 grid-rows-7 gap-[3px] text-micro leading-none text-ink-3"
          >
            {['pn', '', 'śr', '', 'pt', '', 'nd'].map((d, i) => (
              <span key={i} className="flex items-center">
                {d}
              </span>
            ))}
          </div>
          <div
            role="img"
            aria-label={`Kalendarz nauki z ostatnich ${weeks} tygodni: aktywne dni ${active.length}.`}
            className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}
            onPointerLeave={hide}
          >
            {cols.flat().map((d) => {
              const n = activity.get(d.key)?.items ?? 0
              return (
                <span
                  key={d.key}
                  onPointerEnter={(e) =>
                    !d.future && show(e.currentTarget, formatDay(d.ts), itemsLabel(n))
                  }
                  className={clsx(
                    'aspect-square max-h-6 rounded-[3px] transition-[outline-color] duration-[var(--dur-fast)]',
                    d.future ? 'bg-transparent' : heat[heatLevel(n)],
                    !d.future && 'outline-2 outline-offset-1 outline-transparent hover:outline-ink',
                  )}
                />
              )
            })}
          </div>
        </div>
        {node}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-micro font-bold text-ink-3">
        <span>mniej</span>
        {heat.map((c, i) => (
          <span
            key={c}
            aria-hidden
            className={clsx('size-3 rounded-[3px]', c)}
            title={['0', '1–4', '5–9', '10–19', '20+'][i]}
          />
        ))}
        <span>więcej</span>
      </div>
      {active.length > 0 && (
        <TableView summary="Pokaż dni jako listę">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-surface-2">
              <tr>
                <th scope="col" className="px-3 py-2">
                  Dzień
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Zadania i fiszki
                </th>
              </tr>
            </thead>
            <tbody>
              {[...active].reverse().map((d) => (
                <tr key={d.key} className="border-t border-line">
                  <td className="px-3 py-2">{formatDay(d.ts)}</td>
                  <td className="tabular px-3 py-2 text-right">
                    {activity.get(d.key)?.items ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableView>
      )}
    </div>
  )
}

// ---------- answers per day (columns) ----------

export function DailyBars({ points }: { points: DayPoint[] }) {
  const { frame, show, hide, node } = useTooltip()
  const max = niceMax(Math.max(0, ...points.map((p) => p.answered)))
  const [box, W] = useWidth<HTMLDivElement>(320)
  const H = 160
  const top = 8
  const base = H - 26
  const gutter = 28
  const band = (W - gutter) / points.length
  const bar = Math.min(24, band * 0.6)
  const y = (v: number) => base - (v / max) * (base - top)
  const peak = points.reduce<DayPoint | null>(
    (m, p) => (!m || p.answered > m.answered ? p : m),
    null,
  )
  const total = points.reduce((n, p) => n + p.answered, 0)

  return (
    <div>
      <div ref={frame} className="relative" onPointerLeave={hide}>
        <div ref={box}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="block h-auto w-full overflow-visible"
            role="group"
            aria-label={`Rozwiązane zadania w ostatnich ${points.length} dniach: razem ${total}.`}
          >
            {[0, max / 2, max].map((t) => (
              <g key={t}>
                <line
                  x1={gutter}
                  x2={W}
                  y1={y(t)}
                  y2={y(t)}
                  className="stroke-chart-grid"
                  strokeWidth={1}
                />
                <text
                  x={0}
                  y={y(t) + 4}
                  textAnchor="start"
                  className="tabular fill-ink-3 text-micro font-bold"
                >
                  {t}
                </text>
              </g>
            ))}
            {points.map((p, i) => {
              const cx = gutter + band * i + band / 2
              const h = base - y(p.answered)
              const last = i === points.length - 1
              const label = last || i === 0 || i % 7 === 0
              const tip = () => {
                const acc = p.answered
                  ? ` · ${Math.round((p.correct / p.answered) * 100)}% dobrze`
                  : ''
                return [formatDay(p.ts), `${itemsLabel(p.answered)}${acc}`] as const
              }
              return (
                <g
                  key={p.key}
                  tabIndex={0}
                  role="img"
                  aria-label={`${formatDay(p.ts)}: ${itemsLabel(p.answered)}`}
                  className="group outline-none"
                  onPointerEnter={(e) => show(e.currentTarget, ...tip())}
                  onFocus={(e) => show(e.currentTarget, ...tip())}
                  onBlur={hide}
                >
                  {/* Hit area: the whole band, not just the painted bar */}
                  <rect
                    x={gutter + band * i}
                    y={top}
                    width={band}
                    height={base - top}
                    fill="transparent"
                  />
                  {p.answered > 0 && (
                    <path
                      d={roundedTop(cx - bar / 2, y(p.answered), bar, h, Math.min(4, h))}
                      className={clsx(
                        'transition-opacity duration-[var(--dur-fast)] group-hover:opacity-80 group-focus-visible:opacity-80',
                        last ? 'fill-heat-4' : 'fill-heat-3',
                      )}
                    />
                  )}
                  <rect
                    x={cx - bar / 2 - 3}
                    y={top - 2}
                    width={bar + 6}
                    height={base - top + 4}
                    rx={4}
                    fill="none"
                    className="stroke-transparent group-focus-visible:stroke-focus"
                    strokeWidth={2}
                  />
                  {(p === peak && p.answered > 0) || (last && p.answered > 0) ? (
                    <text
                      x={cx}
                      y={y(p.answered) - 5}
                      textAnchor="middle"
                      className="tabular fill-ink-2 text-micro font-extrabold"
                    >
                      {p.answered}
                    </text>
                  ) : null}
                  {label && (
                    <text
                      x={cx}
                      y={H - 4}
                      textAnchor="middle"
                      className="fill-ink-3 text-micro font-bold"
                    >
                      {last ? 'dziś' : dayFmt.format(p.ts)}
                    </text>
                  )}
                </g>
              )
            })}
            <line
              x1={gutter}
              x2={W}
              y1={base}
              y2={base}
              className="stroke-line-strong"
              strokeWidth={1}
            />
          </svg>
        </div>
        {node}
      </div>
      <TableView summary="Pokaż jako tabelę">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-surface-2">
            <tr>
              <th scope="col" className="px-3 py-2">
                Dzień
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Zadania
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Dobrze
              </th>
            </tr>
          </thead>
          <tbody>
            {[...points].reverse().map((p) => (
              <tr key={p.key} className="border-t border-line">
                <td className="px-3 py-2">{formatDay(p.ts)}</td>
                <td className="tabular px-3 py-2 text-right">{p.answered}</td>
                <td className="tabular px-3 py-2 text-right">{p.correct}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableView>
    </div>
  )
}

/** A column with rounded top corners and a square foot on the baseline. */
function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`
}
