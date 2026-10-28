// Public site settings. SITE_URL is the canonical origin used in links, sitemap and Open Graph;
// set VITE_SITE_URL at build time once the domain is final (see docs/deployment.md, E6).
import { SITE_URL_SETTING } from '@/lib/env'

export const SITE_URL = (SITE_URL_SETTING ?? 'https://leapy.pages.dev').replace(/\/$/, '')
export const SITE_NAME = 'Leapy'
export const CONTACT = 'rob.lewandowski987@gmail.com'
