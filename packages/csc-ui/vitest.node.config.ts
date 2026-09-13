import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Pure helpers, the API snapshot, toolchain parity — nothing that touches a
// custom element (DOM shims cannot mount them; ADR-0049).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.node.spec.ts'],
    name: 'node',
    root: fileURLToPath(new URL('.', import.meta.url)),
  },
});
