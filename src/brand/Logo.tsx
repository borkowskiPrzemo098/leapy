import { clsx } from 'clsx'
import { BRAND, mark, wordmark } from './geometry.js'

// Inline SVG so the wordmark follows currentColor (light/dark) and needs no request.
// Geometry is shared with scripts/brand/build-assets.mjs, so files and UI never drift.

export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      aria-hidden
      className={className}
      dangerouslySetInnerHTML={{ __html: mark({ id: 'ui-mark' }) }}
    />
  )
}

export function Logo({ height = 36, className }: { height?: number; className?: string }) {
  const s = 0.82
  return (
    <svg
      viewBox="0 0 380 128"
      height={height}
      width={(height * 380) / 128}
      role="img"
      aria-label="Leapy"
      className={clsx('text-ink', className)}
      dangerouslySetInnerHTML={{
        __html: `<g transform="scale(0.25)">${mark({ id: 'ui-logo' })}</g><g transform="translate(156 ${64 - 80 * s}) scale(${s})">${wordmark()}</g>`,
      }}
    />
  )
}

export { BRAND }
