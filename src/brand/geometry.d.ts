export declare const BRAND: {
  violet: string
  violetDeep: string
  ink: string
  white: string
  sun: string
}
export declare const WORD_STROKE: number
export declare const WORD_BOX: { x: number; y: number; w: number; h: number }
export declare function wordmarkPaths(rise?: number[]): string[]
export declare function wordmark(opts?: { color?: string; rise?: number[] }): string
export declare function sparkle(cx: number, cy: number, r: number): string
export declare const MARK_L: string
export declare const MARK_ARC: string
export declare const MARK_STROKE: number
export declare const MARK_SPARK: string
export declare const MARK_RADIUS: number
export declare function markGlyph(opts: {
  lColor: string
  sparkColor: string
  scale?: number
}): string
export declare function mark(opts?: {
  mono?: boolean
  tile?: string
  l?: string
  spark?: string
  id?: string
  square?: boolean
  scale?: number
}): string
export declare function svg(viewBox: string, body: string, title?: string): string
