# 67. c-breadcrumb folds overflowing crumbs into a disclosure panel by moving them

Date: 2026-10-02

## Status

Accepted

## Context

The library gains a page-level **breadcrumb** (`c-breadcrumb`, its crumbs
authored as slotted `c-breadcrumb-item` children). Deep hierarchies make the
row longer than its container, especially on a phone. The first crumb (the
top of the site) and the **current crumb** have to stay visible; the crumbs
between them can give way. Three questions follow: when crumbs give way,
what holds them once they have, and how a slotted crumb gets there.

## Decision

- **Fold on measured overflow.** The breadcrumb is always one line. When
  its crumbs do not fit its width, middle crumbs fold, the one nearest the
  first crumb first, until the row fits. The first and current crumbs never
  fold. Once nothing more can fold, the current crumb's label truncates,
  then the first crumb's; a truncated crumb carries its full label as a
  native `title`. The row never wraps.
- **The fold panel is a disclosure of links.** The "…" **fold button** is a
  native `<button aria-expanded>` opening the breadcrumb's own native
  popover in the **top layer**, which lists the **folded crumbs** as links
  in a list. Tab walks them, and the up and down arrows (wrapping) and
  Home/End move between them; the arrows on the fold button open the panel
  onto the first or last. These are the menu's keys without its roles: the
  folded crumbs stay links, each a Tab stop. Escape and **light dismiss**
  close it and return focus to the fold button. It is a **transient list
  panel** with the menu panel's visuals and a **peek**, and it is always
  anchored.
- **Folded crumbs move into the panel.** The breadcrumb sets `slot="folded"`
  on each folded crumb (and `slot="first"` on the first, so the fold button
  follows it in Tab order), so the consumer's own element projects into the
  panel and renders there as a row. Natural widths are measured while the
  crumbs sit in the row and cached.

## Alternatives considered

- **A `max-items` cap** (fold above a count, as the tree select's **panel
  breadcrumb** does): deterministic and needs no layout reads, but ignores
  width, so long labels on a phone still wrap or overflow. Adding both
  mechanisms would mean two rules to explain and test.
- **Embedding `c-menu`** (as `c-pagination` does for its page sizes): reuses
  the whole menu, but `c-menu-item` has no `href`, so folded crumbs would
  stop being links — no open in a new tab, routing through `select` — and
  `role="menu"` is for application commands, not site navigation.
- **Embedding `c-popover`**: reuses positioning and dismissal, but its panel
  is a `role="dialog"` card with no list look and no peek.
- **Mirroring folded crumbs as rows** (as `c-autocomplete` snapshots option
  `outerHTML`): leaves the consumer's DOM untouched, but a consumer's click
  handler is not on the copy, so the documented single-page-app routing
  (intercepting the crumb's native click) would break exactly for folded
  crumbs, and the copies go stale.

## Consequences

- The breadcrumb writes the `slot` attribute of its children. A consumer
  must never set `slot` on a crumb; the component owns it, as
  `c-side-navigation` owns its sub-items'.
- The same element is a row crumb or a panel row depending on its slot, so
  `c-breadcrumb-item` styles itself for both and reports which through the
  `folded` custom state.
- Folding depends on layout, so it happens after upgrade and re-runs on
  resize, on content changes and once web fonts load; the strip may show
  unfolded for a frame.
