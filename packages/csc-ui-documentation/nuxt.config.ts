import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

// Dev-only Vite plugin: the docs consume `@cscfi/csc-ui-next` from its built
// `dist` (rebuilt on save by the package's `build:watch`). Vite ignores
// `node_modules` in its watcher, so it never sees those rebuilds. This plugin
// watches the dist dir directly, drops the stale module from the graph, and
// forces a full page reload — which is the only way changed custom elements
// take effect, since the custom-element registry can't be redefined in place.
//
// Reliability matters here: small source edits were intermittently not picked
// up. Two root causes, both handled below:
//   1. The lib build rewrites a ~550KB `csc-ui-next.js` (Vue is bundled in).
//      Reloading on the first `change` event raced the flush, so the browser
//      re-fetched a half-written/stale bundle. We wait for each file's size to
//      stop changing first (Vite's watcher has no `awaitWriteFinish`).
//   2. Content-hashed chunks change filename between builds, which chokidar
//      reports as `unlink`+`add` — not `change`. We listen to all three.
// A short debounce coalesces the multi-file writes of a single rebuild into
// one reload.
const cscUiNextDist = fileURLToPath(
  new URL('../csc-ui-next/dist', import.meta.url),
);

function reloadOnCscUiNextRebuild() {
  return {
    name: 'reload-on-csc-ui-next-rebuild',
    apply: 'serve' as const,
    configureServer(server: any) {
      server.watcher.add(cscUiNextDist);

      const changed = new Set<string>();
      let debounce: ReturnType<typeof setTimeout> | undefined;

      // Resolve once the file's size is stable across two consecutive reads
      // (or it has been removed), so we never reload mid-write.
      const waitForStableSize = (file: string) =>
        new Promise<void>((resolve) => {
          let last = -1;
          let tries = 0;
          const poll = () => {
            let size: number;
            try {
              size = statSync(file).size;
            } catch {
              return resolve(); // removed mid-rebuild — nothing to wait for
            }
            if ((size === last && size > 0) || tries++ > 50) return resolve();
            last = size;
            setTimeout(poll, 30);
          };
          poll();
        });

      const scheduleReload = () => {
        clearTimeout(debounce);
        debounce = setTimeout(async () => {
          const files = [...changed];
          changed.clear();
          await Promise.all(files.map(waitForStableSize));
          for (const file of files) {
            for (const mod of server.moduleGraph.getModulesByFile(file) ?? []) {
              server.moduleGraph.invalidateModule(mod);
            }
          }
          server.ws.send({ type: 'full-reload' });
        }, 80);
      };

      const onEvent = (file: string) => {
        if (!file.startsWith(cscUiNextDist) || !file.endsWith('.js')) return;
        changed.add(file);
        scheduleReload();
      };

      server.watcher.on('add', onEvent);
      server.watcher.on('change', onEvent);
      server.watcher.on('unlink', onEvent);
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
