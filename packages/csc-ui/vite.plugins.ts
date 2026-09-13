import type { PluginOption } from 'vite';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';

/** Every `c-*` tag is a custom element, never a Vue component to resolve. */
export const isCustomElement = (tag: string): boolean => tag.startsWith('c-');

/**
 * The SFC compile pipeline shared by `vite build` and the Vitest browser
 * project (ADR-0049), so specs exercise exactly the components the bundle
 * ships.
 *
 * Every .vue file in this package is compiled as a custom element so its
 * `<style>` blocks land in a `styles` array on the component (adopted into the
 * shadow root by `defineElement`). A bare `customElement: true` did not produce
 * that array under Vite lib mode in our setup — the file-pattern form does.
 * Tailwind processes `src/tailwind.css?inline`, the shared shadow sheet.
 */
export const sfcPlugins = (): PluginOption[] => [
  vue({
    customElement: /\.vue$/,
    template: { compilerOptions: { isCustomElement } },
  }),
  tailwindcss(),
];
