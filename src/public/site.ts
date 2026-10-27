// Public site settings. SITE_URL is the canonical origin used in links, sitemap and Open Graph;
// set VITE_SITE_URL at build time once the domain is final (see docs/deployment.md, E6).
export const SITE_URL = (
  (import.meta.env?.VITE_SITE_URL as string | undefined) ?? 'https://leapy.pages.dev'
).replace(/\/$/, '')
export const SITE_NAME = 'Leapy'
export const CONTACT = 'rob.lewandowski987@gmail.com'
