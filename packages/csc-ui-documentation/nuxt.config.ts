// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  ssr: false,

  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  build: {
    transpile: ['csc-ui/loader', '@cscfi/csc-ui-vue'],
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('c-'),
    },
  },

  app: {
    pageTransition: { name: 'fade', mode: 'out-in' },
  },

  css: ['~/assets/css/main.css'],

  imports: {
    dirs: ['./stores'],
  },

  // @ts-ignore
  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate'],
  },
});
