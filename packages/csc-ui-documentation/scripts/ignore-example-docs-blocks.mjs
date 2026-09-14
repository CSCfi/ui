/**
 * Canon examples may carry a `<docs>` custom block (`surface: canvas`, read by
 * useExamples.ts from the `?raw` source). @vitejs/plugin-vue emits an import
 * for every custom block and expects a module with a default export; without
 * a handler the build fails, so resolve the block to a no-op. Shared by the
 * Nuxt build and the example-smoke Vitest project (ADR-0049).
 *
 * @type {import('vite').Plugin}
 */
export const ignoreExampleDocsBlocks = {
  name: 'csc-docs:ignore-example-docs-blocks',
  transform(_code, id) {
    if (/\?vue&type=docs/.test(id)) return 'export default () => {}';

    return null;
  },
};
