# 88. Icon slots size the icons that set no size

Date: 2026-11-16

## Status

Accepted. Lands in the release candidates, before `4.0.0`. Follows ADR-0087,
which did the same for c-status's marker.

## Context

A `c-icon` drew at 24px unless given `size`, and the components with an
**icon slot** (c-button, c-icon-button, c-menu-item, c-accordion-item,
c-breadcrumb-item) left it at that. A 24px icon is too large in a 28px small
button or a 14px menu row. The docs set `size` by hand on every breadcrumb
icon, and c-icon-button's usage told consumers to size the icon to fit while
its own sizes example drew 24px icons at all three sizes.

c-status had just sized its slotted icon through a private `--_c-icon-size`
hook that wins over `size`. The other slots cannot do the same: the library's
own icon buttons tune `size` per glyph. In one 28px button the field chevrons
are 24px and the close icons 20px, and the tag's close is 16px.

## Decision

- **Each icon slot sizes an icon that sets none:**
  - c-button: 20px on a small button, 24px on default and large ones.
  - c-icon-button: 18, 22 or 24px (x-small, small, default), the sizes it
    already gave a slotted `<svg>`.
  - c-menu-item: 18px, the size of its check mark and chevron.
  - c-accordion-item: 24px, its icon row.
  - c-breadcrumb-item: 20px in the row (c-button's small size) and 18px folded
    (a menu row).
- **A `c-icon` with its own `size` keeps it**, whether it was set as an
  attribute or a property. **c-status is the exception**: its halo is a fixed
  box, so it sizes any icon in it (ADR-0087).
- **c-icon leaves `size` unset until it is given one.** An icon without a
  `size` reads a private `--_c-icon-default-size` before the built-in 24px.
  Each slot sets that property on its icon wrapper, and sizes a plain `<svg>`
  or `<img>` with `::slotted()`.
- **A new analyzer tag, `@default <built-in>`, documents the default of such a
  prop**: one that is not app-defaultable but is `undefined` in
  `withDefaults`. The manifest and the API snapshot still read
  `number = 24`, and lint rejects the tag over a `withDefaults` value, beside
  `@defaultable`, or with a literal that does not fit the prop's type.
- **That switch is not breaking, and the break check reports it.** Nothing
  visible changes, and app-defaultable props already read `undefined` while
  unset, with their built-in only documented. The written-back `size="24"`
  was a Vue side effect, never documented. The API snapshot lists such props
  under `unsetUntilSet`, and the break check reports a prop that joins or
  leaves that list as an addition, so the switch never passes unseen. A
  changed `@default` literal is still a changed default, so it is still
  breaking.
- **The library's own icons keep their look.** Icons inside small icon buttons
  that relied on the 24px default now set `size="24"`: the arrows of c-tabs
  and c-tab-buttons, c-pagination's chevrons and c-data-table's row expander.

## Considered options

- **The slot always wins, as in c-status.** One rule everywhere, but every
  tuned icon in an icon button would become one size, and a consumer could
  not adjust a glyph that looks too small or too large.
- **Match `::slotted(c-icon:not([size]))` and leave c-icon alone.** Vue 3.5
  writes a custom element's `withDefaults` value back to the host attribute
  (vuejs/core#9006), so every icon carried `size="24"`. Neither a selector
  nor a script could tell an unsized icon from one set to 24.
- **Document it and leave the sizing to consumers.** Every consumer would
  size every icon by hand, and the docs examples would keep drifting.

## Consequences

- An unsized `c-icon`'s `size` property reads `undefined`, and the element no
  longer carries a `size="24"` attribute. Outside an icon slot it still draws
  at 24px.
- The property inherits, so a `c-icon` nested inside other content in the slot
  also takes the slot's size. `::slotted()` reaches only a plain `<svg>` or
  `<img>` placed directly in the slot.
