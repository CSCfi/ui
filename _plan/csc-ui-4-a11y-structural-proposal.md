# csc-ui 4 — structural accessibility proposal (findings section C)

The clear-cut section C faults are fixed (0d93fadd..fcca2f7a). These three change what assistive technology
hears, so they waited for a decision. **Decided 2026-10-27 (user): all three as recommended** — APG tabs with
manual activation; disclosure navigation with a modal mobile drawer; a `level` prop (default 2) on both title tags. Each follows the WAI-ARIA Authoring Practices (APG) pattern named; none
removes or renames a prop, event, slot or part.

## 1. c-tabs (+ c-tab, c-tab-buttons) — APG "Tabs"

**Today.** `role="tablist"` sits on the c-tabs host, which also holds the scroll arrows and the panels, so the
tablist owns things that are not tabs (axe `aria-required-children` on 7 canons). In buttons mode the buttons have
no tab roles. A disabled tab is `aria-hidden` yet reachable with the arrows. The arrows act on keyup; there is no
Home/End, no Up/Down in the vertical layout, no `aria-orientation`. A `value` that matches no tab leaves the row
with no Tab stop.

**Proposal.**
- The tablist is the row inside the shadow root (the scrolling strip around the default slot): the slotted
  `c-tab` elements are its children in the accessibility tree, and the scroll arrows and panels sit outside it.
  The host gets no role; an `aria-label` on the element names the tablist. `aria-orientation="vertical"` in the
  vertical layout.
- Buttons mode: the same `tablist` / `tab` / `aria-selected` on c-tab-buttons' buttons — they switch panels, so they
  are tabs (today they read as a plain button group).
- A disabled tab is `aria-disabled` only: announced, skipped by the arrow keys.
- Keys on keydown: Left/Right (Up/Down when vertical) move focus, stopping at the ends as today; Home/End go to
  the first/last enabled tab. Activation stays manual (Enter/Space), so moving focus never fires `change` or
  loads a panel.
- With no matching tab, the first enabled tab is the Tab stop.

**Alternative rejected:** automatic activation (focus selects) — every arrow press would fire `change`.

**Effect:** semantics and keys only; clears the 7 `aria-required-children` baseline entries.

## 2. c-side-navigation (+ items, sub-items, title, c-navigation-button) — APG "Disclosure navigation"

**Today.** `<nav role="menubar">` replaces the landmark with a menubar whose arrow-key model is not there; items
and sub-items are `role="menuitem"`, a sub-item with `href` is a `div` that navigates by script; titles are plain
text; the mobile drawer neither moves focus, closes on Escape nor makes the page inert; c-navigation-button has
no `aria-expanded`. Axe `aria-required-children` on 4 canons.

**Proposal.**
- Keep the `<nav>` landmark (named by an `aria-label` on the element). Items are what they do: a leaf with `href`
  is a link, without one a button; a parent is a disclosure button with `aria-expanded` (already) and
  `aria-controls` to its sub-list (same shadow root, so the id resolves); sub-items likewise links or buttons.
  `aria-current="page"` stays on the current leaf. Tab moves through items; no arrow-key model is promised.
- Titles are headings (`role="heading"`, level 2) so screen-reader users can jump between sections.
- The mobile drawer is a modal dialog: `role="dialog"`, `aria-modal`, named "Menu"; opening moves focus into it,
  Escape and the close button close it and return focus to the navigation button, and the page behind is inert
  (the c-modal machinery, ADR-0014).
- c-navigation-button carries `aria-expanded`, mirrored from the drawer's `open` by c-side-navigation.

**Effect:** no prop changes; "Menu" and the close button's name join the 4.x `texts` list of fixed strings.
Clears the 4 `aria-required-children` entries. Largest of the three (focus management + inert).

## 3. Card titles as headings

**Today.** c-card-title renders its text in a `<p>`, c-login-card-title in a `<header>`: card headings are missing
from the page's heading outline (screen-reader heading navigation skips every card).

**Options.**
- (a) A `level` prop on both title tags (1–6, default 2) rendering `role="heading"` with `aria-level` — additive
  (a minor changeset); the page decides where cards sit in its outline. **Recommended.**
- (b) A fixed level 2 — no API, but wrong for cards under an `h2` section, which then need level 3.
- (c) Leave them text and document it — the status quo.
