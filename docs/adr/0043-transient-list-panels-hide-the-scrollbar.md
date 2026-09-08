---
status: accepted
---

# Transient list panels hide the scrollbar; the peek is the overflow cue

The transient list panels — `c-menu` and submenu panels, `c-dropdown`'s
listbox behind `c-select`, and `c-autocomplete`'s options list — hide their
native scrollbar. In its place an overflowing panel always ends at a row's
midpoint, the **peek** (CONTEXT.md): the half-visible row is the one cue that
more rows follow. Persistent scroll containers (`c-data-table`,
`c-side-navigation`, `c-page`, `c-card`) keep native scrollbars.

## Context

The four panels had three different looks for the same kind of surface.
`c-autocomplete` already hid its scrollbar (PR #250, an incidental fix with no
recorded rationale). `c-dropdown` used `overflow-y-scroll`, which paints the
track even when nothing overflows on classic-scrollbar platforms (Windows,
Linux, macOS "always show"). `c-menu` and submenus showed a scrollbar only on
overflow, capped at 80vh.

Hiding a scrollbar removes the only signal a mouse user has that a list
continues — the standard accessibility objection to the practice.
`c-dropdown` and `c-autocomplete` already mitigated it: their list is capped at
`itemsPerPage + 0.5` rows (a hard-coded 42px row), so a half row shows below
the fold. Menus had no such cue; a long menu cut at 80vh could land on a row
boundary and read as complete. Menu rows are also not uniform — 40px items,
`c-menu-label` headings and `c-divider` rules share one list — so a constant
cannot place the cut.

## Decisions

- **Scope is the transient list panel, not "scroll containers".** The rule
  covers exactly the panels that are native popovers holding a list of rows.
  Long-lived content keeps its scrollbar because users rely on it for
  position; `c-popover` is untouched because it has no scroll container.
- **The peek is the single overflow cue.** An overflowing panel ends at a row
  midpoint: the `itemsPerPage`-th row where that prop caps the list, otherwise
  the last item row that fits under the panel's ceiling. Only item rows
  (`c-menu-item`, `li[role="option"]`) can be the peek row — a half-visible
  label or divider is not a cue, so the cap snaps down past them. Ceilings are
  unchanged (80vh for menus, submenus and the autocomplete card; the
  dropdown's viewport-fit logic).
- **One shared measuring helper computes the cap for all four panels.** It
  reads the real row boxes and replaces the `42 * (itemsPerPage + 0.5)`
  constants in `c-dropdown` and `c-autocomplete`. It re-runs on open and
  whenever the row set changes (menu `slotchange`, autocomplete filtering,
  dropdown item updates) — those re-runs wait one animation frame, because a
  `flush: 'post'` watcher was observed running ahead of the row patch and
  measuring the outgoing rows. One mechanism, one place to test, and slotted
  `c-option` rows taller than 42px stop breaking the cut.
- **Hiding is one library-internal Tailwind utility** carrying the standard
  `scrollbar-width: none` only, applied to the `list` part of `c-menu`,
  `c-select`/`c-dropdown` and `c-autocomplete` and the `submenu` part of
  `c-menu-item`. No `::-webkit-scrollbar` rule: every browser in the ADR-0008
  support matrix has the standard property, and Chrome lets a
  `::-webkit-scrollbar { display: none }` win again the moment a consumer
  sets `scrollbar-width: auto`, which would break the restore route below.
  `c-dropdown`'s list moves from `overflow-y-scroll` to `overflow-y-auto`.
- **Restoring the scrollbar is a `::part()` rule, not a prop** (ADR-0006):
  `scrollbar-width: auto` on the part named above. Each affected component
  documents this in its `usage.md`; `c-select` and `c-menu` gain one.

## Considered alternatives

- **Keep native scrollbars and only unify** (`auto` everywhere). Rejected:
  the panel's look would still depend on the platform's scrollbar style, and
  the design direction is scrollbar-free transient panels.
- **Fade or scroll-shadow edges** as the cue. Works for any row height and
  indicates both ends, but it is a new visual the system would have to own
  across light, dark and forced-colors, plus scroll-position tracking in four
  components — while the peek already existed in two of them. Rejected.
- **Hide only, no cue for menus.** Cheapest; rejected because a long menu cut
  on a row boundary looks complete.
- **Hide scrollbars library-wide.** Rejected: removes position indication
  from long-lived content — an accessibility regression, not a style.
- **Per-panel constants** (40px menus, 42px lists). Rejected: wrong for every
  menu that mixes items with labels or dividers, which is most real menus.

## Consequences

- A standalone `c-dropdown` (`itemsPerPage` 0) gets no row cap, but an
  overflowing list still snaps to a peek under its ceiling.
- The mobile full-screen dropdown hides its scrollbar too and has no peek:
  the list fills the screen and touch scrolling is conventional.
- Keyboard and assistive-tech behaviour is unchanged: a hidden scrollbar
  still scrolls, and the active option's `scrollIntoView` is untouched.
- `itemsPerPage` keeps its meaning — N full rows, then the peek — but the
  cap is measured, so a taller row set yields a taller panel.
- `c-menu` does not gain an `itemsPerPage` prop; its cap is the 80vh ceiling
  snapped to a peek. Adding the prop is a separate decision.
