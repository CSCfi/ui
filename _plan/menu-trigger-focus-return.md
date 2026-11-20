# Focus returns to a csc-ui button trigger (c-menu, c-popover)

**Status (2026-11-10): done, unpushed.** A f4cd7937, B 04df6ad5, C fe59b03a on `development`. Specs pass in
Chromium and Firefox (Playwright Firefox 150); WebKit is left to CI. Each commit's specs fail on its parent: on A,
c-menu/c-popover fail only on the ring; on B, the `open` specs fail. The c-menu ArrowUp spec fails without C's
watcher guard.

## Context

MyCSC on rc.5: when a `c-menu` closes after a pick (Enter, Space, click) or Escape, focus returns to a native
`<button slot="trigger">` but lands on `<body>` for `c-button` and `c-icon-button` triggers. Keyboard and
screen-reader users restart from the top of the page (MyCSC's theme switcher acts in place). Must be fixed before 4.0.0.

## Findings

**Cause confirmed.** `CMenu.vue:669` (`onToggle`, closed branch) calls `getTriggerEl()?.focus?.()`. `getTriggerEl()` is
the slotted element, or the designated trigger (ADR-0038) when the `trigger` prop is set. A `c-button` /
`c-icon-button` host is `display: contents` with no tabindex. Its `focus()` is the native one, so the call does
nothing. The focused item is inside the hidden panel, so focus falls to `<body>`. The conformance suite already pins
this as a known deviation: `KNOWN_FOCUS_LOSS_ON_CLOSE = ['c-menu']` in `src/test/conformance/kinds.ts:79`, with an
inverse assertion in `anchored-overlays.spec.ts:67`.

**Same bug elsewhere:**
- **c-popover** (`CPopover.vue:367`): same `getTriggerEl()?.focus?.()`, run on Escape when focus was inside the
  popover. If focus is on a control in the panel's content, Escape drops it to `<body>`. The conformance recipe
  presses Escape while focus is still on the trigger, which is why it passes. c-popover has no behaviour spec yet.
- **Root cause is shared.** `c-button` and `c-icon-button` are the only form-associated elements
  (`registry.ts:199 formAssociatedTags`) without the `focus(options)` override that 20d0836b gave the 15 form
  controls. Five places reach into their shadow root to work around this: `nativeControlOf` in c-button-group and
  c-tab-buttons, c-side-navigation:271, c-navigation-button:98 and implicitSubmission:81.

**Checked, not affected:**
- **c-tooltip** never moves focus.
- **c-modal and the side-navigation drawer** go through `modalStack`. It captures `deepActiveElement()`, the inner
  button, so focus returns correctly.
- **`useAnchoredPanel` consumers, c-breadcrumb, c-dropdown/c-select** (autocomplete, tree-select, date, time and
  colour pickers). They return focus to their own shadow-DOM field or fold button, never to a consumer trigger.

## Decision: approach (b), with a one-line modality change in c-menu and c-popover

| | (a) c-menu/c-popover target the trigger's inner control | (b) c-button / c-icon-button `focus()` reaches their control |
|---|---|---|
| Fixes | the two overlays only | both overlays, designated triggers, `modalStack` initial focus, app `host.focus()`, Playwright `.focus()` |
| Knowledge | a sixth reach-in heuristic (`shadowRoot.querySelector('button, a')`). Misses the slotted `<button>` (ADR-0085), a disabled inner button and closed roots | lives in the component that owns it: `slotted ?? rootRef` (link, button or slotted button) |
| Precedent | — | 20d0836b's 15 form controls, same `defineExpose({ focus })` through `withLiveExposed` |
| Host focus behaviour | unchanged | unchanged: a method override, not `delegatesFocus` (rejected in 20d0836b). `:focus` matching, click-to-focus and Tab order don't change, because none of them call `focus()` |
| Cost | none to the API | adds a `focus` method to two manifests (`api.snapshot.json`, non-breaking). A foreign `display: contents` trigger still needs its own `focus()`, as with any native-like element |

## Commits (one changeset each, patch for both `@cscfi/csc-ui` and `@cscfi/csc-ui-react`)

Work test-first: write the specs of A and B, run them on the base, and confirm the c-* cases fail. Then implement.

### A. `Fix(c-button, c-icon-button): focus() focuses the button`
- `components/c-button/CButton.vue`: add `focus(options?: FocusOptions)` →
  `(slotted.value ?? rootRef.value)?.focus(options)`. Add a JSDoc docblock in the CCheckbox style, then
  `defineExpose({ focus })`.
- `components/c-icon-button/CIconButton.vue`: same. Add a `rootRef` on the `<button part="root">`.
- `test/conformance/form-association.spec.ts`: add "focus() focuses its control, also once the element is re-added".
  It runs for the form-associated tags that are not value controls (`[...formAssociatedTags]` minus `VALUE_TAGS`,
  so currently c-button and c-icon-button) and mirrors the test in `value-controls.spec.ts:261`. Future tags enrol
  automatically.
- `components/c-button/CButton.spec.ts`: `focus()` reaches the `<a>` when `href` is set, and the slotted
  `<button>`. A disabled button stays unfocused, as a native one does. The options pass through.
- `test/conformance/kinds.ts`: remove `'c-menu'` from `KNOWN_FOCUS_LOSS_ON_CLOSE`. Its inverse assertion fails once
  the host takes focus. Keep the empty list, like the other `KNOWN_*` lists.
- Regenerate `custom-elements.json` (`pnpm ui docs:manifest`) and the two `api.snapshot.json` files
  (`vitest run --project node src/api-snapshot.node.spec.ts -u`). Rebuild the React wrappers and commit
  `components.ts` if it changes.
- Accessibility section of the c-button and c-icon-button `usage.md`: add one sentence saying that `focus()`
  focuses the button.
- Changeset: "`focus()` on a `c-button` or `c-icon-button` now focuses its button (its link, or the slotted
  button), as it does on a native button. It used to do nothing, so a menu or popover closed from one left focus on
  the page."

### B. `Fix(c-menu, c-popover): A keyboard close rings the trigger that focus returns to`
- `CMenu.vue` and `CPopover.vue`: add `const focusOptions = useKeyboardModality(host)` (`shared/useKeyboardModality.ts`)
  and change the return call to `getTriggerEl()?.focus(focusOptions())`. A pick or Escape from the keyboard asks for
  the ring. A mouse pick leaves it to the browser, as the pickers do.
- `components/c-menu/CMenu.spec.ts`, new `describe('focus return')`:
  - `describe.each` over three triggers: native `<button>`, `<c-button>` and `<c-icon-button aria-label path>`.
    `it.each` over four ways to close: Enter pick, Space pick, click pick, Escape.
  - The keyboard paths focus the control, press Enter to open, poll until the first `c-menu-item` has focus, then
    press the key. The click path clicks the trigger, waits for the item, then clicks it.
  - Assert that `document.activeElement === trigger`, and that for c-* triggers
    `trigger.shadowRoot.activeElement === innerButton`. Assert that `select` fired for the picks.
  - Ring: `control.matches(':focus-visible')` is true after a key and false after a pure-mouse pick. Also spy on
    `HTMLElement.prototype.focus` and check that `lastCall[0].focusVisible` is `true` or `undefined`, since Chromium
    alone can't show the Firefox path.
  - Extra case: a designated `c-icon-button` (the `trigger` prop) closed with Escape returns focus to it.
- New `components/c-popover/CPopover.spec.ts`, the first behaviour spec for c-popover. For the same three
  triggers: open, Tab into a `<button>` in the content, press Escape. Focus is back on the trigger, ringed.
- Changeset: "Picking a `c-menu` item or pressing Escape returns focus to a `c-button` or `c-icon-button` trigger,
  showing its focus ring after a key. Escape from inside a `c-popover` does the same."

### C. `Fix(c-menu, c-popover, c-tooltip): open follows the panel` (decided 2026-11-10: fix it)
This is a real inconsistency, not documented as input-only. The `open` docstring on c-menu, c-popover and c-tooltip
says "Two-way: emits `change:open`", but none of them write the state back. c-side-navigation does
(`CSideNavigation.vue:224`, "so a later write of the same value is not a no-op"). Effect: after the user closes a
menu, `menu.open = true` does nothing, because the prop is already `true`. Fix:
- In each `onToggle`, set `host.open = nowOpen` when it differs.
- Guard the `props.open` watcher against the live panel (`value === panel.matches(':popover-open')` → return),
  not `isOpen`, which lags the queued `toggle` task. Without the guard the write-back re-runs `openMenu('first')`
  and overrides ArrowUp's `pendingOpenFocus = 'last'` (verified: the spec fails without it).
- Spec, in the c-menu, c-popover and c-tooltip specs (a new `CTooltip.spec.ts` if none exists): `open` reads true
  while open and false after a user close, and a user-closed panel reopens on `open = true`. Also a c-menu check
  that ArrowUp still opens on the last item.
- If the write-back runs inside a watcher in c-tooltip's show/hide path, defer it with one `nextTick` pass
  (reference_vue_ce_prop_write_in_watcher).
- Changeset: "The `open` property of `c-menu`, `c-popover` and `c-tooltip` follows the panel: it reads `false` once
  the user closes it, and setting it to `true` again reopens the panel."

## Verification
- Chromium, one file per run (devcontainer OOM):
  `pnpm --filter @cscfi/csc-ui exec vitest run --project browser /abs/path/<Spec>.spec.ts`. Run CMenu, CPopover,
  CButton, CIconButton, `anchored-overlays`, `form-association` and `value-controls`. Rebuild tokens first
  (`pnpm ui style-dictionary:build`).
- Firefox: install into the scratchpad as described in reference_playwright_firefox_devcontainer (symlink
  chromium-1223), then run `TEST_BROWSERS=firefox pnpm exec vitest run --project "browser (firefox)" <same paths>`
  from `packages/csc-ui`. WebKit runs in CI only; I'll say so in the hand-off.
- `pnpm --filter @cscfi/csc-ui run type-check`, `pnpm lint` (guards, docs parity), `pnpm ui lint:api`,
  `pnpm ui test:node`.
- Check that every spec of each commit fails on its parent.
