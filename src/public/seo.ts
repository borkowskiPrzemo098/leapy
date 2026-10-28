import { SITE_NAME, SITE_URL } from './site'

export interface Crumb {
  to: string
  label: string
}

export const breadcrumbLd = (items: Crumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.label,
    item: SITE_URL + c.to,
  })),
})

export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icons/pwa-512.png`,
}

export { tasksLabel } from '@/lib/plural'
