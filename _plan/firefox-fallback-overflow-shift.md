# Firefox 140: an anchored panel with no room to fit runs off the viewport instead of being pushed back in

## Context
A 900px-wide popover opened from a toolbar button runs off a narrow viewport in Firefox 140 ESR, while Chromium keeps
it on screen. I reproduced it with a probe page (`scratchpad/dp/wide.html`, the built dist, `c-popover
position="bottom-end" distance="8"`, `::part(panel){width:…;max-width:none}`, 360px viewport):

| case | Chromium (native) left | Firefox 140 (Floating UI fallback) left |
|---|---|---|
| 900px panel, trigger at the right edge | 0 | **-560** |
| 300px bottom-end, trigger centred (neither side fits) | 0 | **-102** |
| 300px bottom-start, trigger centred | 60 (= 360-300) | **150** (overflows right) |
| 300px, trigger at the right edge (a flip fits) | 52 | 40 (matches; trigger sits 12px further left in FF) |
| 900px-tall panel, bottom-end (Chromium only) | top 8: pushed up over the trigger, keeping its 8px margin | — |

Cause: when even the fallbacks overflow, the native `position-area` shifts the box back inside the viewport
(the containing block) on both axes, and aligns it to the start edge if it's larger than the viewport.
`useFallbackPosition` (`packages/csc-ui/src/shared/useFallbackPosition.ts`, ADR-0056) only runs `offset` + `flip`
with `fallbackStrategy: 'initialPlacement'`, so it keeps the preferred placement and runs off the edge. The same
code backs c-popover, c-menu, c-menu-item, c-tooltip and the field panels (`useAnchoredPanel`: c-select,
c-autocomplete, c-tree-select), so they all have the same bug.

## Change
In `useFallbackPosition.ts`, add Floating UI's `shift` middleware after `flip` (imported alongside the others from
the lazy `loadFloatingUi()`):
- `shift({ mainAxis: true, crossAxis: true, padding })`. Native clamps on both axes, as the tall-panel probe shows.
  Floating UI clamps a box larger than the boundary to the start edge, which matches native's left 0.
- `padding` comes from the resolved placement's side. It's the gap on the placement axis's two sides (`top`/`bottom`
  for block sides, `left`/`right` for inline) and 0 on the other axis. This mirrors the native clamp of the *margin*
  box (the components put `margin-<axis>: gap` on both sides), which is why native gives top 8 and not 0 above.
  Use the derivable form `shift((state) => ({ … }))` to read `state.placement`. Field panels pass a negative gap: pass it
  through as it is first, and clamp it at 0 only if the conformance comparison disagrees.
- Update the module docblock: the fallback now also mirrors position-area's "stay inside the containing block"
  overflow shift, not just the try chain.

Also:
- **Fail-first spec**: extend the `SCENARIOS` map in `packages/csc-ui/src/test/conformance/anchored-overlays.spec.ts`
  (the existing "places the panel as native does %s" parity test, run for every overlay recipe):
  - "with no room on either side": the stage is centred horizontally, and the panel gets `min-width: 80vw;
    max-width: none`.
  - "wider than the viewport": the panel gets `min-width: 120vw; max-width: none`.
  - "taller than the viewport": the panel gets `min-height: 120vh; max-height: none`.

  The panel may only exist once it's open, so give scenarios an optional after-open step. That step adopts a
  constructed stylesheet into `recipe.panel(m).getRootNode()` (a Vue `:style` patch can't wipe it), then
  `settle()`. The first two scenarios must be red on HEAD. The native path is unchanged, so the native side of each
  comparison is the oracle.
- **ADR-0056 amendment** (dated 2026-09-25): the fallback also mirrors position-area's overflow shift. Include the
  probe numbers above.
- **Changeset** `.changeset/fallback-position-shift.md`, patch for both packages: in browsers without CSS anchor
  positioning (Firefox 140 ESR), a popover, menu, tooltip or field list that doesn't fit beside its trigger now
  stays inside the viewport like it does in other browsers, instead of running off the edge.
- **Commit** `Fix(core): Keep anchored panels inside the viewport in Firefox 140 when they have no room to fit`,
  once you say so.

## Verification
- Run `anchored-overlays.spec.ts` alone: the new scenarios are red on HEAD (swap `useFallbackPosition.ts` via
  `git show HEAD:`) and green with the fix. The existing scenarios ("crowded into the bottom-right corner",
  designated trigger, scroll tracking) must stay green, since shift is a no-op when a placement fits.
- Also run the c-popover, c-menu, c-tooltip, c-select, c-autocomplete and c-tree-select specs, one file per run
  because of the devcontainer OOM.
- `pnpm ui lint` and `pnpm ui build`.
- Rerun `scratchpad/dp/wide-ff.mjs` against the rebuilt dist in real Firefox 140 (the BiDi driver): every case
  lands where Chromium's `wide-cr.mjs` does, give or take the scrollbar offset.
