/**
 * What happened to each 3.x name an upgrade can trip over: the migration
 * page's "3.x API, name by name" lookup (ADR-0027 amendment). The 3.x side
 * comes from `scripts/v3-api.json` (extracted from the 3.0.19 readmes), and
 * `scripts/check-migration-guide.mjs` fails the docs lint when a 3.x name
 * that is gone, or whose default or type changed, has no entry here — or
 * when an entry names something that did not change.
 *
 * A change of meaning under an unchanged name, type and default is
 * invisible to that check; its entry sets `meaningChanged`.
 */
export interface V3ApiChange {
  /** What to do in 4.x. Plain text; `backticks` mark code. */
  change: string;
  kind: V3ApiKind;

  /** The name, type and default are unchanged, but the behaviour is not. */
  meaningChanged?: true;

  /**
   * The 3.x name: a prop's attribute (its property name when it had no
   * attribute), `''` for the default slot, `'*'` for every name of this
   * kind. Omitted for a tag.
   */
  name?: string;

  /** The 3.x tag, or `'*'` for every tag. */
  tag: string;
}

export type V3ApiKind =
  | 'cssProperty'
  | 'event'
  | 'method'
  | 'prop'
  | 'slot'
  | 'tag';

export const V3_API_CHANGES: V3ApiChange[] = [
  {
    change:
      'Per-component CSS custom properties are gone. Restyle the component’s parts with `::part()`; see Styling & customization.',
    kind: 'cssProperty',
    name: '*',
    tag: '*',
  },
  ...['c-autocomplete', 'c-select', 'c-text-field'].flatMap((tag) => [
    {
      change:
        'Removed: it was never wired to anything. Keep validation in your app and show its result with `error-message`.',
      kind: 'prop' as const,
      name: 'validate',
      tag,
    },
    {
      change:
        'Removed: it was never wired to anything. Keep validation in your app and show its result with `error-message`.',
      kind: 'prop' as const,
      name: 'validate-on-blur',
      tag,
    },
  ]),
  ...[
    'c-autocomplete',
    'c-checkbox',
    'c-message',
    'c-otp-input',
    'c-radio-group',
    'c-select',
    'c-text-field',
  ].map((tag) => ({
    change:
      'Renamed to `error-message` (`errorMessage` as a property). It has no default text: an invalid control without one keeps showing its hint.',
    kind: 'prop' as const,
    name: 'validation',
    tag,
  })),
  {
    change:
      'Removed with the query API. For an async data source, set `external` and listen to `change:query`; the detail is the query.',
    kind: 'event',
    name: 'changeQuery',
    tag: 'c-autocomplete',
  },
  ...['minimum-query-length', 'minimum-query-length-message', 'query'].map(
    (name) => ({
      change:
        'Removed with the query API. For an async data source, set `external` and listen to `change:query`, and decide in your handler when a query is long enough.',
      kind: 'prop' as const,
      name,
      tag: 'c-autocomplete',
    }),
  ),
  {
    change:
      'Moved to `texts.noResults` (the `texts` object, set as a property).',
    kind: 'prop',
    name: 'no-matching-items-message',
    tag: 'c-autocomplete',
  },
  {
    change:
      'Replaced by `columns`: plain domain objects in `data`, and custom cells as render functions. See Component-specific changes.',
    kind: 'prop',
    name: 'headers',
    tag: 'c-data-table',
  },
  {
    change: 'Internal. Use `c-select`, which renders its own panel.',
    kind: 'tag',
    tag: 'c-dropdown',
  },
  {
    change:
      'Internal. Use the field for your value: `c-text-field`, `c-number-field`, `c-select` and so on.',
    kind: 'tag',
    tag: 'c-input',
  },
  {
    change:
      'Author the menu with slotted `c-menu-item` and `c-menu-label` elements. Activating a leaf item fires `select`.',
    kind: 'prop',
    name: 'items',
    tag: 'c-menu',
  },
  {
    change: 'Removed: it was internal in 3.x.',
    kind: 'tag',
    tag: 'c-backdrop',
  },
  {
    change: 'Removed: it was internal in 3.x.',
    kind: 'tag',
    tag: 'c-ripple',
  },
  {
    change:
      'Removed. Use your own flex container (`display: flex` plus `gap`).',
    kind: 'tag',
    tag: 'c-row',
  },
  {
    change:
      'Removed. Give the element you want pushed to the far edge `margin-inline-start: auto`, or use your own `flex-grow` filler.',
    kind: 'tag',
    tag: 'c-spacer',
  },
  {
    change: 'Removed, with no replacement.',
    kind: 'tag',
    tag: 'c-swiper',
  },
  {
    change: 'Removed with `c-swiper`, with no replacement.',
    kind: 'tag',
    tag: 'c-swiper-tab',
  },
  {
    change:
      'Standalone use moves to `c-button-group` (same markup); `c-tab-buttons` is now only the tab strip inside `c-tabs`. See Component-specific changes.',
    kind: 'prop',
    name: 'mandatory',
    tag: 'c-tab-buttons',
  },
  {
    change:
      "Standalone use moves to `c-button-group`, which fires `change`, `update:value` and `input`. Deselecting emits `null` (was `''`).",
    kind: 'event',
    name: 'changeValue',
    tag: 'c-tab-buttons',
  },
  ...(['tabChange', 'tabFocus'] as const).flatMap((name) =>
    ['c-button', 'c-tab'].map((tag) => ({
      change:
        'Internal: it only wires the tab to `c-tabs`, and stops there. Listen to `c-tabs`, whose `change` carries the picked tab’s value.',
      kind: 'event' as const,
      name,
      tag,
    })),
  ),
  {
    change:
      'Internal: it only tells `c-tab-items` to re-measure, and stops there. Nothing to listen to.',
    kind: 'event',
    name: 'contentChange',
    tag: 'c-tab-item',
  },
  {
    change:
      'Internal: it only wires the item to `c-accordion`, and stops there. Listen to `c-accordion`, whose `change` carries the expanded value.',
    kind: 'event',
    name: 'itemChange',
    tag: 'c-accordion-item',
  },
  ...[
    'c-accordion',
    'c-autocomplete',
    'c-checkbox',
    'c-pagination',
    'c-radio-group',
    'c-select',
    'c-switch',
    'c-tabs',
  ].map((tag) => ({
    change:
      'Use `change`: it carries the new value as `detail`, as `changeValue` did. In a Vue template bind `v-model` or `@change`; in React, `onChange`.',
    kind: 'event' as const,
    name: 'changeValue',
    tag,
  })),
  {
    change:
      'Use `change`: it carries `false` when the modal dismisses itself. In a Vue template bind `v-model` or `@change`; in React, `onChange`.',
    kind: 'event',
    name: 'changeValue',
    tag: 'c-modal',
  },
  {
    change:
      '`update:value` (`onUpdateValue` in React) carries the text on every keystroke, as `changeValue` did; `change` carries it when it is committed (Enter, or leaving the field). In a Vue template bind `v-model`, or `@input` reading the element’s `value`.',
    kind: 'event',
    name: 'changeValue',
    tag: 'c-text-field',
  },
  {
    change:
      '`update:value` (`onUpdateValue` in React) carries the value on every move, as `changeValue` did; `change` carries it once on release, and on each arrow-key step. In a Vue template bind `v-model`, or `@input` reading the element’s `value`.',
    kind: 'event',
    name: 'changeValue',
    tag: 'c-slider',
  },
  {
    change:
      '`update:value` (`onUpdateValue` in React) carries the digits entered so far on every change, where `changeValue` carried `null` until the code was complete. `completion` still carries the complete code, and `change` carries the digits on Enter or when focus leaves them.',
    kind: 'event',
    name: 'changeValue',
    tag: 'c-otp-input',
  },
  {
    change: 'Removed: 3.x declared it but never dispatched it.',
    kind: 'event',
    name: 'changeValue',
    tag: 'c-steps',
  },
];
