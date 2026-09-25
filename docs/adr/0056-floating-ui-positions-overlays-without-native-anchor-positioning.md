# 56. Floating UI positions overlays where native anchor positioning is missing

Date: 2026-09-24

## Status

Accepted. Supersedes the OddBird polyfill part of ADR-0008.

## Context

The anchored overlay components (`c-menu` and its `c-menu-item` submenus,
`c-tooltip`, `c-popover`, and the field panels of `c-select`, `c-autocomplete`
and `c-tree-select`) place their top-layer panels with native CSS anchor
positioning. ADR-0008 covered browsers without it by lazily running the OddBird
`@oddbird/css-anchor-positioning` polyfill against the component's shadow root.
It flagged that path as the risk, because it was never verified in Firefox.

A RHEL 9 user on Firefox 140 ESR showed that it never worked. Every panel sat at
its unanchored default position, for three reasons:

- Every anchor declaration is written inline (`:style`, `style.setProperty`).
  A browser's CSSOM drops declarations of properties it doesn't know, so the
  `style` attribute the polyfill reads never contains them.
- OddBird 0.9 looks for inline styles only in `document`, never in the shadow
  roots it is given.
- Even when it finds them, it wraps every `position-area` target in a
  `<polyfill-position-area>` grid box. That box can't place a top-layer popover,
  and it moves elements that Vue owns. It is also a one-shot page transform, but
  we ran it on every open: each run rewrote `<style>` text in place and stacked
  up `autoUpdate` loops that were never cleaned up.

## Decision

Where `CSS.supports('anchor-name: --x')` is false, `useFallbackPosition`
places the panel with `@floating-ui/dom`, which OddBird already used
internally. It is imported lazily and preloaded at setup. For each component it
uses the preferred placement, the component's `position-try-fallbacks` chain in
native order (the first placement that fits wins, and the preferred one is used
when none fits), and the gap as an offset. The result is a style string appended
to the panel's `:style` binding, never written to `el.style`, which Vue's next
patch would wipe. With a designated trigger it anchors to the element itself
instead of the proxy. The native path doesn't change.

_Amended 2026-09-25_: the chain alone left a panel with no room to fit
running off the viewport. A 900px popover from a toolbar button on a 360px
screen sat at left -560 in Firefox 140; Chromium had it at 0. Native
`position-area` keeps the box inside its containing block on both axes. A box
larger than the viewport starts at its top or left edge, and the clamp applies
to the margin box, so the gap stays. When no option fits, native also keeps the
last placement that fitted while the panel was open (the "last successful
position option"), falling back to the preferred one. The fallback now mirrors
all three: a small try-chain middleware replaces Floating UI's `flip`, and
`shift` runs on both axes with the gap as padding. `flip` doesn't fit here
because it prefers a candidate that fits on the side axis, however far it
overflows along the other.

Each component's fallback chain now exists twice, once in CSS and once in TS,
kept next to each other with a comment linking them. We chose that over
generating one from the other: this path is temporary.

## Consequences

- The conformance suite's anchored-overlay kind asserts that each panel lands on
  the same rect with and without the feature: in the page flow, crowded into a
  corner (flipped), after a scroll, against a designated trigger, and too big
  to fit (taller or wider than the viewport, or with no room on either side). Chromium
  148 has no runtime flag that disables anchor positioning, and Playwright's
  Firefox is 150, so `src/test/noAnchorPositioning.ts` emulates Firefox 140's
  CSSOM (drops the anchor properties, and reports them unsupported). This checks
  the geometry, not a real Firefox: a change to this path still gets a manual
  check in Firefox ESR.
- The lazy chunk shrinks from 171 KB to 34 KB.
- Delete `useFallbackPosition`, the TS chains and the emulation once the oldest
  Firefox ESR the library supports positions anchors natively.
