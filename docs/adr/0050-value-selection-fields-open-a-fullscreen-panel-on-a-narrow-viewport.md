# 50. Value-selection fields open a fullscreen panel on a narrow viewport

Date: 2026-09-14

## Status

Accepted

Amends ADR-0008 and ADR-0038 (the light-dismiss rule), ADR-0009 and ADR-0047
(the anchored-panel lifecycle gains a second layout), ADR-0014 (the modal
stack's inert and scroll lock are reused outside `c-modal`) and ADR-0043 (a
fullscreen panel's list has no peek).

## Context

`c-select`'s listbox (`c-dropdown`) has had a phone layout since the Stencil
era: under a `max-width: 760px` media query its `<dialog>` — opened with
`showModal()` — stretches to the viewport. It never quite covered it: the
dialog was sized `100vh` capped at `100svh`, carried a `-4px` top margin and
rounded corners, and its backdrop is transparent, so the page showed through
below the small viewport and at the corners.

`c-autocomplete` and `c-tree-select` (ADR-0009, ADR-0047) had no narrow layout
at all. They anchor a `popover="manual"` panel under the field; on a phone the
on-screen keyboard opens over the panel, and the panel light-dismissed on any
capture-phase `pointerdown` outside the host — which is how every touch scroll
begins — so scrolling the field into view closed the options. The tree select
was unusable on a phone.

"Mobile" meant five things in the codebase: window width in `c-dropdown` and
the docs shell, container width in `c-table`, `c-steps` and `c-login-card`, a
consumer flag on `c-side-navigation`.

## Decision

1. **Shape — a fullscreen panel** (CONTEXT.md). On a **narrow viewport** the
   transient list panel of a value-selection field fills the viewport: a
   **heading row** (the field's label as the panel heading, a close icon
   button), the **search input** where the component has one, then the list.
   _Amended 2026-09-16_: the first shape moved `c-select`'s whole value field
   into the panel under the heading row; on a phone that repeated the label
   and spent a row on a readonly field that does nothing there. The field now
   stays in the page for every value-selection component, and `c-select`'s
   panel is the heading row and the list — the same shape as `c-tree-select`. Rejected: a bottom sheet (the keyboard
   covers or displaces it, the page stays live behind it) and an anchored,
   keyboard-aware panel (it still competes with the keyboard for the lower
   half of the screen and leaves `c-select` on a different model).
2. **Predicate — viewport width only, one shared threshold.** A single
   `src/shared` composable owns the media query, keeping `c-dropdown`'s 760px
   so existing `c-select` consumers see no change. Rejected: `pointer: coarse`
   (alone or combined) — it cannot be exercised in the Chromium harness
   without pointer emulation, and a 13-inch tablet would get a fullscreen
   list. Accepted gap: a phone in landscape (~850 CSS px) keeps the anchored
   panel.
3. **Architecture — the composable grows the layout; `c-dropdown` shares the
   predicate.** `useAnchoredPanel` gains a fullscreen branch: the same popover
   element drops anchor positioning and fills the viewport. A shared
   heading-row child SFC serves `c-autocomplete` and `c-tree-select`.
   `c-dropdown` keeps its `<dialog showModal>` and adopts the shared predicate,
   sizing and heading row. Rejected: porting `c-dropdown` onto the composable
   first (a rewrite of a 980-line component with its moved-field model, for a
   mobile fix) and per-component copies.
4. **Keyboard — the surface spans the layout viewport; the content follows
   `visualViewport`.** The panel element is `position: fixed; inset: 0` — the
   layout viewport, which the on-screen keyboard overlays but never shrinks —
   and paints the surface; the content box inside it (heading row, search
   input, list) is pinned to `visualViewport`'s box while open, so it ends
   above the keyboard. Coverage therefore depends on nothing the API reports,
   or when: a late or wrong box shows more surface, never the page. Without
   the API the content fills the surface. CSS alone cannot see the iOS
   keyboard, and a library cannot set the consumer page's
   `interactive-widget` viewport meta. _Refined 2026-09-15_: the first shape
   made the panel itself the visual viewport's box (`100dvh` without the
   API); on a phone the page showed beside the shrunken panel while the
   keyboard was up.
5. **Modality — inert and scroll-locked through the modal stack's routines,
   without joining the stack.** The inert and scroll-lock code `modalStack.ts`
   owns is extracted and shared; the fullscreen panel inerts everything
   outside its host (toasts exempt), locks document scroll, and wraps its
   content in `role="dialog" aria-modal="true"` in this layout only. It gets
   no backdrop and no stacking-band z-index — it stays a top-layer popover.
   Rejected: non-modal with `overscroll-behavior: contain` (assistive
   technology walks into content the user cannot see) and switching the branch
   to `<dialog showModal>` (toasts go inert; the composable would swap element
   types between layouts). `c-dropdown` still uses `showModal()`, so on a phone
   `c-select` inerts toasts while the other two do not — a recorded
   divergence, removed only by the deferred port.
6. **Light dismiss follows the platform rule, library-wide.** A `pointerdown`
   outside the surface only *records*; the surface closes on a `pointerup`
   whose composed path is also outside, and `pointercancel` — what a touch
   scroll turns into — clears the record. One shared helper replaces the three
   hand-rolled `pointerdown` listeners (`useAnchoredPanel`, the popover chain,
   `c-menu`), so every transient surface survives a scroll gesture exactly as
   a native `popover="auto"` does.

## Consequences

- Consumer-visible behaviour changes under 760px for `c-autocomplete` and
  `c-tree-select`; `c-select`'s panel covers the whole viewport; no transient
  surface closes on a scroll gesture any more. Released as one minor changeset.
- Specs resize the viewport (`page.viewport`) for fullscreen cases and add
  visual baselines per theme mode; the anchored-overlays conformance suite
  gains a scroll-gesture case (press outside + `pointercancel` keeps the
  surface open; press + release outside closes it). The keyboard itself cannot
  be driven in headless Chromium — specs fake the visual viewport's box (the
  API's own getters) to prove the surface stays put while the content
  shrinks; a manual phone check is still part of the definition of done.
- `c-dropdown` no longer moves the field on a narrow viewport; its fullscreen
  baselines and the ordering assertions in `CSelect.spec.ts` change with it.
- Two mechanisms remain (`<dialog>` in `c-dropdown`, popover in the
  composable). The seam is the shared predicate, sizing and heading row; a
  later port of `c-dropdown` onto `useAnchoredPanel` collapses it.
- The Firefox anchor polyfill (ADR-0008) is not kicked off in the fullscreen
  layout: nothing is anchored.
- The peek (ADR-0043) does not apply in the fullscreen layout: the list is
  bounded by the viewport edge, not a ceiling, and `items-per-page` caps
  nothing there. A cap would leave blank surface under a half row on a
  screen the panel is meant to fill; the screen edge is the cue.
- The layouts are not interchangeable mid-open: crossing the threshold while
  a panel is open closes it (the anchored one re-anchors, the fullscreen one
  releases the page lock). `c-dropdown` already closed on any body resize.
