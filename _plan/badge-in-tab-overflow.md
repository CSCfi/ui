# Let a slotted `c-badge` escape the tab's clip

## Context

`<c-tab>Members <c-badge>2</c-badge></c-tab>` renders a badge that is cut off. The
canon already slots badges into controls — `packages/csc-ui-documentation/app/examples/c-badge/basic.vue`
has `<c-button>Default<c-badge>2</c-badge></c-button>` — and `c-button`/`c-icon-button`
deliberately keep their box unclipped so it works (`CIconButton.vue:302` even spells
out `overflow-visible`). `c-tab` is the odd one out: it stacks **three** clips between
the badge and the viewer.

`c-badge`'s root is `absolute -right-1.5 -top-1.5 … ring-2` (`CBadge.vue:28`), i.e. it
overhangs its anchor by 6px + a 2px ring = **8px** up and right. The clips:

| # | Element | Rule | Slack |
|---|---|---|---|
| 1 | `c-tab` `[part=root]` | `overflow-hidden` in the tv `root` slot (`CTab.vue:63`) — also `relative`, so it is the badge's containing block | 0px |
| 2 | `c-tab` host | `overflow: hidden` in the escape-hatch `<style>` (`CTab.vue:227`) | 0px |
| 3 | `c-tabs` `[part=tabs]` | `overflow-hidden p-1 -m-1` (`CTabs.vue:158`) — the clipping viewport the translated track scrolls inside | 4px (bought for the tab's 2px outline + 2px offset) |

**Outcome wanted:** the corner badge behaves in a tab exactly as it already does in
`c-button` — 8px of ink allowed outside the tab box — without giving up the tab-strip
viewport clip or changing any layout measurement.

Scope confirmed with the user: corner-overlay look (not an inline pill), `c-tab` only.

## Why `overflow: clip` + `overflow-clip-margin` rather than `visible`

- Clip #3 is **load-bearing**: `.c-tabs__tabs` is what hides the track that
  `.c-tabs__scroll` translates past it (`CTabs.vue:808-812`). It cannot become `visible`.
- It is a *pure clip*, not a native scroller — `CTabs.vue` never touches `scrollLeft`;
  the only reads are `tabsRef.clientWidth` and `scrollRef.scrollWidth`
  (`CTabs.vue:341, 570, 603, 609`). `overflow: clip` preserves `clientWidth` (padding
  box) exactly, so overflow detection, arrow stepping and touch panning are untouched.
- Bumping `p-1 -m-1` to `p-2 -m-2` would also buy slack, but `clientWidth` includes the
  padding, so it would shift the `clientWidth + 1 < scrollWidth` overflow threshold by
  8px and delay the arrows. `overflow-clip-margin` changes ink only, not geometry.
- `overflow-clip` is already used in this codebase (`CTabButtons.vue:200`), and
  arbitrary properties like `[corner-shape:inherit]` are established (`CButton.vue:438`).
- The badge is `position: absolute`, so it contributes nothing to `offsetWidth` /
  `scrollWidth` / `getBoundingClientRect()`. `src/test/controlHeight.spec.ts:39-62`
  (which pins `c-tab` to `--spacing-control`) and `moveIndicator()`'s measurements
  (`CTabs.vue:344-426`) are unaffected.

## Changes

### 1. `packages/csc-ui/src/components/c-tab/CTab.vue`

- tv `root` slot (line 63): `overflow-hidden` → `overflow-clip [overflow-clip-margin:8px]`.
  Keeps the hard clip that `whitespace-nowrap` labels need in vertical mode (where
  `::slotted(c-tab)` is pinned to `min/max-width: 100%`, `CTabs.vue:903-909`) while
  allowing exactly the badge's 8px overhang.
- `:host(.c-tab)` (line 227): **delete** `overflow: hidden`. It is redundant — `[part=root]`
  is `h-full w-full` so nothing can overflow the host through it, and the ripple is
  clipped by its own container (`ripples: 'absolute inset-0 overflow-hidden …'`, line 62),
  the same split `c-button` uses (`CButton.vue:438` vs the unclipped root at `:444`).
  Keep `position: relative` (`useRipple` measures the host).
- Extend the existing tv docblock (lines 48-57) and the `<style>` preamble (lines 185-192)
  to say why the clip is a margined `clip`: a slotted `c-badge` must be able to paint
  8px outside the tab box.

### 2. `packages/csc-ui/src/components/c-tabs/CTabs.vue`

- tv `tabs` slot (line 158): `'flex overflow-hidden p-1 relative -m-1'` →
  `'flex overflow-clip [overflow-clip-margin:6px] p-1 relative -m-1'`.
  `p-1` already puts the clip 4px outside the tab boxes; +6px gives 10px, i.e. the
  badge's 8px with 2px of antialiasing slack. Update the neighbouring comment (and the
  `@csspart tabs` description at `CTabs.vue:94`) to record that the inset now covers both
  the focus outline and a slotted corner badge.

No `api.snapshot.json` changes — no new props, parts, slots or events on either component
(`src/api-snapshot.node.spec.ts` stays green untouched).

### 3. Behaviour spec — new `packages/csc-ui/src/components/c-tab/CTab.spec.ts`

`c-tab` has no spec file today. Per CLAUDE.md a `Fix(` PR must add a spec that fails
before the fix. Use the harness (`src/test/harness.ts`): `mount`, `settled`,
`matchScreenshotInBothModes`.

- **Deterministic assertion (fails before the fix on every platform).** Mount
  `c-tabs` with `html: '<c-tab value="a">Summary</c-tab><c-tab value="b">Members<c-badge>2</c-badge></c-tab>'`,
  then walk the flat tree up from the badge's `[part=root]` (`assignedSlot ?? parentNode`,
  hopping `ShadowRoot.host`) and, for every ancestor whose computed `overflow` is not
  `visible`, assert its `getBoundingClientRect()` expanded by
  `parseFloat(getComputedStyle(el).overflowClipMargin) || 0` contains the badge's rect.
  Treat a non-`clip` overflow as a 0 margin — `overflow-clip-margin` only applies to
  `clip`. (Neither clipping element has a border, so border box == padding box here; note
  that in a comment.) Before the change this fails on all three ancestors; after it, none.
- **Visual baselines.** `matchScreenshotInBothModes(stage, 'badge')` on the same mount —
  the mount stage has `padding:8px` (`harness.ts:129-160`), enough room for the overhang.
  Writes `c-tab/__screenshots__/badge-{light,dark}.png`.
- Also add the standard upgrade smoke (`host.shadowRoot` + adopted sheets) so the new
  spec file matches the shape of `CButton.spec.ts:6-28`.

### 4. Docs canon — `packages/csc-ui-documentation/app/examples/c-tabs/`

`basic.vue` is already edited in the working tree (the badge on the *Members* tab). The
canon convention is that all four flavors mirror each other, and a parity script guards
it — mirror the same change into `basic.react.tsx`, `basic.angular.ts` and
`basic.typescript.html`. Plain attribute/element syntax only; no `.prop` bindings on `c-*`.

`c-tabs/basic` is in the screenshot set (`packages/csc-ui-documentation/tests/examples.spec.ts:34`),
so `c-tabs-basic-{light,dark}-chromium.png` must be regenerated.

### 5. Changeset

`pnpm changeset` — a patch `Fix(core)` entry for `@cscfi/csc-ui`, user-facing wording
along the lines of "a `c-badge` slotted into a `c-tab` is no longer clipped by the tab or
the tab strip".

### 6. Housekeeping

Copy this plan to `_plan/badge-in-tab-overflow.md` alongside the other plan files.

## Status (2026-09-21) — implemented, uncommitted

Everything in **Changes** is on disk (`git status`: 8 modified, 3 new — CTab.spec.ts,
its `__screenshots__/`, `.changeset/tab-badge-overhang.md`; plan mirrored to
`_plan/badge-in-tab-overflow.md`). Nothing is committed; no commit was asked for.

One finding changed the design while implementing. `overflow: clip` is **not a scroll
container**, and `overflow: hidden` was — so `[part=tabs]`' `min-width: auto` as a grid
item stopped resolving to 0 and the viewport outgrew its grid cell (CTabButtons spec
"the strip is squeezed to the tab row" failed: frame.right 796 vs 344.5). Fixed with an
explicit `min-w-0` on `[part=tabs]`, and CTab.spec.ts now has a test that fails without
it. `c-tab`'s own `[part=root]` does not need it: its explicit `w-full` is the specified
size suggestion that caps the automatic minimum — also guarded by a test.

Verified in the devcontainer:
- `CTab.spec.ts` (5 tests) — clip-containment walk fails on all three ancestors before
  the fix, passes after; `badge-{light,dark}` baselines written and inspected; vertical
  long-label stays inside the tab; strip still detects overflow and renders both arrows.
- `CTabButtons.spec.ts` 5/5, `controlHeight.spec.ts` 4/4 (tab still `--spacing-control`),
  node project 99/99, `pnpm ui lint` clean, prettier clean, `pnpm ui build` 0 errors and
  both `overflow-clip-margin` rules present in `dist/csc-ui.js`.
- Docs: flavors mirrored, `check-example-parity` clean, `c-tabs/basic` canon smoke passes
  and its two PNGs re-captured (deleted first — the badge's ~360px fell inside the 1%
  pixelmatch budget and `--update` kept the stale baseline).

**Not completed here:** the full `pnpm ui test:browser` (39 files), the
`all-components` / `projected-ink` / `mode-scope` / `value-controls` conformance files,
and the full 124-canon docs smoke. The devcontainer had ~400 MB free (editor + three
sessions), and Chromium's renderer crashes on anything larger than one spec file, so
these need CI or a freer machine. Partial `all-components` run: 59 passed, 2 timeouts on
unrelated `c-card-content`/`c-text-field` before the page died. `/dev/shm` (64 MB) was
ruled out — `--disable-dev-shm-usage` made no difference.

Two things to look at, not defects:
- With the default `justify="stretch"` the badge sits at the stretched tab's top-right
  corner, away from the centred label — the trade-off chosen when picking the corner
  look. `justify="start"` puts it beside the label.
- The docs smoke screenshots the bare mount div, so the canon baseline shows the badge's
  top 8px cropped. The real docs page wraps examples in `.example-demo px-4 py-6`
  (`ExampleBlock.vue:20`), so it is whole there; the c-tab spec baseline (8px stage
  padding) shows the intended render.

## Verification

Run in the devcontainer (baselines compare on Linux only — `harness.ts:304`).

1. **Spec fails first.** Write `CTab.spec.ts`, run `pnpm ui test:browser -- CTab` before
   touching the SFCs and confirm the clip-containment assertion fails naming
   `[part=root]` / the host / `[part=tabs]`.
2. Apply the `CTab.vue` + `CTabs.vue` edits; re-run — assertion passes.
3. `pnpm ui test:update` to write `c-tab/__screenshots__/badge-{light,dark}.png`; open
   both PNGs and confirm the badge is whole, including its `ring-2 ring-surface` halo.
4. **Confirm `text-overflow` behaviour did not regress.** In the same spec run, or with
   the headless-Chromium screenshot recipe, render a `c-tabs vertical` with an
   over-long tab label and check it still clips (now 8px later) rather than running
   into the neighbour.
5. `pnpm ui test` — the full browser + node projects, with attention to
   `src/test/controlHeight.spec.ts` (tab height still `--spacing-control`) and the
   conformance suites that enrol `c-tab`/`c-tabs` automatically.
6. `pnpm ui lint` — tokens/a11y/ramp/chart guards; the two new utilities are arbitrary
   properties, not palette steps, so `lint:tokens` should stay quiet.
7. `pnpm build` at the root, then `pnpm --filter @cscfi/csc-ui-documentation test:update`
   for `c-tabs-basic-{light,dark}-chromium.png`; review the PNG diffs and re-run
   `pnpm --filter @cscfi/csc-ui-documentation test` clean.
8. **Manual check of the real interaction:** `pnpm dev`, open
   http://localhost:3500 → *Components → c-tabs*, narrow the window until the arrows
   appear, and scroll the strip — the badge must stay whole mid-track and disappear
   cleanly at the viewport edge rather than lingering over the arrow buttons. Check the
   vertical flavor too.
