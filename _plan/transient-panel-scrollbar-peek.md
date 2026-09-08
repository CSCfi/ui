# Transient list panels: hide the scrollbar, snap to a peek

Grilled 2026-09-04. Decisions are recorded in ADR-0043 and the **Peek** term in
CONTEXT.md; this file is the execution plan.

## Decisions (settled)

1. **Scope**: `c-menu` panel, `c-menu-item` submenu panel, `c-dropdown` list
   (behind `c-select`), `c-autocomplete` list. Not data table, side nav, page,
   card; not `c-popover` (no scroll container).
2. **Cue**: the **peek** — an overflowing panel ends at an item row's midpoint.
   Row N (`itemsPerPage`) when that prop caps the list, else the last item row
   under the ceiling. Labels/dividers are never the peek row.
3. **Computation**: one shared measuring helper for all four panels, replacing
   the `42 * (itemsPerPage + 0.5)` constants.
4. **Term**: *Peek* (CONTEXT.md, Overlays section).
5. **Docs**: per-component `usage.md`, creating `c-select/usage.md` and
   `c-menu/usage.md` (intro paragraph + a "Scrolling" section).
6. **ADR-0043** written.

## Implementation

### 1. Shared utility for hiding (`src/tailwind.css`)

Add next to the `rounded-csc-*` utilities:

```css
@utility scrollbar-hidden {
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}
```

Replace `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden` in
`CAutocomplete.vue` `list` with `scrollbar-hidden`; add it to `CMenu.vue`
`list`, `CMenuItem.vue` submenu list, `CDropdown.vue` `list` (and change that
one from `overflow-y-scroll` to `overflow-y-auto`).

Hazard (memory `project_csc_ui_new_sfc_tailwind_scan`): a new utility may be
missing from dist on the first build — grep dist CSS for `scrollbar-width` and
rebuild if absent.

### 2. Shared measuring helper (`src/shared/peekCap.ts`)

```ts
export interface PeekCapOptions {
  /** Item rows in visual order (c-menu-item hosts or li[role=option]). */
  rows: HTMLElement[];
  /** Rows before the peek; 0 = no row cap. */
  itemsPerPage: number;
  /** Max list height in px (80vh, viewport fit, …). */
  ceiling: number;
}
/** Returns the max-height to apply, or null when the list needs no cap. */
export const peekCap = (list: HTMLElement, o: PeekCapOptions): number | null
```

Algorithm (positions relative to the list's scroll content, via
`getBoundingClientRect()` deltas + `list.scrollTop`, not `offsetTop` — the
offsetParent differs per panel):

- `content = list.scrollHeight`. If `content <= ceiling` and
  (`itemsPerPage <= 0` or `rows.length <= itemsPerPage`) → return `null`
  (clear the inline max-height).
- `mid(i) = top(rows[i]) + height(rows[i]) / 2`.
- `cap = itemsPerPage > 0 && rows.length > itemsPerPage ? mid(itemsPerPage) : Infinity`.
- If `cap > ceiling`: `cap = max { mid(i) | mid(i) <= ceiling }`, falling
  back to `ceiling` when no midpoint fits (one giant row).
- Return `Math.round(cap)`.

Measure rows by their rendered box. `c-menu-item` hosts are `:host{display:block}`
(the focusable-box escape hatch), so their rect is real; `li[role=option]` rows
are ordinary boxes. `c-menu-label` / `c-divider` hosts are the global
`display: contents` and are never candidates, so they need no measuring.

Call sites and their inputs:

| Panel | rows | itemsPerPage | ceiling | re-run on |
|---|---|---|---|---|
| `CMenu.vue` | `getRootItems()` | 0 | `0.8 * innerHeight` minus list padding | open (`onToggle`), `slotchange` |
| `CMenuItem.vue` submenu | its `slot="submenu"` `c-menu-item` children | 0 | same | submenu open, slotchange |
| `CDropdown.vue` | `li[role=option]` | `props.itemsPerPage` | viewport-fit height minus the moved `c-input` height + paddings (replaces the hard-coded `+ 60`) | `version` bump, open, `isMobile` false only |
| `CAutocomplete.vue` | `li[role=option]` | `props.itemsPerPage` | `0.8 * innerHeight` minus the search row height | `filteredOptions` watch, open |

The existing `max-h-[80vh]` classes stay as the outer safety ceiling; the helper
writes the snapped value as an inline `max-height` on the list.

### 3. Docs

- `c-autocomplete/usage.md`: add `## Scrolling` — panel hides the scrollbar,
  a half-visible row (the peek) shows there is more, `items-per-page` sets how
  many full rows show, restore with
  `c-autocomplete::part(list) { scrollbar-width: auto; }`.
- `c-select/usage.md` (new): one-paragraph description (fills the empty
  manifest description) + the same section with `c-select::part(list)`.
- `c-menu/usage.md` (new): one-paragraph description + section; no
  `items-per-page`; `c-menu::part(list)` and `c-menu-item::part(submenu)`.
- `c-menu-item/usage.md`: one sentence pointing at the submenu part.

Run `pnpm docs:manifest` afterwards; the descriptions flow into the manifest,
IDE data and the React wrapper JSDoc.

### 4. Changeset

`pnpm changeset` → patch for `@cscfi/csc-ui` (fixed group carries the React
wrapper). Wording: "Fix(c-menu, c-select, c-autocomplete): menu, submenu and
select panels hide their scrollbar like the autocomplete already did; an
overflowing panel now always ends on a half-visible row so it is clear more
items follow. Restore the scrollbar with `::part(list)` / `::part(submenu)`."

### 5. Verification

- `pnpm build` in `packages/csc-ui`, then `pnpm lint:tokens`, `pnpm lint:a11y`.
- Visual check (memory `project_csc_ui_next_visual_verify`): screenshot a
  12-item `c-select`, a 12-item `c-autocomplete`, a menu with labels + divider
  + 25 items at a 500px-tall viewport, and a long submenu, in light and dark.
  Expect: no scrollbar, last visible row cut at its midpoint, never a label.
- Standalone `c-dropdown` with `items-per-page="0"` and 40 items: peek under
  the ceiling. `c-select` opened near the bottom of the viewport (flips up):
  the viewport-fit ceiling still snaps.
- Mobile width: full-screen dropdown, no scrollbar, no cap.

## Out of scope

- `itemsPerPage` on `c-menu`.
- Fade / scroll-shadow edges.
- Scrollbars on persistent containers.

## Outcome (2026-09-04)

Implemented as planned, with three deviations found during execution:

- **Standard-only hide.** The utility carries `scrollbar-width: none` alone.
  Chrome ignores `::-webkit-scrollbar` while `scrollbar-width` is set but lets
  it win again under `auto`, so the WebKit rule would have defeated the
  documented `::part() { scrollbar-width: auto }` restore.
- **Row-set re-caps wait a frame.** A `flush: 'post'` watcher on the
  autocomplete's `filteredOptions` ran before the `<li>` patch (single
  MutationObserver log: style writes, then the row removals) and measured the
  outgoing rows. Both the autocomplete and dropdown watchers now defer via
  `requestAnimationFrame`; the open paths cap synchronously inside their
  existing measuring frame.
- **Dropdown ceiling via `scrollHeight`.** Under the viewport-fit branch the
  dialog's own rect is capped by the UA `dialog:modal` max-height, so
  "dialog height minus list height" went negative. The dialog's max-height is
  remembered, and the list ceiling is that minus `dialog.scrollHeight -
  list.offsetHeight`, applied one frame after the field moves slots. This also
  fixes the pre-existing spill of an uncapped list past the dialog and viewport.

Verified headless (playwright-core + chromium-1223, light and dark): in every
overflowing scenario the peek row's midpoint sits 0px from the list edge with
`scrollbar-width: none` — select at 6 rows (273px), select with
`items-per-page="0"` in a cramped viewport (231px inside a 300px dialog cap),
autocomplete (277px, cap cleared after filtering to 3 rows), menu with a label
and divider (381px), submenu (384px).
