// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@vite-pwa/nuxt'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'AtYourDoor',
      short_name: 'AYD',
      description: 'Application de livraison de repas',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#4CAF50',
      orientation: 'portrait',
      lang: 'fr-FR',
      icons: [
        {
          src: '/images/home/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/images/home/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    injectManifest: {
      swSrc: 'public/service-worker.js',
    }
  },
  i18n: {
    locales: [
      {
        code: 'fr',
        name: 'Français',
        file: 'fr.json',
      },
      {
        code: 'en',
        name: 'English',
        file: 'en.json',
      }
    ],
    defaultLocale: 'fr',
    langDir: 'locales/',
    vueI18n: 'locales/i18n.config.mjs',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: true,
      fallbackLocale: 'fr'
    }
  }
})