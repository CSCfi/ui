import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

import { copyStyles } from './scripts/copy-styles.js';

// `vite build` empties `dist` on every (re)build, including each incremental
// watch rebuild. The style-dictionary output lives in `src/styles` and must be
// copied back into `dist/styles` *after* each write — otherwise the package's
// `./css/*` export (→ `dist/styles/css/*`) 404s in watch mode. `writeBundle`
// fires once per completed build, after the output has been written.
const copyStylesPlugin = () => ({
  name: 'csc-copy-styles',
  writeBundle() {
    copyStyles();
  },
});

// Same dist-wipe problem for the docs pipeline: `dist/custom-elements.json`
// and `dist/docs/` are produced by the analyzer, not by vite, so
// every (re)build deletes them — and the docs site's dev server fails to
// resolve `@cscfi/csc-ui/custom-elements.json`. Regenerate after each
// write. Non-strict and quiet here (mid-edit sources may transiently fail
// lint); the `build` script's separate `docs:manifest:strict` run is the gate.
const docsManifestPlugin = () => ({
  name: 'csc-docs-manifest',
  writeBundle() {
    spawn(process.execPath, [resolve(__dirname, 'scripts/analyzer/index.mjs')], {
      cwd: __dirname,
      stdio: 'ignore',
    });
  },
});

// In watch mode, do NOT empty `dist` on each rebuild. vite would otherwise
// delete every file (including `styles/css/*` and `custom-elements.json`, which
// are regenerated afterwards in `writeBundle`) leaving a sub-second window where
// they 404 — the docs dev server hits this on HMR when it re-resolves the global
// token CSS. Overwriting in place removes the window. A one-shot production
// build still empties for a clean output.
const isWatch = process.argv.includes('--watch');

export default defineConfig({
  build: {
    cssCodeSplit: false,
    emptyOutDir: !isWatch,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'csc-ui',
      formats: ['es'],
    },
    rollupOptions: {
      // Bundle Vue so the output is consumer-framework-agnostic — a vanilla
      // HTML page can include the bundle and get working custom elements
      // without any Vue runtime on the page.
      external: [],
    },
    target: 'es2020',
  },
  // Bundled Vue ships as the `esm-bundler` build, which references
  // `process.env.NODE_ENV` and expects the consuming bundler to replace it.
  // Vite's *lib* mode does not, so the output threw `process is not defined`
  // when loaded as plain browser ESM (the vanilla-HTML use case below). Inline
  // it to 'production' at build time: this is a prebuilt distributable, so it
  // ships the production Vue (no dev warnings) and needs no `process` global.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [
    vue({
      // Treat every .vue file in this package as a custom element so its
      // <style> blocks are compiled into a `styles` array attached to the
      // component (and inlined into the shadow root by `defineCustomElement`).
      // A bare `customElement: true` did not produce that array under Vite
      // lib mode in our setup — the file-pattern form does.
      customElement: /\.vue$/,
      template: {
        compilerOptions: {
          // Mark `c-*` tags as custom elements so Vue doesn't try to resolve
          // them as Vue components inside SFC templates.
          isCustomElement: (tag) => tag.startsWith('c-'),
        },
      },
    }),
    tailwindcss(),
    copyStylesPlugin(),
    docsManifestPlugin(),
  ],
});
