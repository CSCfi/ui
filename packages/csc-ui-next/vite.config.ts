import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'csc-ui-next',
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
  ],
});
