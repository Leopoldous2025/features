// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    public: {
      appName: 'AlphaLens Feature Matrix'
    }
  },
  colorMode: {
    preference: 'dark'
  },
  typescript: {
    strict: false,
    typeCheck: false
  },
  nitro: {
    preset: 'vercel'
  }
})
