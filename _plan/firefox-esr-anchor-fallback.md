# Overlays mispositioned on Firefox 140 ESR (RHEL 9): replace the OddBird polyfill with Floating UI

## Context
A RHEL 9 user on Firefox 140 ESR reports mispositioned overlays. Firefox 140 has no native CSS
anchor positioning, so `ensureAnchorPositioning()` (`packages/csc-ui/src/shared/anchorPolyfill.ts`)
loads OddBird 0.9.0 against the component's shadow root. It can't work as wired:

1. **Firefox drops the declarations.** `anchor-name` / `position-anchor` / `position-area` are all set
   inline, via `style.setProperty`, a `:style` string that Vue applies with `style.cssText =`, or a
   static `style=""`. The CSSOM discards properties the browser doesn't know, so they never reach the
   `style` attribute the polyfill reads.
2. **OddBird ignores shadow-root inline styles.** `fetchInlineStyles()` (`fetch.ts:77`) queries
   `document`, not `roots`.
3. **Even when fed, it can't place our panels.** Each `position-area` target is moved into a
   `<polyfill-position-area>` grid wrapper (`position-area.ts:539`). That can't place a top-layer
   popover, and it rearranges DOM that Vue owns. It is also a one-shot page transform that we call
   on every open, so it rewrites `<style>` text and stacks `autoUpdate` loops that are never cleaned up.

Affected: `c-menu`, `c-menu-item` submenus, `c-tooltip`, `c-popover`, and `useAnchoredPanel` consumers
(`c-dropdown`/`c-select`, `c-autocomplete`, `c-tree-select`). The Chromium-only suite never runs this path.

## Decisions (grilled 2026-09-24)
- **D1:** Replace OddBird with `@floating-ui/dom` used directly (already a transitive dependency; the
  OddBird chunk is 171 KB). It is used only when `supportsAnchorPositioning()` is false. The native
  path stays unchanged.
- **D2 (revised after step 1):** Chromium 148 no longer has a `CSSAnchorPositioning` runtime flag, and
  Playwright's Firefox is 150. The fail-first spec therefore runs in the normal Chromium instance with a
  test helper that emulates Firefox 140's CSSOM: `CSS.supports` is false for the anchor properties, and
  `setProperty` / `cssText` / the camelCase accessors drop them.
- **D3:** Mirror each component's `position-try-fallbacks` chain exactly, as a TS constant next to its CSS rule.
- **D4:** Record this as ADR-0056.

## Implementation
1. ~~Check the flag~~. Done: the flag has no effect in Chromium 148, so D2 was revised.
2. **Spec first** (`src/test/conformance/anchored-overlays.spec.ts` + `src/test/noAnchorPositioning.ts`, the CSSOM emulation, installed per describe block). For every `OVERLAY_RECIPES` tag, open the panel and assert:
   - it sits against its trigger with the placement gap, measured on the shadow `[part=root]`/anchor
     box, not the `display:contents` host;
   - it takes the first step of its fallback chain when crowded against a viewport edge;
   - it re-tracks after a scroll;
   - it works with a designated trigger (ADR-0038).
   Confirm it fails on today's code.
3. **Shared composable** `src/shared/useFallbackPosition.ts` (replaces `anchorPolyfill.ts`):
   - input: `{ anchor, panel, placement, fallbacks, offset }`;
   - lazily `import('@floating-ui/dom')`, run `computePosition` with `strategy: 'fixed'` (top layer) and
     `offset` / `flip({ fallbackPlacements, fallbackStrategy: 'initialPlacement' })` / `shift`;
   - `autoUpdate` on open, cleanup on close and unmount;
   - write the result into **reactive refs merged into the component's `panelStyle`**, never into
     `el.style` directly, because Vue's `style.cssText =` re-render would wipe it. Fallback style is
     `position:fixed; inset:auto; margin:0; top/left`.
   - Reuse `POSITION_AREA`/`placementAxis` (`src/shared/positionArea.ts`), and add a `CPlacement` →
     Floating UI placement map beside them. Per-step margin swaps are expressed as `offset` callbacks keyed on
     the resolved placement.
4. **Wire the call sites.** Replace the `ensureAnchorPositioning` calls in `CMenu.vue:610`,
   `CMenuItem.vue:306`, `CTooltip.vue:303`, `CPopover.vue:323` and `useAnchoredPanel.ts:279`.
   - Fallback chains: menu, tooltip and popover use flip-block → flip-inline → both; field panels use
     above → flip-inline → above-left plus the top offset; the submenu uses its 7 steps.
   - Designated trigger: anchor Floating UI to the designated element directly, since the proxy is only
     needed for native tree-scoped names.
   - Fullscreen field panels (ADR-0050) skip positioning.
5. **Remove** `@oddbird/css-anchor-positioning` from `packages/csc-ui/package.json` and add `@floating-ui/dom` as a
   direct dependency (`CI=1 pnpm install`). Update the docblocks in `useAnchoredPanel.ts` and `useDesignatedTrigger.ts`
   that mention OddBird.
6. **Docs:** ADR `docs/adr/0056-floating-ui-positions-overlays-without-native-anchor-positioning.md`. Cover why
   OddBird fails (top-layer wrapper, shadow inline styles, one-shot transform), the duplicated chains, the
   flag instance, and the delete condition: the oldest supported Firefox ESR positions natively. No new
   CONTEXT.md term.
7. **Changeset:** a patch changeset, "Overlays position correctly in browsers without CSS anchor positioning
   (Firefox 140 ESR)". Commit `Fix(core): …`.

## Verification
- `pnpm ui test:browser` on the anchored-overlays spec in both instances (one spec file per run; devcontainer memory).
  It must be red before step 3 and green after. The existing c-menu/c-select/c-tree-select specs and visual
  baselines must not change, which confirms the native path is untouched.
- `pnpm ui lint`, `pnpm build`, docs example smoke.
- Manual: Firefox 140 ESR (Mozilla linux-aarch64 `140.*esr` tarball) against the docs dev server. Open a
  menu with a submenu, a tooltip, a popover, a select, an autocomplete and a tree-select; test edge flips and scrolling.
