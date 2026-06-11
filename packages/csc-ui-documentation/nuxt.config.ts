import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

// Dev-only Vite plugin: the docs consume `@cscfi/csc-ui-next` from its built
// `dist` (rebuilt on save by the package's `build:watch`). Vite ignores
// `node_modules` in its watcher, so it never sees those rebuilds. This plugin
// watches the dist dir directly, drops the stale module from the graph, and
// forces a full page reload — which is the only way changed custom elements
// take effect, since the custom-element registry can't be redefined in place.
const cscUiNextDist = fileURLToPath(
  new URL('../csc-ui-next/dist', import.meta.url),
);

function reloadOnCscUiNextRebuild() {
  return {
    name: 'reload-on-csc-ui-next-rebuild',
    apply: 'serve' as const,
    configureServer(server: any) {
      server.watcher.add(cscUiNextDist);
      server.watcher.on('change', (file: string) => {
        if (!file.startsWith(cscUiNextDist)) return;
        for (const mod of server.moduleGraph.getModulesByFile(file) ?? []) {
          server.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

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
    plugins: [tailwindcss(), reloadOnCscUiNextRebuild()],
    // Exclude from dep pre-bundling so Vite serves the dist fresh from disk
    // (not a cached esbuild bundle) on each reload triggered by the plugin.
    optimizeDeps: {
      exclude: ['@cscfi/csc-ui-next'],
    },
  },
});
