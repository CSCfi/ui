# Fullscreen panel for value-selection fields + a mobile-friendly docs site

Grilled 2026-09-14. Decisions are recorded in ADR-0050 and the **Fullscreen
panel**, **Narrow viewport**, **Transient list panel** and **Light dismiss**
terms in CONTEXT.md; this file is the execution plan.

## Decisions (settled)

1. **Shape**: fullscreen panel — heading row (field label + close icon
   button), search input (moved field for `c-select`), list. Not a sheet.
2. **Predicate**: viewport width only, one shared threshold (760px, unchanged),
   one composable in `src/shared`. Landscape phones stay anchored (accepted).
3. **Architecture**: `useAnchoredPanel` gains the fullscreen layout;
   `c-dropdown` keeps `<dialog showModal>` and shares predicate, sizing and
   the heading row. No port of `c-dropdown` now.
4. **Keyboard**: `visualViewport` listener while open, `100dvh` fallback.
5. **Modality**: inert + scroll lock via routines extracted from
   `modalStack.ts` (toasts exempt); `role="dialog" aria-modal="true"` in the
   fullscreen layout only; no modal-stack entry, no backdrop.
6. **Light dismiss**: native semantics (pointerdown records, pointerup outside
   dismisses, pointercancel clears) through one shared helper used by
   `useAnchoredPanel`, `popoverChain.ts` and `CMenu.vue`.
7. **Docs**: 360px floor, no page-level horizontal scroll, wide content scrolls
   in its own container, guarded by a viewport smoke over the prerendered
   routes.
8. **Recording**: ADR-0050 (written); one minor changeset for `@cscfi/csc-ui`;
   docs-only work ships with an empty changeset if it lands separately.

## Part A — library (`packages/csc-ui`)

### A1. Shared predicate — `src/shared/useNarrowViewport.ts`

- `NARROW_VIEWPORT_QUERY = '(max-width: 760px)'` (drop `only screen`).
- `useNarrowViewport(): Readonly<Ref<boolean>>` — `matchMedia` + `change`
  listener, torn down on unmount. SSR-safe (`false` when `window` is absent).
- `CDropdown.vue`: replace `isMobile` / `setIsMobile` with it; rename the
  `.mobile` class hooks to `fullscreen` (internal class names, no part change).

### A2. Shared light-dismiss helper — `src/shared/lightDismiss.ts`

- `attachLightDismiss({ contains(path): boolean, onDismiss })` →
  detach fn. Capture-phase document listeners: `pointerdown` stores whether the
  composed path was outside; `pointerup` dismisses if both down and up were
  outside; `pointercancel` clears. Ignore non-primary pointers.
- Replace the three hand-rolled listeners: `useAnchoredPanel.onDocPointerDown`,
  `popoverChain.onDocPointerDown` (keep its chain-walk in `contains`),
  `CMenu.onDocPointerDown` (host OR designated trigger in `contains`).
- Conformance: `test/conformance/anchored-overlays.spec.ts` gains two cases
  per kind — press outside + `pointercancel` keeps it open; press + release
  outside closes it. Update the existing pointerdown-only assertion.

### A3. Extract inert + scroll lock — `src/shared/modalStack.ts`

- Lift `applyInert`'s "inert everything outside these hosts, exempt
  `c-toasts`, never touch consumer-set inert" and `applyScrollLock` into a
  reference-counted `src/shared/pageLock.ts` (`lockPage(host) → unlock`).
  The modal stack becomes its first consumer; behaviour unchanged (existing
  c-modal specs are the guard). Hazard: a fullscreen panel open *inside* an
  open modal — the union of hosts must stay interactive; test it.

### A4. `useAnchoredPanel` fullscreen branch

- Option `fullscreen: Readonly<Ref<boolean>>` (the A1 ref). `panelStyle`
  switches: anchored → today's string; fullscreen →
  `position:fixed;inset:0;width:auto;height:var(--_c-fullscreen-h,100dvh);
  margin:0;` plus the `visualViewport`-driven `--_c-fullscreen-h` /
  `translateY(offsetTop)` while open (listener attached in `onToggle` open,
  removed on close). Skip the anchor polyfill kick-off in this layout.
- On open in the fullscreen layout: `lockPage(host)`; on close: unlock.
  Return-focus behaviour unchanged.
- Expose `layout: ComputedRef<'anchored' | 'fullscreen'>` for the SFCs.

### A5. Heading row child — `src/shared/PanelHeadingRow.vue`

- Props: `heading` (the field label), `closeLabel`; emits `close`. Renders
  `part="heading-row"` with the heading (`part="heading"`) and a
  `c-icon-button`-style close (`part="close"`). Name collision noted:
  `c-tree-select` already has `part="header"` (the level line) — never reuse
  that name.
- Tailwind scan hazard (memory `project_csc_ui_new_sfc_tailwind_scan`): after
  adding the SFC, grep dist CSS for its utilities and rebuild if missing.

### A6. `c-autocomplete` and `c-tree-select`

- Pass `fullscreen` from `useNarrowViewport()` into the composable; render
  `PanelHeadingRow` at the top of `part="card"` when `layout === 'fullscreen'`;
  wrap the card in `role="dialog" aria-modal="true" :aria-label="label"` in
  that layout only (anchored layout keeps today's combobox/listbox roles).
- Close button → `close(true)`. Escape already routes through the components.
- `texts`: add `closePanel` to each `DEFAULT_TEXTS` (aria-label of the close
  button), surfaced through `appDefault('texts', …)` like the other strings.
- The list's ceiling in the fullscreen layout is the remaining viewport height;
  the peek cap (ADR-0043) still applies under it — verify the peek helper takes
  a ceiling rather than assuming `itemsPerPage`.
- `overscroll-behavior: contain` on `part="list"` (page is locked anyway; this
  stops iOS rubber-banding inside the panel).

### A7. `c-dropdown` coverage fixes (the "does not cover the whole screen")

Three concrete causes, all in `CDropdown.vue`'s `dialog` tv slot / `<style>`:
`mt-[-4px]` (4px strip uncovered at the bottom), `rounded` over a transparent
`::backdrop` (corners show the page), `height:100vh; max-height:100svh`
(address-bar collapse reveals the page below the small viewport). In the
fullscreen layout: no margin, no radius, `height: 100dvh` with the same
`visualViewport` pinning as A4 (share the helper), `inset:0`. Add the heading
row (A5) above `input-top`; `c-select` passes `label` and `closeLabel` down
(new `c-dropdown` props). Keep `showModal()`.

### A8. usage.md

- `c-select`, `c-autocomplete`, `c-tree-select`: a "Narrow viewports" section
  describing the fullscreen panel, the close control and that the threshold
  is viewport width. Prose lives only there (ADR-0026).

### A9. Tests (ADR-0049)

- Per component: a spec that sets `page.viewport(360, 740)` (restore in
  `afterEach` — the harness shares one page), opens, asserts the panel rect
  equals the viewport, the heading row + close exist, close returns focus to
  the field, `document.body` children outside the host are inert while open
  and released after, and the anchored layout returns at 1280.
- Visual baseline per theme mode for each fullscreen panel
  (`matchScreenshotInBothModes`; `pnpm ui test:update` in the devcontainer,
  commit PNGs).
- `useNarrowViewport.spec.ts` (browser), `lightDismiss.spec.ts`,
  `pageLock.spec.ts`.
- Manual (not automatable headless): iOS Safari + Android Chrome — keyboard
  open keeps heading row + search input visible; list shrinks; scroll inside
  list does not move the page; back gesture / Escape closes.

### A10. Changeset

`pnpm changeset` → minor, `@cscfi/csc-ui` (React wrapper follows as a fixed
group): "c-autocomplete and c-tree-select open a fullscreen panel on narrow
viewports (under 760px) with the field's label, a close button and the search
input kept above the on-screen keyboard; c-select's fullscreen panel now covers
the whole viewport and follows the keyboard. Transient panels no longer close
when a scroll gesture starts outside them."

## Part B — docs site (`packages/csc-ui-documentation`)

### B1. Audit at 360px (Chromium, devcontainer)

Known suspects from the code read: the toolbar row (wordmark "CSC Design
System" + `next` badge + three switchers + burger — hide the wordmark below
`md`, keep the logo), `ExampleBlock` (block is `overflow-hidden`; the demo
area needs `overflow-x-auto` so wide examples such as tables scroll inside),
`[tag].vue` heading with long tag names (`break-words`/`overflow-wrap`),
`data-visualization.vue` (fixed-width chart demos), `customization.vue`
playgrounds (grids → `sm:grid-cols-*`), prose code blocks (already
`overflow-x-auto`, verify inside `<li>`/tables), `ApiComponent` tables (already
wrapped). Fix root causes with `min-w-0` on flex children and per-container
scroll; never `overflow-x: hidden` on `body`.

### B2. Viewport smoke — `scripts/viewport-smoke.mjs` + `test:viewport`

- After `nuxt generate` (or `nuxt build`'s prerender output), serve
  `.output/public`, enumerate routes from `**/index.html`, launch the pinned
  Playwright Chromium, `setViewportSize({ width: 360, height: 740 })`, goto,
  wait for `customElements.whenDefined` of the page's `c-*` tags, then assert
  `max(documentElement.scrollWidth, body.scrollWidth) <= innerWidth`.
- Report every failing route with the widest offending element
  (`getBoundingClientRect().right > innerWidth`, excluding descendants of
  `overflow-x:auto` containers) so fixes are targeted.
- Wire into the docs `pnpm test` (after the examples project) and CI.
- Empty changeset if this lands as its own PR.

## Status (2026-09-14)

Part A is implemented, unpushed:

- A1 `useNarrowViewport.ts`, A2 `lightDismiss.ts` (`attachPointerPair` +
  `attachLightDismiss`; wired into `useAnchoredPanel`, `popoverChain`,
  `CMenu`), A3 `pageLock.ts` (extracted from `modalStack.ts`), each with a
  browser spec; the conformance suite gained the scroll-gesture case.
- A4 `useAnchoredPanel` fullscreen branch (`layout`, `fullscreen` option,
  visual viewport via the shared `visualViewport.ts`, page lock);
  A5 `PanelHeadingRow.vue`; A6 wired into `c-autocomplete` / `c-tree-select`
  (tv `fullscreen` variant, `role="dialog"` card, `closePanel` text, parts).
- A7 `c-dropdown`: `mobile` → the shared predicate + `fullscreen` tv variant,
  `applyFullscreenBox` on the dialog, heading row, `label` / `closeLabel`
  props from `c-select`; the three coverage causes are gone.
- A8 usage.md "Narrow viewports" sections; A9 fullscreen specs + baselines in
  both modes for all three; A10 changeset `fullscreen-panel-narrow-viewport`.
- API snapshots, strict manifest, React wrappers regenerated.

Part B (docs) implemented, unpushed:

- B2 `scripts/viewport-smoke.mjs` (`pnpm --filter @cscfi/csc-ui-documentation
  run test:viewport` after `generate`; CI step "Docs viewport smoke (360px
  phone)"). Fails on page-level horizontal scroll OR readable content cut at
  the viewport edge (nearest overflow ancestor hidden/clip); ignores
  off-canvas boxes (`left ≥ viewport`) and boxes without rendered text (the
  inactive c-tab-items panels). `--shots <dir>` writes first-screen PNGs.
- B1 findings and fixes, verified by the smoke at 360×740 (76/76 routes):
  the toolbar overflowed on every route (wordmark wrapped, the burger was
  pushed off-screen — the drawer could not be opened) → below `sm` only the
  logo, icon-only theme / colour switchers and the burger remain; the
  example flavor tabs were cut by the figure → the tab row scrolls sideways;
  the c-table example was cut → the demo pane is `overflow-x-auto`.

Manual phone check (A9: keyboard behaviour on iOS Safari / Android Chrome)
still to do — not automatable in headless Chromium.

## Order of work

1. A1 + A2 + A3 (shared primitives, each with its spec) — independent.
2. A4 + A5 + A6 (composable branch, heading row, the two popover fields).
3. A7 (`c-dropdown`), then A8, A9 baselines, A10.
4. B1 audit + fixes, B2 guard.

## Hazards / open

- `page.viewport()` must be restored after each fullscreen spec — the browser
  project shares one page across specs (memory `project_csc_ui_test_harness`).
- Landscape phones stay anchored (ADR-0050, decision 2). Revisit with a
  `max-height` clause if reported.
- `c-select` on a phone inerts toasts (`showModal`); the other two do not.
  Recorded in ADR-0050; fixed only by the deferred `c-dropdown` port.
- Docs at phone width now dogfood the fullscreen panel in every select-family
  example — a good manual test surface.
