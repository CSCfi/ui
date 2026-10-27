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
      'Internal: `c-toasts` renders one per `addToast()` message. Style a toast through `c-toasts::part(toast-root)` and the other `toast-*` parts, listen to `close` on `c-toasts` (the detail is the message), and close one with `removeToast(id)`, where `closeToast()` was.',
    kind: 'tag',
    tag: 'c-toast',
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
  {
    change:
      'Renamed to `select`, as on `c-menu`: its detail is `{ value }`, the item’s new `value` prop, instead of the originating DOM event. It bubbles, so one listener on `c-side-navigation` can handle every item; `c-sub-navigation-item` fires it too.',
    kind: 'event',
    name: 'itemChange',
    tag: 'c-side-navigation-item',
  },
  ...(
    [
      [
        'c-accordion-item',
        'collapsable',
        '`c-accordion` sets it from its `mandatory`.',
      ],
      [
        'c-accordion-item',
        'expanded',
        '`c-accordion` sets it from its `value`: expand items through the accordion’s `value` (or `v-model`), and style an expanded item with `c-accordion-item:state(expanded)`.',
      ],
      ['c-accordion-item', 'outlined', 'set `outlined` on `c-accordion`.'],
      [
        'c-list-item',
        'disabled-by-parent',
        '`c-list` sets it from its `disabled`. Disable the list, or the item itself.',
      ],
      [
        'c-list-item-title',
        'active',
        'the `c-list-item` holding it sets it from its own `active`.',
      ],
      [
        'c-step',
        'complete',
        '`c-steps` sets it from its `value`, the current step’s number.',
      ],
      [
        'c-step',
        'current',
        '`c-steps` sets it from its `value`, the current step’s number.',
      ],
      [
        'c-sub-navigation-item',
        'focusable',
        'the parent `c-side-navigation-item` takes the sub-items of a collapsed item out of the tab order.',
      ],
      ['c-tab', 'active', '`c-tabs` sets it from its `value`.'],
      [
        'c-tab-buttons',
        'value',
        '`c-tabs` sets it from its own `value`. Standalone use moves to `c-button-group`; see Component-specific changes.',
      ],
      ['c-tab-item', 'active', '`c-tabs` sets it from its `value`.'],
      [
        'c-tab-items',
        'disable-animation',
        '`c-tabs` sets it from its own `disable-animation`.',
      ],
      ['c-tab-items', 'value', '`c-tabs` sets it from its own `value`.'],
    ] as const
  ).map(([tag, name, how]) => ({
    change: `Internal: ${how}`,
    kind: 'prop' as const,
    name,
    tag,
  })),
  ...(['position', 'setsize'] as const).map((name) => ({
    change:
      'Removed: the browser counts the tabs of a `c-tabs` itself, for `aria-posinset` and `aria-setsize`.',
    kind: 'prop' as const,
    name,
    tag: 'c-tab',
  })),
  {
    change:
      'A plain `id` on the tab, as on any element. `c-tabs` keeps it for `aria-controls` and generates one only for a tab without one.',
    kind: 'prop',
    name: 'id',
    tag: 'c-tab',
  },
  ...['c-autocomplete', 'c-select'].map((tag) => ({
    change:
      'Removed: it announced a value set from outside, which no value control does any more. Set `value` to `null` (`[]` with `multiple`).',
    kind: 'method' as const,
    name: 'reset',
    tag,
  })),
  ...['c-checkbox', 'c-switch'].map((tag) => ({
    change:
      '`checked` is now the boolean view of `value`: setting it sets `value` to `true-value` or `false-value`, and it reads whether `value` equals `true-value`. A bound `value` wins over a `checked` attribute, where 3.x checked the box when either said so.',
    kind: 'prop' as const,
    meaningChanged: true as const,
    name: 'checked',
    tag,
  })),
  {
    change:
      '`<c-option selected>` sets the initial value silently: only while the value is empty, once, and with no event, so a bound `v-model` or React state does not learn it (3.x emitted `changeValue`). With a bound value, initialise the model instead.',
    kind: 'prop',
    meaningChanged: true,
    name: 'selected',
    tag: 'c-option',
  },
  {
    change:
      'Its fields `currentPage` and `itemsPerPage` are `page` and `pageSize`, and `textOverrides` is the `texts` prop: `itemsPerPageText` → `pageSize`, `prevPage` → `previousPage`, `nextPage`, `pageText({ start, end, count })` → `range(start, end, count)`, `pageOfText({ pageNumber, count })` → `page(page, pageCount)`. The pagination never writes into your object: each pick emits a new one, with `startFrom` and `endTo`, and nothing is emitted at mount or when you set it.',
    kind: 'prop',
    name: 'value',
    tag: 'c-pagination',
  },
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
      'Renamed to `invalid`, with the opposite meaning (ADR-0076): `:valid="!error"` becomes `:invalid="!!error"`, and markup sets a bare `invalid` attribute. A leftover `valid` is ignored, so the error never shows.',
    kind: 'prop' as const,
    name: 'valid',
    tag,
  })),
  ...[
    'c-autocomplete',
    'c-button',
    'c-checkbox',
    'c-otp-input',
    'c-radio-group',
    'c-select',
    'c-slider',
    'c-switch',
    'c-text-field',
  ].map((tag) => ({
    change:
      'A plain `id` on the element itself, as on any element: it no longer reaches the inner control, whose own id lives in the component’s shadow root, out of reach of your page’s `for` and `aria-*` anyway. Name the control with its `label`.',
    kind: 'prop' as const,
    name: 'id',
    tag,
  })),
  {
    change: "Removed: it announced a value set from code. Set `value` to `''`.",
    kind: 'method',
    name: 'reset',
    tag: 'c-otp-input',
  },
  {
    change: 'Removed: it was never read.',
    kind: 'prop',
    name: 'input-id',
    tag: 'c-message',
  },
  ...(
    [
      ['c-checkbox', 'name', '`name` (was `hostName`)'],
      ['c-otp-input', 'autofocus', '`autofocus` (was `hasAutofocus`)'],
      ['c-slider', 'name', '`name` (was `hostName`)'],
      ['c-switch', 'disabled', '`disabled` (was `hostDisabled`)'],
      ['c-tab-buttons', 'disabled', '`disabled` (was `hostDisabled`)'],
      ['c-text-field', 'autofocus', '`autofocus` (was `automaticFocus`)'],
      [
        'c-text-field',
        'autocapitalize',
        '`autocapitalize` (was `automaticCapitalize`), typed as the values the browser knows',
      ],
    ] as const
  ).map(([tag, name, property]) => ({
    change: `The attribute works as in 3.x; the property is ${property}.`,
    kind: 'prop' as const,
    name,
    tag,
  })),
  {
    change:
      'The attribute works as in 3.x and names the range input; there is no property for it any more (it was `ariaLabelInternal`), so set the attribute.',
    kind: 'prop',
    name: 'aria-label',
    tag: 'c-slider',
  },
  ...['c-button', 'c-list-item'].map((tag) => ({
    change:
      'Defaults to `\'\'`, as on a native `<a>`: an `href` opens in the same tab. Add `target="_blank"` where you relied on a new tab.',
    kind: 'prop' as const,
    name: 'target',
    tag,
  })),
  ...['max', 'min', 'segments', 'step', 'value'].map((name) => ({
    change:
      'A number, and its events carry numbers. Attributes still work: `max="8"` reads as `8`.',
    kind: 'prop' as const,
    name,
    tag: 'c-slider',
  })),
  {
    change:
      'Defaults to no unit (it was `%`). Add `unit="%"` to show a percentage.',
    kind: 'prop',
    name: 'unit',
    tag: 'c-slider',
  },
  {
    change:
      'Renamed to `heading` (the glossary’s name, as the `heading` prop). A leftover `slot="header"` matches no slot, so its content disappears.',
    kind: 'slot',
    name: 'header',
    tag: 'c-accordion-item',
  },
  {
    change:
      'Renamed to `content-delay` (`contentDelay`), in milliseconds: `contentdelay="1"` becomes `content-delay="1000"`. A leftover `contentdelay` is ignored, and the message shows without a delay.',
    kind: 'prop',
    name: 'contentdelay',
    tag: 'c-loader',
  },
  {
    change:
      'Removed (ADR-0006): its inline style beat your stylesheet. Set the weight through the link’s part: `c-link::part(root) { font-weight: 400; }`.',
    kind: 'prop',
    name: 'weight',
    tag: 'c-link',
  },
  {
    change:
      'Renamed to `open`. The drawer fires `change:open` with the new state whenever the user opens or closes it — the navigation button, the close button, the backdrop or an item.',
    kind: 'prop',
    name: 'menu-visible',
    tag: 'c-side-navigation',
  },
  {
    change:
      'Removed (ADR-0006): it wrote inline styles. Restyle the drawer through its parts, e.g. `c-side-navigation::part(nav)`.',
    kind: 'prop',
    name: 'styles',
    tag: 'c-side-navigation',
  },
  {
    change:
      'Typed `number` (the current step, counting from 1). An attribute still works: `value="3"` reads as `3`.',
    kind: 'prop',
    name: 'value',
    tag: 'c-steps',
  },
  {
    change:
      'Also takes `null`: every item collapsed. Setting `value` from code no longer fires an event (3.x fired `changeValue`): the value events report what the user does.',
    kind: 'prop',
    name: 'value',
    tag: 'c-accordion',
  },
  {
    change:
      'Setting `value` from code no longer fires an event (3.x fired `changeValue`): the value events report what the user does.',
    kind: 'prop',
    meaningChanged: true,
    name: 'value',
    tag: 'c-tabs',
  },
  {
    change:
      'Renamed to `heading`, like the `heading` prop that sets plain text. A leftover `slot="title"` matches no slot, so its content disappears.',
    kind: 'slot',
    name: 'title',
    tag: 'c-alert',
  },
  ...['grouped', 'tabs'].map((name) => ({
    change:
      'Removed: `c-tab-buttons` set it on its buttons (it was private in 3.x). Group buttons in `c-button-group`, and tabs in `c-tabs`.',
    kind: 'prop' as const,
    name,
    tag: 'c-button',
  })),
  {
    change:
      'Removed: `c-tabs` set it (it was private in 3.x). Inside `c-tabs` nothing changes; standalone use moves to `c-button-group`.',
    kind: 'prop',
    name: 'tabs',
    tag: 'c-tab-buttons',
  },
  {
    change:
      'There never was a `label` slot: 3.x’s docs gave the default slot that name. The label text goes inside the element, as before, or in the new `label` prop.',
    kind: 'slot',
    name: 'label',
    tag: 'c-switch',
  },
  ...(
    [
      [
        'prop',
        'data',
        "Rows are plain objects: `{ name: 'Ada' }`, where 3.x wrapped each cell as `{ name: { value: 'Ada' } }`. A cell’s `formattedValue`, `component` and `children` become the column’s `cell` render function, and `align` / `justify` the column’s `align`. See Component-specific changes.",
      ],
      [
        'prop',
        'external-data',
        'Renamed to `external`. Set `item-count` (`itemCount`) to the total number of rows, so the pager knows how many pages there are.',
      ],
      [
        'prop',
        'footerOptions',
        'Removed: the table’s pager has one look. Translate its texts through `texts`.',
      ],
      [
        'prop',
        'hide-footer',
        'Removed: the table paginates only while `page-size` (`pageSize`) is set. Leave it unset to show every row with no pager.',
      ],
      [
        'prop',
        'horizontal-scrolling',
        'Removed: a table wider than its container now scrolls sideways by default. Set `autohide` for what 3.x did without this prop: move the columns that do not fit into an expandable row.',
      ],
      [
        'prop',
        'loading-text',
        'Moved to `texts.loading` (the `texts` object, set as a property).',
      ],
      [
        'prop',
        'no-data-text',
        'Moved to `texts.noData` (the `texts` object, set as a property). For richer content, use the `empty` slot.',
      ],
      [
        'prop',
        'pagination',
        'Split into props: `page` (was `currentPage`), `page-size` (`pageSize`, was `itemsPerPage`; the table paginates only while it is set), `page-sizes` (`pageSizes`) and, with `external`, `item-count` (`itemCount`). `textOverrides` moves to `texts`. The table computes `startFrom` and `endTo` itself, and has no `totalVisible` or `locale`.',
      ],
      ['prop', 'selectable', 'Replaced by `selection="multiple"`.'],
      ['prop', 'single-selection', 'Replaced by `selection="single"`.'],
      [
        'prop',
        'selection-property',
        'Replaced by `getRowId`, a function returning a row’s id, set as a property: `(row) => String(row.id)`. Without it, a row’s id is its index in `data`, as without `selection-property`.',
      ],
      [
        'prop',
        'sort-by',
        'Merged with `sort-direction` into `sort`, one object set as a property: `sort-by="name" sort-direction="desc"` becomes `{ column: \'name\', direction: \'desc\' }`. Unset, the rows keep their order, where 3.x sorted by the first column.',
      ],
      [
        'prop',
        'sort-direction',
        "Merged with `sort-by` into `sort`, one object set as a property: `{ column: 'name', direction: 'desc' }`. Unset, the rows keep their order, where 3.x sorted ascending.",
      ],
      [
        'event',
        'expand',
        'Replaced by `change:expanded`: its detail is the ids of every expanded row, where 3.x sent `{ active, row }` for the row that toggled. Look the rows up in your `data`.',
      ],
      [
        'event',
        'paginate',
        'Replaced by `change:page` (the page, counting from 1) and `change:page-size` (the page size). A new page size also fires `change:page` with 1.',
      ],
      [
        'event',
        'selection',
        'Replaced by `change:selected`: its detail is the selected rows’ ids, strings from `getRowId`. The rows themselves are the `selectedRows` property.',
      ],
      [
        'event',
        'sort',
        'Replaced by `change:sort`: its detail is `{ column, direction }`, where 3.x sent `{ sortBy, direction }`.',
      ],
      ['method', 'clearSelections', 'Removed: set `selected` to `[]`.'],
      [
        'method',
        'getData',
        'Removed: the table no longer hands back its sorted rows. Sort your own `data` from `change:sort` where you need that order; `selectedRows` holds the selected rows.',
      ],
    ] as const
  ).map(([kind, name, change]) => ({
    change,
    kind,
    name,
    tag: 'c-data-table',
  })),
  {
    change:
      'Removed (ADR-0006): style the panel through `c-menu::part(panel)` and its list through `c-menu::part(list)`.',
    kind: 'prop',
    name: 'content-class',
    tag: 'c-menu',
  },
  ...['custom', 'flat'].map((name) => ({
    change:
      'Removed: the menu draws nothing around its trigger. The element you slot as `slot="trigger"` shows as it is, with no chevron or hover background.',
    kind: 'prop' as const,
    name,
    tag: 'c-menu',
  })),
  {
    change:
      'Removed: the list grows to 80% of the viewport height, then scrolls. Cap it lower with `c-menu::part(list) { max-height: 20rem; }`.',
    kind: 'prop',
    name: 'items-per-page',
    tag: 'c-menu',
  },
  {
    change: 'Removed: the menu has one size.',
    kind: 'prop',
    name: 'small',
    tag: 'c-menu',
  },
  {
    change:
      'The default slot holds the menu’s items (`c-menu-item`, `c-menu-label`, `c-divider`). The trigger, 3.x’s default slot content, moves to `slot="trigger"`: slot your own button there.',
    kind: 'slot',
    meaningChanged: true,
    name: '',
    tag: 'c-menu',
  },
  {
    change:
      'Removed: it was the list `c-menu` rendered for its `items`. Style the list through `c-menu::part(list)`.',
    kind: 'tag',
    tag: 'c-menu-items',
  },
  {
    change:
      'Removed: open modals stack themselves, above the page and below toasts, and a modal opened from another stacks over it. Keep your page’s own `z-index` values below 1000 so a modal covers them.',
    kind: 'prop',
    name: 'z-index',
    tag: 'c-modal',
  },
  {
    change:
      'Escape closes a modal only when it is `dismissable`, as a backdrop click does; 3.x closed every modal on Escape. A modal that is not dismissable nudges instead, so give it a close button.',
    kind: 'prop',
    meaningChanged: true,
    name: 'dismissable',
    tag: 'c-modal',
  },
  {
    change: 'Removed: set the group’s `value` to the radio’s `value`.',
    kind: 'prop',
    name: 'checked',
    tag: 'c-radio',
  },
  {
    change:
      'Removed: it was never read. Recolour a radio through `c-radio::part(indicator)`; its `color` tints the ring, the dot and the focus ring.',
    kind: 'prop',
    name: 'color',
    tag: 'c-radio-group',
  },
  {
    change:
      'Removed: author the options as slotted `<c-radio value="…">Label</c-radio>` elements, with `disabled` on a radio that cannot be picked.',
    kind: 'prop',
    name: 'items',
    tag: 'c-radio-group',
  },
  {
    change:
      'Removed with `items`: the value is the picked radio’s `value`. Look your object up from it.',
    kind: 'prop',
    name: 'return-object',
    tag: 'c-radio-group',
  },
  {
    change:
      "A string, the picked radio’s `value`, or `null` with none picked. A number still picks the radio whose `value` matches it, but the events carry the string (`'1'`, not `1`).",
    kind: 'prop',
    name: 'value',
    tag: 'c-radio-group',
  },
  {
    change:
      'Defaults to `var(--c-primary)`, the theme’s primary colour, which follows dark mode. It was the palette step `var(--c-primary-600)`.',
    kind: 'prop',
    name: 'color',
    tag: 'c-spinner',
  },
  {
    change:
      'Removed. To make a tag fill its row, widen the element and let its box grow: `c-tag { width: 100%; } c-tag::part(root) { flex-grow: 1; }`.',
    kind: 'prop',
    name: 'block',
    tag: 'c-tag',
  },
  {
    change:
      'Removed. To stretch a tag over the free space of its `c-tags` row, let the element and its box grow: `c-tag, c-tag::part(root) { flex-grow: 1; }`.',
    kind: 'prop',
    name: 'fit',
    tag: 'c-tag',
  },
  {
    change:
      'Typed as the native values, `on` and `off`, so `autocorrect="off"` works as in 3.x. The property also takes `true` and `false`, like the platform’s `autocorrect`.',
    kind: 'prop',
    name: 'autocorrect',
    tag: 'c-text-field',
  },
  {
    change:
      'Typed as the types the field is built for: `text`, `email`, `password`, `search`, `tel`, `url`, `number` and `date`. The others have their own components: `c-time-picker`, `c-color-picker`, `c-slider`, `c-file-upload`, and `c-date-picker` for a month.',
    kind: 'prop',
    name: 'type',
    tag: 'c-text-field',
  },
  {
    change:
      'Removed: use `c-text-field`. Its input lives in its shadow root, so a native `<form>` does not submit it: send the field’s `value` from your code.',
    kind: 'tag',
    tag: 'c-text-field-open',
  },
];
