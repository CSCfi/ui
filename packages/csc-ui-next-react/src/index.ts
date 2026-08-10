/**
 * React components for the `@cscfi/csc-ui-next` custom elements.
 *
 * Importing this package registers the custom elements as a side effect and
 * exposes one typed React component per element. Prop and event `detail`
 * types come from `@cscfi/csc-ui-next` — import any option/item types you
 * need (e.g. `CSelectItem`) from there.
 */

export * from './components.js';

export { applyTheme, resetTheme, themeToCss } from '@cscfi/csc-ui-next';
export type { Family, ThemeSeeds } from '@cscfi/csc-ui-next';
