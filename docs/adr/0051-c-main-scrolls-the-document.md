# 51. c-main scrolls the document, not an inner element

Date: 2026-09-15

## Status

Accepted

Amends ADR-0014: the page lock's document scroll lock now stops the dashboard
layout's real scroller.

## Context

In 3.x and the early 4.0 alphas `c-main` clamped itself to the viewport
(`h-screen`), `c-toolbar` was `position: fixed` behind a 60px spacer, and
`c-page`'s host was the scroll container, sized `calc(100lvh - 60px)`. The
request to let the toolbar leave the screen on scroll exposed the cost of that
shape:

- The toolbar's grid row never scrolled, so no positioning change on the bar
  could move it. The `class="relative"` switch was inert inside `c-main`.
- The 60px bar height was hardcoded in four library places (`c-toolbar`,
  `c-page`, `c-side-navigation` twice) and in consumers (`sticky top-15`).
- The page lock (ADR-0014) locks *document* scroll, so a modal opened inside
  `c-main` never stopped `c-page` scrolling behind it.
- Mobile browser chrome collapse, router scroll restoration, find-in-page and
  anchor navigation all address the document scroller and missed an inner one.

## Decision

The **document is the only scroll container of the dashboard layout**.

- `c-main` is at least a viewport tall and grows with its content.
- `c-page` is a plain region: no height, no overflow of its own. Its
  `scroll-indicator` tracks the document.
- The **toolbar** and the desktop **side navigation** are **pinned** with CSS
  sticky. The toolbar pins itself (`sticky top-0`; the spacer is gone) and gains
  a `static` prop that leaves it in flow so it scrolls away with the page.
  `c-main` pins the side navigation beneath the toolbar with an inner scrollbar.
- `c-main` follows the toolbar's mode: it observes the slotted toolbar's
  reflected `static` attribute (a slot-scoped `MutationObserver`) and moves the
  side navigation's pin to the top edge when the toolbar is static, so the two
  slotted siblings agree without a second prop. `:host(:has(c-toolbar[static]))`
  would have expressed this in CSS alone but does not match in Chromium.
- The toolbar height is the `--spacing-toolbar` theme value, not a literal.
- A `banner` slot above the toolbar rides on the same sticky hand-over: the
  banner scrolls away and the toolbar pins in its place, without measurement.

## Considered options

- **Keep `c-page` as the scroller and add an opt-in on `c-main`.** Nothing
  breaks, but two layout modes forever, the hardcodes stay, and the toolbar's
  `static` would only do anything in one of the modes.
- **Scroll `c-main`'s root.** Self-contained, but an inner scroller keeps
  today's losses: no mobile chrome collapse, no router scroll restoration, an
  ineffective page lock.
- **Own the mode on `c-main` and drive the toolbar from there.** `::slotted()`
  cannot reach the toolbar's inner bar, and a standalone toolbar (the docs site
  uses one) would lose the switch.
- **Pin the banner too.** Its height depends on content and wraps at narrow
  widths, so both the toolbar's and the side navigation's offsets would need a
  measured value pushed across shadow boundaries.

## Consequences

- `c-page`'s scroll offset is no longer meaningful. Consumer code that read or
  set it must target the window; `c-page { height }` overrides are dead.
- `c-toolbar`'s `class="relative"` switch is gone; use `static`.
- `c-side-navigation`'s `autoheight` host class remains for use outside
  `c-main`; inside the dashboard layout it is unnecessary.
- Smooth scrolling is the document's choice (`html { scroll-behavior: smooth }`),
  no longer `c-page`'s.
- A future auto-hide toolbar (slide away on scroll down, return on scroll up)
  can be a second boolean on `c-toolbar` and does not reopen this decision.
