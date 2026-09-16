# `c-select` `multiple`: the fullscreen panel closes when the tag row wraps


## Outcome (2026-09-16, commit 0748b8f2)

Landed as planned. One discovery changed the specs: the Vitest harness page
pins `body { min-height: 100vh }`, so on a short page the field's growth is
absorbed and `document.body` never resizes — the first attempt at the
regression case passed against the unpatched component. Every case that drives
the body observer therefore makes the page taller than the viewport first
(`growPage()`), which is what a phone page that scrolls looks like anyway.

Verified: the regression case and the surface-tap case fail on the unpatched
`CDropdown.vue`; the threshold case fails with the new watcher removed. Browser
and node projects are green apart from one pre-existing, unrelated visual
baseline failure in `c-sub-navigation-item` (reference 343px, render 334px —
the 9px spacer that commit 3846cbce/40099140 removed). `pnpm ui lint` passes.
The manual phone check is still outstanding.

## Context

Bug report: `c-select` with `multiple` "closes randomly on mobile when
selecting options". Desktop is fine, and the existing multiple-mode spec
("keeps the list open across picks", `CSelect.spec.ts:224`) passes because it
runs at the desktop viewport.

Vocabulary (CONTEXT.md): "mobile" here is the **narrow viewport** and the
surface is the **fullscreen panel** of `c-dropdown`'s **transient list panel**;
use those terms in the commit, changeset and comments. The contract being
violated is the glossary's **Multiple** entry: "Picking a selected option
unselects it and the panel stays open."

### Root cause (from code)

`c-dropdown` (`packages/csc-ui/src/components/c-dropdown/CDropdown.vue`) keeps a
`ResizeObserver` on `document.body` (`:958-965`) and calls `close()` on any body
resize once the 500 ms `isOpening` window (`:474`, `:700-705`) has passed. The
guard is Stencil-era: the anchored dialog is placed with fixed coordinates
measured at open, so a page reflow could leave it floating away from the field.

- **Anchored layout (desktop):** the `c-input` is moved *into* the fixed dialog
  and `dummyRef` holds a fixed-height placeholder (`:677-686`), so a wrapping tag
  row grows the dialog, not the body. Nothing closes.
- **Fullscreen layout (narrow viewport, ADR-0050 as amended 2026-09-16, commit
  826a24c6):** the field *stays in the page* under the inert surface
  (`:633-640`). In `multiple` mode each pick adds a `c-tag`
  (`CSelect.vue:75-107`); the pick that wraps the tag row (`tags: flex
  flex-wrap … py-2`) grows the field from 44 px to ~76 px, the body grows, the
  observer fires, the panel closes. The page lock (`shared/pageLock.ts:149-154`)
  makes `body` `position: fixed` with `left/right: 0` but no `bottom`, so body
  height stays content-driven — the lock does not mask the growth.

"Randomly" = only the pick that makes the tag row wrap (label lengths and the
phone width decide which one); `max-tags="0"` never reproduces it. Any other
body-height change under the open fullscreen panel (a consumer rendering the
picks elsewhere, a `min-height: 100dvh` body reacting to browser chrome) closes
it the same way.

Other close paths checked: `@cancel` (Escape), the heading close button,
`selectOption` (single mode only), and the `click` listener on the `<dialog>`
element itself (`:707-710`, `:766-767`) — the last one is a second, rarer
random-close vector in the fullscreen layout (see decision 2).

## Decisions (grilling log, confirmed with the user)

1. **Scope — fullscreen layout only.** In the fullscreen layout a body resize
   never closes the panel: nothing is anchored, the surface is `fixed; inset: 0`
   and the inner column follows `visualViewport`. Crossing the narrow-viewport
   threshold while open still closes it (ADR-0050: the layouts are not
   interchangeable mid-open) — through a `narrow` watcher in `c-dropdown`
   mirroring `useAnchoredPanel.ts:283-295`, since the body observer no longer
   provides it there. The anchored layout keeps close-on-body-resize and its
   500 ms guard; the desktop hazard (a consumer page growing under the anchored
   list closes it) is noted as a follow-up, not fixed.
2. **The dialog-surface tap does not close the fullscreen panel.** A tap on the
   `<dialog>` outside the inner column can only land while the visual viewport
   lags the surface (browser chrome / keyboard animating). CONTEXT.md "Light
   dismiss": a fullscreen panel is never light-dismissed. `handleOutsideClick`
   is skipped while `fullscreenOpen`.
3. **No new ADR.** Reversible, explained by a code comment, no real trade-off.
   ADR-0050's consequence "`c-dropdown` already closed on any body resize"
   (`:119-121`) gets a dated amendment; CONTEXT.md needs no change (the
   **Multiple** and **Fullscreen panel** entries already state the contract).

## Implementation

All in `packages/csc-ui/src/components/c-dropdown/CDropdown.vue` unless noted.

1. **Body observer skips the fullscreen layout** (`:958-965`). Inside the rAF
   callback add `if (fullscreenOpen.value) return;` next to the `isOpening`
   check, with a comment: the fullscreen surface is the layout viewport, the
   field stays in the page and grows with its tag row in `multiple` mode, so a
   body reflow says nothing about the panel; only the threshold closes it.
2. **Threshold watcher.** Add `watch(narrow, (n) => { if (isOpen.value &&
   fullscreenOpen.value !== n) close(); })` beside the existing
   `watch([itemsArray, narrow, …])` (`:944`). Symmetric like the composable's;
   in the anchored direction it doubles the body observer harmlessly (`close()`
   is safe to call twice: `dialog.close()` on a closed dialog is a no-op and the
   `isOpen` watcher only fires on change).
3. **Surface tap guard.** `handleOutsideClick` (`:707-710`): return early when
   `fullscreenOpen.value`. Leave the listener attach/detach alone (the dead
   `window.removeEventListener('click', …)` at `:812`/`:978` is out of scope;
   mention in the commit body only if touched).
4. **Behaviour specs** in `CSelect.spec.ts`, inside `describe('fullscreen
   panel')` (`:342`, `PHONE = 360×740`, `afterEach` restores the desktop
   viewport). Reuse `mountSelect`, `openFullscreen`, `rows`, `isOpen`,
   `dialog`, `settle`, `fakeVisualViewport`.
   - **Fails before the fix:** `multiple`, phone width; set
     `m.host.style.width` narrow (e.g. 200 px) so the second tag wraps
     deterministically; open; **wait past the 500 ms `isOpening` window**
     (`await settle(550)`) — otherwise the guard masks the bug; click two rows
     with `settle()` between; assert the field's box grew (precondition that
     the reflow happened), `isOpen(m)` is `true`, `m.host.value` holds both
     picks, and the tags render.
   - **Surface tap:** phone width, open, `fakeVisualViewport({ height: 400,
     offsetTop: 0 })` to expose surface under the column, dispatch a `click`
     on `dialog(m)` (target = the dialog, not the inner column), settle,
     expect still open; restore in `finally`. Fails before the fix.
   - **Threshold crossing still closes:** phone width, open, `page.viewport
     (DESKTOP)`, settle, expect closed (guards the new watcher; passes today
     via the body observer).
   - Optional characterisation: at desktop width, appending a tall element to
     `document.body` while open still closes the anchored list (pins the
     branch decision 1 keeps).
   No visual change → no new baselines.
5. **ADR-0050 amendment** (`docs/adr/0050-…md`, Consequences, the "layouts are
   not interchangeable" bullet): dated note that in the fullscreen layout
   `c-dropdown` no longer closes on a body reflow nor on a surface tap; only
   the threshold, Escape, the close button, a single-mode pick or the parent
   close it.
6. **Changeset** (`pnpm changeset`, patch for the fixed group), user-facing
   wording: "c-select: on a narrow viewport the fullscreen panel stayed open
   only until a `multiple` pick made the field's tag row wrap (or anything
   else reflowed the page behind it); it now stays open until the user closes
   it or the viewport crosses the narrow threshold. A tap on the panel surface
   outside the list no longer closes it either."
7. **Commit:** `Fix(c-select): Keep the fullscreen panel open while the field's
   tag row wraps in multiple mode`, body naming the body observer, the
   threshold watcher and the surface-tap guard, plus the ADR amendment.

## Verification

- `pnpm ui test:browser -- CSelect` — the new fullscreen `multiple` case and
  the surface-tap case fail on the unpatched `CDropdown.vue` (check by
  stashing only the component change, or run the specs first), pass after.
  The whole c-select and c-autocomplete files stay green; `pnpm ui lint`.
- `pnpm ui test` (browser + node) once, since the conformance suites and the
  API snapshot touch c-dropdown indirectly.
- Manual phone check (ADR-0050's definition of done; the harness cannot drive
  a real device): on the device that reproduced the report, open a `multiple`
  `c-select` in the docs (`pnpm dev`, http://localhost:3500), pick options
  until the tag row wraps twice, scroll the list, rotate the phone within
  portrait/landscape widths under 760 px — the panel stays open; widening past
  760 px closes it.

## Follow-ups (not in this change)

- Anchored layout: the body observer still closes the desktop list when the
  consumer's page grows under it; a "did the field's placeholder move?" check
  or repositioning would fix multiple mode there too.
- `_plan/responsive-mobile-contrast-fixes.md` open item: the manual iOS check.
- Deferred port of `c-dropdown` onto `useAnchoredPanel` (ADR-0050) would give
  `c-select` the shared light dismiss and conformance coverage.
