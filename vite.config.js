import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name:             'UrbanClone — Home Services',
        short_name:       'UrbanClone',
        description:      'Professional home services at your doorstep',
        theme_color:      '#1AB64F',
        background_color: '#ffffff',
        display:          'standalone',
        scope:            '/',
        start_url:        '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            // Cache service catalogue for offline browsing
            urlPattern: ({ url }) => url.pathname.startsWith('/api/services'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName:        'services-cache',
              expiration:       { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },  // 24h
              cacheableResponse:{ statuses: [0, 200] },
            },
          },
          {
            // Cache static assets (JS/CSS/images)
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName:  'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },  // 30 days
            },
          },
        ],
      },
    }),
  ],
})
