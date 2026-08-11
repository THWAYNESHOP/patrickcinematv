import { existsSync, readFileSync } from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

const supportPortFile = resolve(__dirname, '.support-server-port')
const supportPort = existsSync(supportPortFile)
  ? Number(readFileSync(supportPortFile, 'utf8').trim() || 4000)
  : 4000
const supportServerTarget = process.env.VITE_SUPPORT_SERVER_URL || `http://localhost:${supportPort}`
const basePath = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.svg', 'icon-512.svg', 'index.html'],
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tmdb-images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              rangeRequests: true,
            },
          },
          {
            urlPattern: /^\/.*\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\.themoviedb\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'tmdb-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              networkTimeoutSeconds: 5,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:mp4|webm|m3u8)$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'video-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 15,
              cacheableResponse: {
                statuses: [0, 200],
              },
              rangeRequests: true,
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        skipWaiting: true,
        clientsClaim: true,
        offlineGoogleAnalytics: false,
      },
      manifest: {
        name: 'NEXASTREAM',
        short_name: 'NEXA',
        description: 'Premium streaming experience with live sports, movies, TV series, and more.',
        theme_color: '#E50914',
        background_color: '#0A0A0A',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        categories: ['entertainment', 'video', 'streaming'],
        shortcuts: [
          {
            name: 'Home',
            short_name: 'Home',
            description: 'Go to home page',
            url: '/',
            icons: [{ src: '/icon-192.svg', sizes: '192x192' }]
          },
          {
            name: 'Movies',
            short_name: 'Movies',
            description: 'Browse movies',
            url: '/movies',
            icons: [{ src: '/icon-192.svg', sizes: '192x192' }]
          },
          {
            name: 'TV Series',
            short_name: 'TV',
            description: 'Browse TV series',
            url: '/tv',
            icons: [{ src: '/icon-192.svg', sizes: '192x192' }]
          },
          {
            name: 'Sports',
            short_name: 'Sports',
            description: 'Watch live sports',
            url: '/sports',
            icons: [{ src: '/icon-192.svg', sizes: '192x192' }]
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@api': resolve(__dirname, './src/api'),
      '@styles': resolve(__dirname, './src/styles'),
      '@assets': resolve(__dirname, './src/assets'),
    },
  },
  base: basePath,
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Named chunks from lazy imports
          if (id.includes('pages/Home')) return 'home'
          if (id.includes('pages/Movies')) return 'movies'
          if (id.includes('pages/TVSeries')) return 'tv'
          if (id.includes('pages/Sports')) return 'sports'
          if (id.includes('pages/LiveTV')) return 'live-tv'
          if (id.includes('pages/Anime')) return 'anime'
          if (id.includes('pages/KenyanSeries')) return 'kenyan-series'
          if (id.includes('pages/Trending')) return 'trending'
          if (id.includes('pages/MyList')) return 'my-list'
          if (id.includes('pages/Profile')) return 'profile'
          if (id.includes('pages/Queue')) return 'queue'
          if (id.includes('pages/WatchHistory')) return 'watch-history'
          if (id.includes('pages/Settings')) return 'settings'
          if (id.includes('pages/MovieDetails') || id.includes('pages/TVDetails')) return 'details'
          if (id.includes('pages/SportsPlayer') || id.includes('pages/WatchPage')) return 'player'
          if (id.includes('pages/Contact') || id.includes('pages/Privacy') || id.includes('pages/Terms') || id.includes('pages/Dmca')) return 'legal'
          if (id.includes('pages/Support')) return 'support'
          if (id.includes('pages/NotFound')) return 'not-found'
          
          // React core
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor'
          }
          // UI components
          if (id.includes('lucide-react')) {
            return 'ui-vendor'
          }
          // API clients
          if (id.includes('axios')) {
            return 'api-vendor'
          }
          // Animation
          if (id.includes('framer-motion')) {
            return 'animation-vendor'
          }
          // Backend services
          if (id.includes('supabase')) {
            return 'supabase-vendor'
          }
          if (id.includes('firebase')) {
            return 'firebase-vendor'
          }
          // Video playback
          if (id.includes('hls.js')) {
            return 'video-vendor'
          }
          // State management
          if (id.includes('zustand')) {
            return 'state-vendor'
          }
          // Utilities
          if (id.includes('fuse.js')) {
            return 'utils-vendor'
          }
          // Sentry
          if (id.includes('@sentry')) {
            return 'sentry-vendor'
          }
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    reportCompressedSize: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    target: 'esnext',
    modulePreload: {
      polyfill: false,
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api/stream': {
        target: process.env.VITE_STREAM_PROXY_URL || 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stream/, ''),
      },
      '/api/support': {
        target: supportServerTarget,
        changeOrigin: true,
      },
      '/api/ai': {
        target: supportServerTarget,
        changeOrigin: true,
      },
    },
  },
})
