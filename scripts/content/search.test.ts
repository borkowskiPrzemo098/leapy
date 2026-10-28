import katex from 'katex'
import { describe, expect, it } from 'vitest'
import { plainText } from './search'

describe('plainText', () => {
  it('keeps words and the TeX source of formulas, drops the display copy', () => {
    const math = katex.renderToString(String.raw`\log_{2}8=3`, { output: 'htmlAndMathml' })
    const text = plainText(`<p>Skoro ${math}, to <strong>logarytm</strong> &amp; potęga.</p>`)
    expect(text).toBe(String.raw`Skoro \log_{2}8=3, to logarytm & potęga.`)
  })

  it('handles nested spans after a formula', () => {
    const math = katex.renderToString(String.raw`\frac{1}{2}`, { output: 'htmlAndMathml' })
    expect(plainText(`${math}<span>dalej <span>tekst</span></span>`)).toBe(
      String.raw`\frac{1}{2} dalej tekst`,
    )
  })
})
