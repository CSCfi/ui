# c-main: a page that fits the viewport must not scroll under a static toolbar or a banner

## Context

Report: with `c-toolbar static` inside `c-main`'s dashboard layout, the document is scrollable
even though the whole content fits on the screen; scrolling that phantom distance hides the
toolbar. Measured against the built bundle in headless Chromium (1280×720, a 100px page):

| fixture                          | drawer height | document overflow |
| -------------------------------- | ------------- | ----------------- |
| pinned toolbar                   | 660           | 0                 |
| static toolbar                   | 720           | **60**            |
| banner (40px) + pinned toolbar   | 660           | **40**            |
| banner + static toolbar          | 720           | **100**           |
| static toolbar, no side nav      | –             | 0                 |
| bounded 320px shell, static      | 320           | **60** (root.scrollHeight 380) |

Root cause (ADR-0051 geometry; `V` viewport, `T` = `--spacing-toolbar` 60px, `B` banner height,
`O` = `--_nav-offset`: `T` under a pinned toolbar, `0` under a static one):

- `CMain.vue` sizes the desktop drawer to its **pinned height** `V − O` (2026-09-16 amendment, so
  the bottom slot reaches the bottom edge once pinned) and pins it with `position: sticky` in the
  `sidenav` grid row, which sits *below* the banner and toolbar rows.
- A sticky box is an ordinary in-flow grid item: its margin box sizes the `1fr` row (the root has
  `min-h-screen` and an auto height, so the row is content-sized). The layout is therefore
  `B + T + (V − O)` tall at rest: `V + B` with a pinned toolbar, `V + T + B` with a static one. The
  excess is exactly the phantom scroll. The 2026-09-16 amendment noted the drawer's bottom sits
  `B + T − O` below the fold at rest but did not draw the consequence.
- A fixed-height sticky box cannot both start below the toolbar at rest **and** fill the viewport
  once pinned. Something has to give: the row it sizes, or the overhang it paints.

## Decisions (grilling session, 2026-09-22)

1. **Scope**: fix both the static-toolbar and the banner overflow — one root cause, one fix. A
   page that fits the viewport never scrolls, in the document and in a bounded shell.
2. **Drawer behaviour unchanged**: still `V − O` tall, still fills the viewport once pinned, bottom
   slot still at the bottom edge at rest and pinned (all existing c-main / c-side-navigation specs
   keep passing).
3. **Mechanism — CSS only, measurement-free, c-main only.** The drawer's **margin box is
   zero-height** (`margin-bottom: calc(-1 * <drawer height>)`), so the page alone sizes the
   `sidenav`/`page` row; the sticky "position box" is the margin box, so the drawer still pins
   until the row leaves the viewport (spec css-position-3 §3.4; verified in Chromium at rest,
   mid-scroll and at the end of a 3000px page). The drawer's **overhang** below the layout's
   bottom edge is **clipped** by the dashboard grid box, so it does not extend the scrollable
   overflow of the document or of a bounded shell.
4. **The grid box is the default `<slot>`**, not the `root` part. The clip must sit *inside* the
   scroller (a clip on `root` fixes the document but not the bounded shell, whose `root` is the
   scroller — verified: 380 vs 320). `root` becomes a flex column: banner slot block, then the
   default slot as the dashboard grid (`grow`, `overflow-y: clip`, `overflow-x` stays visible —
   verified computed `visible/clip`, and a 3000px-wide page still scrolls the document
   horizontally). Named areas are unchanged, so `c-toolbar`'s `[grid-area:toolbar]` and the
   `::slotted()` placements keep working; no subgrid.
5. **No new part** (ADR-0006 curated set): the grid tracks were never a documented customization
   target. `::part(root)` keeps the canvas, `min-height` and the bounded-shell recipe. Reword the
   `root` docblock and usage.md so the grid is no longer promised on it.
6. **Record**: second dated amendment to ADR-0051; no new ADR, no glossary change (the concepts —
   dashboard layout, pinned, static, banner, drawer, bottom slot — are already named).
7. **Rejected**: (a) drawer `V − T` regardless of mode — one line, but the drawer stops 60px short
   once a static toolbar is gone and the banner overflow stays; (b) measuring the rows above with
   a ResizeObserver — would need scroll-measurement too to fill when pinned, reopens ADR-0051's
   "free of measurement"; (c) c-side-navigation pinning its own inner box with the host as a
   clipping wrapper — same zero-margin trick plus a two-component custom-property contract and a
   `contain: size` width regression; (d) scroll-driven animation of the height — modern-only,
   banner height unknown; (e) negative *top* margin — the first items would sit behind the toolbar.

## Implementation

### 1. `packages/csc-ui/src/components/c-main/CMain.vue`

Template — the default slot gets its own class:

```vue
<main :class="ui.root()" part="root">
  <slot :class="ui.banner()" name="banner" />
  <slot ref="slotRef" :class="ui.layout()" @slotchange="syncToolbar" />
</main>
```

`tv` config (shape; exact utilities may differ):

```ts
slots: {
  banner: 'block',
  // The default slot's box: the dashboard grid in the layout mode, boxless in the column mode.
  layout: '',
  // Shell: a viewport-high flex column (banner, then the grid); the private drawer geometry
  // lives here so the ::slotted rule below reads it.
  root: 'flex flex-col min-h-screen bg-surface-sunken text-on-surface [--_drawer-height:calc(var(--c-main-viewport-height,100dvh)_-_var(--_nav-offset))]',
},
variants: {
  disableLayout: {
    false: {
      layout:
        "grid grow gap-0 overflow-y-clip [grid-template:'toolbar_toolbar'_auto_'sidenav_page'_1fr_/_auto_1fr] before:content-[''] before:[grid-area:sidenav] before:bg-nav-surface [--_drawer-pull:calc(-1*var(--_drawer-height))]",
    },
    true: { layout: 'contents' },
  },
  staticToolbar: { /* unchanged: --_nav-offset */ },
}
```

- `overflow-y-clip` only (the drawer's overhang is vertical); `overflow-x` must stay `visible`.
- `--_drawer-pull` is defined only in the grid mode: in the `disable-layout` column a zero-height
  drawer would overlap the following `c-page`. Column mode keeps today's behaviour exactly (the
  slot is `contents`, so the root's flex column flows through it and `::slotted(c-page) { flex }`
  still applies).
- Escape-hatch CSS: the drawer rule reads the two properties; everything else unchanged.

```css
main ::slotted(c-side-navigation[data-desktop]) {
  position: sticky;
  top: var(--_nav-offset);
  align-self: start;
  height: var(--_drawer-height);
  /* Zero-height margin box: the drawer is one pinned height tall but adds nothing to
     the row, so the page alone sizes the layout and a page that fits never scrolls. Its
     overhang below the layout at rest is clipped by the grid box. The sticky position
     box is the margin box, so it still pins until the row leaves the viewport. */
  margin-bottom: var(--_drawer-pull, 0px);
  overflow: visible;
}
```

- Rewrite the script docblock comment (root = shell column, layout = grid box with the clip,
  `::before` moved to the grid box) and the `@csspart root` line: "The shell box: paints the page
  canvas and is at least a viewport tall; the dashboard grid is laid out inside it".
- `syncToolbar` / `slotRef` / the `MutationObserver` are untouched.

### 2. `packages/csc-ui/src/components/c-main/CMain.spec.ts`

New `describe('a page that fits the viewport', …)` — each fails before the fix:

- `does not scroll under a static toolbar`: `mountMain(STATIC_TOOLBAR + nav(ITEMS + BOTTOM) + page('100px'))`
  → `document.scrollingElement!.scrollHeight === window.innerHeight`; root height `=== innerHeight`;
  drawer top `=== barOf(m).getBoundingClientRect().bottom` (items start below the bar at rest);
  bottom slot bottom `≈ innerHeight − DRAWER_INSET`; footer bottom `≈ innerHeight`.
- `does not scroll under a banner` (`BANNER + TOOLBAR`) and `… under a banner and a static toolbar`.
- `does not scroll a bounded shell` (root `height: 320px; min-height: 0; overflow-y: auto;
  --c-main-viewport-height: 320px`, static toolbar) → `root.scrollHeight === 320`.
- `still scrolls the document horizontally for a wide page` (a 3000px-wide div in the page) →
  `document.scrollingElement!.scrollWidth > window.innerWidth` — guards `overflow-x: visible`.

Existing specs stay as they are (pinned geometry, static follow, banner hand-over, bottom slot,
bounded shell drawer size, `disable-layout`). Visual baselines `dashboard` / `bottom-slot` shoot
`m.part('root')`, whose geometry is unchanged; rewrite with `pnpm ui test:update` only if the diff
is real and reviewed.

### 3. `docs/adr/0051-c-main-scrolls-the-document.md`

Append `## Amendment (2026-09-22): the page alone sizes the layout`, and add a line to the header
("Amended 2026-09-22: …"). Content: the report and the measured overflow; the cause (the pinned
height sizing the row below the banner/toolbar rows; the 2026-09-16 amendment's "below the fold"
note was that overflow); the decision (zero-height margin box, grid box is the default slot and
clips vertically, no new part); considered options from Decision 7; consequences — content that
paints below `c-main`'s bottom edge is clipped instead of extending the document (in-flow content
is unaffected because the layout grows with the page; native popovers, fixed panels and the
mobile drawer are unaffected), and the grid is no longer on the `root` part.

### 4. Docs

- `packages/csc-ui/src/components/c-main/usage.md`: "Dashboard layout" — add that a page that fits
  the viewport does not scroll: the banner, the toolbar and the page size the layout, the drawer
  never adds to it. "Customization" — `::part(root)` is the shell box (canvas, min-height, the
  bounded-shell recipe); the grid inside it is not a customization surface.
- `packages/csc-ui/src/components/c-side-navigation/usage.md` and `c-toolbar/usage.md`: no change
  (re-read to confirm nothing claims the old residual).
- Docs examples (`app/examples/c-main/static-toolbar.*`): markup unchanged; the 320px shell now
  stops at the footer. React wrapper regenerates from the manifest on `pnpm build` (no API change).

### 5. Changeset

`.changeset/main-short-page-no-scroll.md`, `patch` for `@cscfi/csc-ui` and `@cscfi/csc-ui-react`:
a page that fits the viewport no longer scrolls by a toolbar height under a `static` toolbar, or
by the banner's height; the drawer still fills the viewport once pinned; content painting below
`c-main`'s bottom edge is now clipped; the dashboard grid is no longer on `::part(root)`.

Commit: `Fix(c-main): Keep a page that fits the viewport from scrolling under a static toolbar or a banner`.

## Verification

1. `pnpm --filter @cscfi/csc-ui test:browser -- src/components/c-main/CMain.spec.ts` — new specs
   red before the CMain.vue change, green after; then `CSideNavigation.spec.ts`,
   `CToolbar.spec.ts`, `CPage.spec.ts` one file per run (devcontainer memory).
2. `pnpm --filter @cscfi/csc-ui lint` (tokens / a11y guards) and `pnpm build` (tag map, manifest;
   watch for the new-SFC Tailwind scan miss — grep `dist` for `overflow-y: clip`).
3. `pnpm --filter csc-ui-documentation test` — the c-main canons mount against the built bundle.
4. Manual: the docs' static-toolbar example (bounded shell) scrolls exactly to its footer and the
   toolbar returns at the top; an app-shaped page with a short route shows no scrollbar. Chromium
   is the only engine in CI; sanity-check Firefox and Safari by hand on the same example (the fix
   leans on the sticky position box being the margin box).
5. Re-run the ad-hoc measurement (serve `dist`, mount the five fixtures) if in doubt: every
   overflow must read 0 and the pinned geometry must match the table's pinned values.
