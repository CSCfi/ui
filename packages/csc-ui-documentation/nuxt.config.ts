import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  ssr: false,

  devtools: { enabled: false },

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxt/eslint'],

  eslint: {
    config: {
      stylistic: false,
    },
  },

  build: {
    transpile: ['csc-ui/loader', '@cscfi/csc-ui-vue'],
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('c-'),
    },
  },

  app: {
    pageTransition: { name: 'page', mode: 'default' },
    head: {
      title: 'Design System - CSC',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    },
  },

  css: ['~/assets/css/main.css'],

  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate'],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
