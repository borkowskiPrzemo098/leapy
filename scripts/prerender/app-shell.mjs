// app.html = index.html before prerender: the shell for /app/* (Cloudflare _redirects and the
// service worker's offline fallback). Generated, so the two never drift apart.
import { copyFileSync } from 'node:fs'
copyFileSync(
  new URL('../../index.html', import.meta.url),
  new URL('../../app.html', import.meta.url),
)
