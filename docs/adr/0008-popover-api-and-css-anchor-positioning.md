---
status: accepted
---

# `c-menu` positions with the Popover API + CSS anchor positioning, with an OddBird polyfill for Firefox

The `csc-ui-next` menu family (`c-menu`, `c-menu-item`) renders its dropdown and
submenu panels as native **Popover API** elements (`popover` attribute, top layer)
and places them with **CSS anchor positioning** (`anchor-name` / `position-anchor` /
`position-area` / `position-try-fallbacks`). Where the browser lacks native anchor
positioning (Firefox, as of mid-2026) we lazily load the **OddBird
`@oddbird/css-anchor-positioning`** polyfill at runtime. This is a deliberate
departure from the manual `getBoundingClientRect()` positioning the rest of the
codebase uses (Stencil `c-menu`, `csc-ui-next` `c-dropdown`).

## Context

A menu needs an overlay that (1) is never clipped by an ancestor's `overflow`,
(2) does not fight z-index, (3) light-dismisses, and (4) flips/shifts to stay in
the viewport across 12 placements — and, here, supports nested submenus. Three
ways to get there were considered:

1. **Manual `getBoundingClientRect()` + a teleported/`<dialog>` element** — what
   `c-dropdown` and the Stencil `c-menu` do today. It reimplements flip/shift,
   scroll/resize tracking, top-layer stacking, and light-dismiss by hand; the
   existing `c-dropdown` positioning code is ~100 lines and still only handles
   one placement.
2. **`@floating-ui/dom`** — a robust JS positioning engine (flip/shift/autoUpdate).
   Solves placement well but is a new runtime dependency, still needs the Popover
   API (or a manual portal) for the top-layer/dismiss concerns, and keeps
   positioning in JS.
3. **Popover API + CSS anchor positioning** — the platform's own answer. The
   `popover` attribute gives top-layer rendering and (in auto mode) dismissal for
   free; CSS anchor positioning expresses all 12 placements declaratively and
   `position-try-fallbacks` does flip/shift in the engine. No positioning JS, no
   teleport. The cost is browser support: native in Chrome/Edge 125+ and Safari
   26, **not yet in Firefox**.

The decision is most reversible now — only the menu family uses it.

## Decisions worth recording

- **Panels are Popover API elements in the top layer.** This is the primary win:
  no overflow clipping, no z-index management, no teleport out of the shadow root.
- **Placement is CSS anchor positioning.** The `position` prop maps to a
  `position-area`; `position-try-fallbacks: flip-block, flip-inline, …` (in the
  ADR-0007 escape-hatch `<style>`) provides flip/shift. The anchor-name and
  position-area are set inline so they are trivially dynamic.
- **Panels use `popover="manual"`, not `"auto"`; light-dismiss is implemented in
  the controller.** Auto popovers close other auto popovers and light-dismiss on
  any outside click. Submenus live in *separate shadow roots* (one per
  `c-menu-item`), so the browser does not treat them as nested — an auto submenu
  would dismiss the root menu, and clicking a submenu would register as "outside"
  the root. Manual mode keeps the top-layer benefit while `c-menu` owns dismissal:
  a capture-phase `document` `pointerdown` listener closes the menu when
  `composedPath()` does not include the host (every interactive part — slotted
  trigger, light-DOM items, submenu panels in descendant shadow roots — is inside
  the host's flattened subtree, so this one check is exact).
- **The anchor lives in the shadow root, not on the slotted trigger.** Anchor
  names are tree-scoped; the panel is in `c-menu`'s shadow root while the trigger
  is slotted light DOM. `c-menu` wraps `<slot name="trigger">` in a shadow-DOM
  `part="trigger"` box that carries `anchor-name`, so anchor and panel share one
  tree scope.
- **Firefox via the OddBird polyfill, lazily.** `ensureAnchorPositioning()`
  (`src/shared/anchorPolyfill.ts`) is a no-op when `CSS.supports('anchor-name')`;
  otherwise it dynamically `import()`s the polyfill (a separate ~171 KB build
  chunk that never loads on supporting browsers) and runs it against the calling
  component's shadow root with `useAnimationFrame: true`.
- **New dependency:** `@oddbird/css-anchor-positioning`, loaded only on
  non-supporting browsers and code-split so it costs supporting browsers nothing.

## Considered alternatives

- **Manual `getBoundingClientRect()`** (option 1). Rejected: most code, most edge
  cases, reinvents platform features, and the existing implementations don't even
  cover multi-placement flip.
- **`@floating-ui/dom`** (option 2). Reasonable and fully cross-browser today, but
  adds a permanent runtime dependency for *every* browser and still leaves
  top-layer/dismiss to solve separately. The platform approach reaches the same
  place with zero positioning JS on modern browsers; the polyfill confines the JS
  cost to the one browser that needs it. Revisit if the polyfill proves
  inadequate (see risk).

## Consequences

- **Verified on the native path; the polyfill path is the risk.** A Chromium
  smoke test exercises open/close, anchored placement, full keyboard nav,
  submenus, `select`, and light-dismiss (23 checks). OddBird's known weak spot is
  shadow DOM + top-layer popovers, so the Firefox path must be verified in a real
  Firefox before this is considered done; if it falls short, the seam in
  `anchorPolyfill.ts` lets us swap in a small `getBoundingClientRect` fallback or
  `@floating-ui/dom` without touching the components.
- **`position-try-fallbacks` and the popover open animation are the only
  escape-hatch CSS** (ADR-0007) in the menu family; everything else is `tv`.
- **`c-menu` is the sole controller** because `provide/inject` cannot cross
  `defineCustomElement` boundaries — recorded here because the popover/anchor
  choices (manual mode, shadow-root anchor, host-subtree dismissal) only make
  sense under that constraint.
- **Customization stays `::part()`-only** (ADR-0006); the menu exposes `trigger`,
  `panel`, `list` parts (and `c-menu-item` exposes `root`, `content`,
  `submenu-panel`, `submenu`).
