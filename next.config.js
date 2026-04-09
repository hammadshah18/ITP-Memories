const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  importScripts: ['/sw-custom.js'],
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/memories.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-memories-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-images-cache',
        expiration: {
          maxEntries: 300,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-images-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets-cache',
      },
    },
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'general-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60,
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  webpack: (config, { dev }) => {
    config.resolve = config.resolve || {}
    config.resolve.symlinks = false

    if (process.platform === 'win32' || dev) {
      config.cache = false
    }

    if (process.platform === 'win32') {
      config.snapshot = config.snapshot || {}
      config.snapshot.managedPaths = []
      config.snapshot.immutablePaths = []
    }

    return config
  },
}

module.exports = withPWA(nextConfig)
