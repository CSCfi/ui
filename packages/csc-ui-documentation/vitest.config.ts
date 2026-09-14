import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

import {
  browserProject,
  ignoreBenignBrowserNotices,
} from '../../vitest.browser.shared';
import { ignoreExampleDocsBlocks } from './scripts/ignore-example-docs-blocks.mjs';

// Example smoke (CONTEXT.md "Example smoke", ADR-0049): mount every canon in
// app/examples against the BUILT @cscfi/csc-ui, exactly as the docs site
// does — plain @vitejs/plugin-vue (not custom-element mode), c-* tags left to
// the browser. No Nuxt.
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: { isCustomElement: (tag) => tag.startsWith('c-') },
      },
    }),
    ignoreExampleDocsBlocks,
  ],
  test: {
    browser: browserProject('examples'),
    fileParallelism: false,
    include: ['tests/**/*.spec.ts'],
    name: 'examples',
    onUnhandledError: ignoreBenignBrowserNotices,
    root: fileURLToPath(new URL('.', import.meta.url)),
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 20_000,
  },
});
