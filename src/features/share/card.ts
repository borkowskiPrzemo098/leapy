import { BRAND, WORD_BOX, wordmark } from '@/brand/geometry'

// Share cards drawn on a canvas in the browser: no server, no upload. Two formats:
// post 1080×1350 (feed) and story 1080×1920. The card only states what the learner did.

export type CardFormat = 'post' | 'story'
export const SIZES: Record<CardFormat, { w: number; h: number }> = {
  post: { w: 1080, h: 1350 },
  story: { w: 1080, h: 1920 },
}

export interface CardContent {
  /** Small line above the number, e.g. "Seria nauki" */
  kicker: string
  /** The hero value, e.g. "7 dni" or "8 z 10" */
  value: string
  /** One line under it, e.g. "Matura · Matematyka" */
  detail: string
  /** Filled steps of the 5-step staircase (0–5) */
  steps?: number
}

const FONT = '"Plus Jakarta Sans Variable", system-ui, sans-serif'

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = () => rej(new Error('Nie udało się narysować logo.'))
    img.src = src
  })
}

/** Shrinks the font until the text fits the width. */
function fit(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  size: number,
  max: number,
) {
  let s = size
  do {
    ctx.font = `${weight} ${s}px ${FONT}`
    s -= 4
  } while (ctx.measureText(text).width > max && s > 24)
}

export async function drawCard(c: CardContent, format: CardFormat): Promise<HTMLCanvasElement> {
  const { w, h } = SIZES[format]
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Ta przeglądarka nie rysuje kart.')
  await document.fonts.ready

  ctx.fillStyle = BRAND.violet
  ctx.fillRect(0, 0, w, h)

  // Staircase rising to the bottom right: the brand motif, filled steps in sun yellow
  const steps = 5
  const done = Math.max(0, Math.min(steps, c.steps ?? 0))
  const stepW = w / 2 / steps
  const baseY = h
  for (let i = 0; i < steps; i++) {
    const sh = 90 + i * 90
    ctx.fillStyle = i < done ? BRAND.sun : BRAND.violetDeep
    ctx.fillRect(w / 2 + i * stepW, baseY - sh, stepW - 8, sh)
  }

  const pad = 96
  const logo = await loadImage(
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${WORD_BOX.x} ${WORD_BOX.y} ${WORD_BOX.w} ${WORD_BOX.h}">${wordmark({ color: BRAND.white })}</svg>`,
    )}`,
  )
  const logoW = 300
  ctx.drawImage(logo, pad, pad, logoW, (logoW * WORD_BOX.h) / WORD_BOX.w)

  const top = format === 'story' ? 620 : 470
  ctx.fillStyle = 'rgba(255,255,255,0.78)'
  fit(ctx, c.kicker, 700, 56, w - pad * 2)
  ctx.fillText(c.kicker, pad, top)

  ctx.fillStyle = BRAND.white
  fit(ctx, c.value, 800, 200, w - pad * 2)
  ctx.fillText(c.value, pad, top + 210)

  ctx.fillStyle = 'rgba(255,255,255,0.78)'
  fit(ctx, c.detail, 600, 48, w - pad * 2)
  ctx.fillText(c.detail, pad, top + 300)

  ctx.fillStyle = BRAND.white
  ctx.font = `800 44px ${FONT}`
  ctx.fillText('Skocz na wyższy poziom.', pad, h - pad - 60)
  return canvas
}

export const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((res, rej) =>
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error('Nie udało się zapisać obrazka.'))),
      'image/png',
    ),
  )

/** Web Share with a file where supported (Android, iOS 15+); otherwise a PNG download. */
export async function shareOrDownload(blob: Blob, name: string, text: string) {
  const file = new File([blob], name, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text })
      return 'shared' as const
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled' as const
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'downloaded' as const
}
