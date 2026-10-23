import vue from '@vitejs/plugin-vue';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

import {
  browserProject,
  ignoreBenignBrowserNotices,
} from '../../vitest.browser.shared';
import { ignoreExampleDocsBlocks } from './scripts/ignore-example-docs-blocks.mjs';

// The changesets pre tag (null outside pre mode): the axe baseline must be
// empty once it leaves `alpha`.
const prePath = fileURLToPath(
  new URL('../../.changeset/pre.json', import.meta.url),
);

const pre = existsSync(prePath)
  ? JSON.parse(readFileSync(prePath, 'utf8'))
  : null;

declare module 'vitest' {
  export interface ProvidedContext {
    preTag: null | string;
  }
}

// Example smoke (CONTEXT.md "Example smoke", ADR-0049): mount every canon in
// app/examples against the BUILT @cscfi/csc-ui, exactly as the docs site
// does — plain @vitejs/plugin-vue (not custom-element mode), c-* tags left to
// the browser. No Nuxt. The React flavor's canons compile with React's JSX
// runtime (the docs tsconfig's JSX is Vue's) against the built
// @cscfi/csc-ui-react.
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
    tsconfigRaw: {
      compilerOptions: { jsx: 'react-jsx', jsxImportSource: 'react' },
    },
  },
  // Discovered mid-run, these would reload the page under a running spec.
  optimizeDeps: {
    include: [
      '@cscfi/csc-ui-react > @lit/react',
      'axe-core',
      'react',
      'react-dom',
      'react-dom/client',
    ],
  },
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
    provide: { preTag: pre?.mode === 'pre' ? pre.tag : null },
    root: fileURLToPath(new URL('.', import.meta.url)),
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 20_000,
  },
});
