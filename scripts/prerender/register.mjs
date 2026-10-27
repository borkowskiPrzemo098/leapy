import { register } from 'node:module'
import { fileURLToPath } from 'node:url'
// tsx reads JSX and the "@/" alias from this config (the root tsconfig is solution-style)
process.env.TSX_TSCONFIG_PATH = fileURLToPath(
  new URL('../../tsconfig.prerender.json', import.meta.url),
)
register('./hooks.mjs', import.meta.url)
