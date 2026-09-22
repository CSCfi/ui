# 51. c-main scrolls the document, not an inner element

Date: 2026-09-15

## Status

Accepted

Amends ADR-0014: the page lock's document scroll lock now stops the dashboard
layout's real scroller.

Amended 2026-09-16: the pinned side navigation has an explicit height and a
bounded shell declares its viewport height (see Amendment below).

Amended 2026-09-22: the drawer adds nothing to the layout's height and the
dashboard grid clips its overhang, so a page that fits the viewport never
scrolls (see the second Amendment).

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
- The page lock (ADR-0014) locks _document_ scroll, so a modal opened inside
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

## Amendment (2026-09-16): the drawer's height and bounded shells

The first cut clamped the pinned side navigation with `max-height` and made its
host the scroller. Two reports followed: a short menu collapsed to its content,
so the drawer's **bottom slot** sat under the last item instead of at the bottom
edge, and a drawer still carrying the 3.x `autoheight` class was one toolbar
height short under a `static` toolbar. Under a banner or a static toolbar the
slot was also below the fold at load: a sticky box has a fixed height and cannot
shrink while the rows above it are still on screen.

Decided:

- `c-main` sizes the desktop drawer to exactly the pinned height
  (`viewport − offset`), overriding `autoheight` (outer tree context wins over
  `:host`), and leaves the host `overflow: visible`.
- `c-side-navigation`'s item list is the drawer's only scroll container; the
  bottom slot's region sits outside the `menubar` nav and is `sticky bottom: 0`,
  so it reaches the viewport's bottom edge before the drawer has pinned. The
  accepted residual is that a long menu's last rows sit behind the slot while
  the banner and toolbar rows are still on screen; a scroll-measured drawer
  height in `c-main` would have been exact but was rejected to keep the
  layout free of measurement.
- The viewport height comes from a public custom property,
  `--c-main-viewport-height` (default `100dvh`). No CSS unit knows an ancestor
  scrollport's height (`cqh` falls back to `svh`, which re-creates the "too
  high" symptom on tablets with collapsing browser chrome), so a bounded shell
  — the docs' 320px demo box — declares it. This is a layout parameter, not a
  restyling surface; ADR-0006's `::part()` rule stands.

## Amendment (2026-09-22): the page alone sizes the layout

Report: under a `static` toolbar the dashboard layout scrolled although the
page fit the screen, and that scroll hid the toolbar. Measured at a 720px
viewport with a 100px page: a static toolbar made the document 60px too tall,
a 40px banner 40px, both together 100px, and a bounded 320px shell scrolled
60px past its footer. The 2026-09-16 amendment sized the drawer to its pinned
height (viewport − offset) and noted that at rest its bottom sits below the
fold while the banner and toolbar rows are still on screen. That overhang is
an in-flow grid item's height: it sized the `sidenav`/`page` row and with it
the document. A fixed-height sticky box cannot both start below the toolbar at
rest and fill the viewport once pinned, so either the row it sizes or the
overhang it paints had to give.

Decided:

- The drawer's **margin box is zero-height**: its `margin-bottom` is the
  negated pinned height, set by the grid only. It adds nothing to its row, so
  the banner, the toolbar and the page alone size the layout, and a page that
  fits the viewport is exactly a viewport tall and never scrolls. The sticky
  position box is the margin box (css-position-3), so the drawer still pins
  until its row leaves the viewport and still fills the viewport once pinned.
- The **dashboard grid is the default `<slot>`'s own box**, a growing item of
  the shell's flex column below the banner, and it **clips vertically**
  (`overflow-y: clip`; `overflow-x` stays visible so a wide page still scrolls
  the document). The clip cuts the drawer's overhang below the shell, so it
  extends neither the document nor a bounded shell's scroller — a clip on the
  `root` part would have fixed the document but not the shell, whose `root` is
  the scroller. The grid box is not a part (ADR-0006): `::part(root)` keeps
  the canvas, the minimum height and the bounded-shell recipe, but no longer
  carries the grid tracks.
- Column mode (`disable-layout`) is unchanged: the slot is boxless there and
  the pull is undefined, since a zero-height drawer in a column would sit on
  top of the page.

Considered and rejected: sizing the drawer to the viewport minus the toolbar
in both modes (one line, but the drawer stops a toolbar height short once a
static toolbar has gone, and the banner still adds its height); measuring the
rows above with a ResizeObserver (a scroll-measured height would still be
needed to fill when pinned, and it reopens the measurement-free stance);
letting `c-side-navigation` pin its own inner box inside a clipping host (the
same zero-margin device plus a two-component custom-property contract and a
`contain: size` width regression); a scroll-driven animation of the height
(the banner height is unknown, modern engines only); a negative top margin
(the first items would sit behind the toolbar).

Consequence: whatever paints below `c-main`'s bottom edge is clipped instead
of extending the document. In-flow content is unaffected — the layout grows
with the page — and so are native popovers, fixed panels and the mobile
drawer; only overflow escaping the shell's bottom edge is cut.
