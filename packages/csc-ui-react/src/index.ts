/**
 * React components for the `@cscfi/csc-ui` custom elements.
 *
 * Importing this package registers the custom elements as a side effect and
 * exposes one typed React component per element. Prop and event `detail`
 * types come from `@cscfi/csc-ui` — import any option/item types you
 * need (e.g. `CSelectItem`) from there.
 */

export * from './components.js';

export {
  applyTheme,
  DEFAULT_SEEDS,
  FAMILIES,
  resetTheme,
  themeToCss,
} from '@cscfi/csc-ui';

export type { Family, ThemeSeeds } from '@cscfi/csc-ui';

export { applyDefaults, DEFAULTABLE_PROPS, resetDefaults } from '@cscfi/csc-ui';

export type { AppDefaults, DefaultableTag } from '@cscfi/csc-ui';

export {
  chartAnatomy,
  chartAnatomyHex,
  chartSlots,
  chartSlotsHex,
  observeThemeMode,
  themeMode,
} from '@cscfi/csc-ui';

export type { ChartAnatomy, ChartSlots, ThemeMode } from '@cscfi/csc-ui';
