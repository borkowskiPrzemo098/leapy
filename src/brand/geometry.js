// Single source of the Leapy letterforms. Every logo file is generated from these
// paths, so concepts, lockups and icons stay geometrically identical.
// The wordmark is monoline: stroked centerlines with round caps, x-height 40, stroke 13.

export const BRAND = {
  violet: '#5b3df5',
  violetDeep: '#2f1a9e',
  ink: '#17123a',
  white: '#ffffff',
  sun: '#ffc531',
}

export const WORD_STROKE = 13

/** Letter centerline paths of "leapy" on baseline 100, x-height top 60. `rise[i]` lifts letter i. */
export function wordmarkPaths(rise = [0, 0, 0, 0, 0]) {
  const t = (d, dy) => (dy ? `<g transform="translate(0 ${dy})">${d}</g>` : d)
  const p = (d) => `<path d="${d}"/>`
  return [
    t(p('M6.5 30V100'), rise[0]),
    t(p('M30.5 80H70.5A20 20 0 1 0 64.6 94.1'), rise[1]),
    t(p('M134.5 80A20 20 0 1 0 134.5 80.01M134.5 60V100'), rise[2]),
    t(p('M158.5 60V128M158.5 80A20 20 0 1 1 158.5 80.01'), rise[3]),
    t(p('M222.5 60L241 100M259.5 60L228 128'), rise[4]),
  ]
}

export const WORD_BOX = { x: -1, y: 20, w: 268, h: 118 }

/** Wordmark group: stroked with currentColor unless a color is given. */
export function wordmark({ color = 'currentColor', rise } = {}) {
  return `<g fill="none" stroke="${color}" stroke-width="${WORD_STROKE}" stroke-linecap="round" stroke-linejoin="round">${wordmarkPaths(rise).join('')}</g>`
}

/** Concave four-point sparkle centred on (cx, cy). */
export function sparkle(cx, cy, r) {
  return `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`
}

// Mark (concept C) on a 512 grid: an upright L whose foot takes off. A dotted
// leap arc rises from the foot's tip to a spark one level higher.
export const MARK_L = 'M142 140V318Q142 362 186 362H270'
export const MARK_ARC = 'M318 354Q384 328 370 240'
export const MARK_STROKE = 64
export const MARK_SPARK = sparkle(360, 160, 56)
export const MARK_RADIUS = 120

/** The L + leap glyph, without the tile. `scale` shrinks it around the tile centre. */
export function markGlyph({ lColor, sparkColor, scale = 1 }) {
  const tr =
    scale === 1 ? '' : ` transform="translate(256 256) scale(${scale}) translate(-256 -256)"`
  return `<g${tr}><path d="${MARK_L}" fill="none" stroke="${lColor}" stroke-width="${MARK_STROKE}" stroke-linecap="round" stroke-linejoin="round"/><path d="${MARK_ARC}" fill="none" stroke="${lColor}" stroke-width="34" stroke-linecap="round" stroke-dasharray="0 54"/><path d="${MARK_SPARK}" fill="${sparkColor}" stroke="${sparkColor}" stroke-width="16" stroke-linejoin="round"/></g>`
}

/** Full mark: rounded tile + glyph. mono=true renders one colour with the glyph knocked out. */
export function mark({
  mono = false,
  tile = BRAND.violet,
  l = BRAND.white,
  spark = BRAND.sun,
  id = 'm',
  square = false,
  scale = 1,
} = {}) {
  const rx = square ? 0 : MARK_RADIUS
  if (mono) {
    return `<defs><mask id="${id}-k"><rect width="512" height="512" fill="#fff"/>${markGlyph({ lColor: '#000', sparkColor: '#000', scale })}</mask></defs><rect width="512" height="512" rx="${rx}" fill="currentColor" mask="url(#${id}-k)"/>`
  }
  return `<rect width="512" height="512" rx="${rx}" fill="${tile}"/>${markGlyph({ lColor: l, sparkColor: spark, scale })}`
}

export const svg = (viewBox, body, title = 'Leapy') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`
