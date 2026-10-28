import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string
}

// Base path: "/" by default, "/leapy/" for GitHub Pages (VITE_BASE in the Pages workflow).
const base = (process.env.VITE_BASE ?? '/').replace(/\/?$/, '/')

export default defineConfig({
  base,
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // The learner decides when to reload into a new version (UpdateToast).
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        id: `${base}app`,
        name: 'Leapy: nauka do egzaminów',
        short_name: 'Leapy',
        description:
          'Nauka do egzaminu ósmoklasisty i matury. Zadania z wyjaśnieniami, powtórki i egzaminy próbne. Działa offline.',
        lang: 'pl',
        dir: 'ltr',
        start_url: `${base}app`,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f5f3ff',
        theme_color: '#5b3df5',
        categories: ['education'],
        icons: [
          { src: `${base}icons/pwa-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `${base}icons/pwa-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: `${base}icons/maskable-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Ćwicz',
            url: `${base}app/cwicz`,
            icons: [{ src: `${base}icons/pwa-192.png`, sizes: '192x192' }],
          },
          {
            name: 'Postępy',
            url: `${base}app/postepy`,
            icons: [{ src: `${base}icons/pwa-192.png`, sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        // Precached: the app shell (app.html serves every /app route offline), code, fonts,
        // icons, and the small content index (catalog, site). Subject packs are several MB of
        // pre-rendered KaTeX, so they are cached at runtime instead: the learner's chosen
        // subjects are fetched in the background (features/study/prefetch.ts) and then work
        // offline. Prerendered public pages stay network-first and indexable.
        globPatterns: [
          '**/*.{js,css,svg,png,woff2,webmanifest}',
          'app.html',
          'data/catalog.json',
          'data/site.json',
          'data/search.json',
        ],
        runtimeCaching: [
          {
            // Subject packs and their per-topic files
            urlPattern: /\/data\/[a-z0-9-]+\/[a-z0-9-]+(\/[a-z0-9-]+)?\.json$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'leapy-content', expiration: { maxEntries: 400 } },
          },
        ],
        // Only the fonts actually used (latin + latin-ext) are precached.
        globIgnores: ['**/*-{cyrillic,cyrillic-ext,vietnamese,greek}-*.woff2', 'og-default.png'],
        navigateFallback: `${base}app.html`,
        navigateFallbackAllowlist: [new RegExp(`^${base}(app|dev)(/|$)`)],
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    // Two HTML entries: index.html (template for prerendered public pages) and app.html (shell)
    sourcemap: true,
    rollupOptions: {
      input: { index: 'index.html', app: 'app.html' },
      onwarn(warning, warn) {
        // Zod ships /*#__PURE__*/ hints in positions Rollup ignores; harmless, so not reported.
        if (warning.code === 'INVALID_ANNOTATION' && warning.id?.includes('node_modules/zod'))
          return
        warn(warning)
      },
    },
  },
})
