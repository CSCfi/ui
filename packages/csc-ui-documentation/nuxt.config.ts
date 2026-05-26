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
    transpile: ['csc-ui/loader', '@cscfi/csc-ui-vue', '@cscfi/csc-ui-next'],
  },

  runtimeConfig: {
    public: {
      // Selects which implementation backend registers `c-*` custom
      // elements. `stencil` keeps today's behaviour; `next` registers
      // the Vue-built versions from `@cscfi/csc-ui-next` first and lets
      // the Stencil loader fill in the rest. Override per build with
      // `CSC_UI_IMPL=next pnpm run dev` (or `build`).
      cscUiImpl: process.env.CSC_UI_IMPL || 'stencil',
    },
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
