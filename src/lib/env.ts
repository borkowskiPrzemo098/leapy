// Build-time settings. Vite fills import.meta.env; the prerender runs in plain Node, where
// import.meta.env does not exist, so it reads the same values from process.env.
const node = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env

/** Path the site is served under, always with a trailing slash: "/" or "/leapy/" (GitHub Pages). */
export const BASE = (
  (import.meta.env?.BASE_URL as string | undefined) ??
  node?.VITE_BASE ??
  '/'
).replace(/\/?$/, '/')

/** BASE without the trailing slash, for router basenames ("" at the root). */
export const BASENAME = BASE.slice(0, -1)

export const SITE_URL_SETTING =
  (import.meta.env?.VITE_SITE_URL as string | undefined) ?? node?.VITE_SITE_URL

/** A site-root path ("/data/x.json") as a URL under BASE. */
export const withBase = (path: string) => BASE + path.replace(/^\//, '')

/** The router path of a browser pathname: "/leapy/app/cwicz" → "/app/cwicz". */
export const routePath = (pathname: string) =>
  pathname.startsWith(BASE) ? `/${pathname.slice(BASE.length)}` : pathname
