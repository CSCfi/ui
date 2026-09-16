# c-side-navigation's bottom slot pins to the bottom edge inside c-main

## Context

Report (dashboard layout, `c-toolbar static`, something in `c-main`'s `banner` slot, a button in
`c-side-navigation`'s `bottom` slot, drawer carrying the 3.x `class="autoheight"`): the button
starts below the viewport at load, and once the page has scrolled the bottom slot sits 60px above
the viewport bottom. It should stick to the bottom. The third point (banner content not themeable
with Tailwind) was user error — a non-existent utility class — and needs no change.

Root cause (all in ADR-0051's new geometry; `V` viewport, `T` = `--spacing-toolbar` 60px, `B` banner
height, `O` = `--_nav-offset`: `T` under a pinned toolbar, `0` under a static one):

- `CMain.vue` pins the drawer host with `position: sticky; top: O; align-self: start;
  max-height: calc(100dvh − O); overflow-y: auto` but gives it **no height**, so a short menu
  collapses to its content height and the bottom slot sits under the last item (the grid `::before`
  paints the column, so the drawer only *looks* full-height). The `h-screen` grid used to stretch it.
- `CSideNavigation.vue` `:host(.autoheight) { height: calc(100dvh − T) }` is one toolbar height
  short under a static toolbar (`O = 0`) → the slot floats 60px too high once pinned.
- Any fixed drawer height computed as "viewport − pin offset" is right only once the drawer has
  reached its pin. At scroll 0 the banner and toolbar rows put its top at `B + T`, so its bottom is
  `B + T − O` below the viewport. Sticky boxes cannot change height as they approach their pin.

## Decisions (grilling session, 2026-09-16)

1. **Bottom slot behaviour**: always at the drawer's bottom edge — the viewport bottom on desktop
   inside `c-main` (at load under a banner/static toolbar, while pinned, short and long menus), the
   panel's bottom in the mobile drawer. The items scroll above it; the slot never needs the menu
   scrolled first.
2. **Mechanism — CSS only.** `c-main` gives the desktop drawer its exact pinned height and makes it
   *not* a scroll container; inside `c-side-navigation` the item list (`<nav>`) is the scroller and
   the bottom region is `position: sticky; bottom: 0`, so it rides up over the drawer while the
   banner/static toolbar is still on screen. Accepted residual: with a long menu, the last
   `B + T − O` px of the list sit behind the slot until those rows have scrolled away. Rejected: a
   scroll-measured drawer height in `c-main` (exact, ~30 lines of JS, amends the ADR's "without
   measurement" stance).
3. **Structure**: the bottom slot moves out of the `<nav role="menubar">`. Drawer root = flex column
   `[mobile close row] [nav: items, flex-1 min-h-0, scrolls, part="nav" keeps its meaning]
   [bottom region: shrink-0 sticky bottom-0]`. A bottom-slot action is no longer a menubar child.
   The legacy `styles` prop keeps applying to the nav only.
4. **Bounded shells**: the explicit height must be viewport-sized (`100dvh`), which would make the
   drawer ~viewport tall inside the docs canons' 320px `::part(root)` box (`100cqh` falls back to
   `svh`, re-creating the "too high" symptom on tablets; percent heights resolve against the grid
   area, i.e. page-content height). So `c-main` gains a public
   `@cssprop --c-main-viewport-height` (default `100dvh`, read with a `var()` fallback so it can be
   set on the host or the part). A bounded shell sets it to its box height. Precedent:
   `--c-font-family` on c-button; the analyzer (`scripts/analyzer/lint.mjs`) and the docs API table
   already handle `@cssprop`.
5. **Record**: amend ADR-0051 (dated note); no new ADR. Glossary gains **Side navigation**,
   **Drawer**, **Bottom slot** in the Layout section.
6. **Banner theming**: no change.

## Implementation

### 1. `packages/csc-ui/src/components/c-side-navigation/CSideNavigation.vue`

Template:

```vue
<div :class="ui.content()" part="root">
  <div v-if="mobile" :class="ui.burger()">…unchanged close button…</div>
  <nav ref="containerRef" :class="ui.nav()" part="nav" role="menubar">
    <div :class="ui.wrapper()"><slot /></div>
  </nav>
  <div ref="bottomRef" v-show="hasBottom" :class="ui.bottom()"><slot name="bottom" /></div>
</div>
<div v-if="menuVisibleInternal && mobile" class="c-overlay c-fade-in" @click="closeMenu" />
```

- `hasBottom = useHasSlot(bottomRef, 'bottom')` (`src/shared/useHasSlot.ts`, pattern from
  `CButton.vue:523`) so drawers without a bottom slot keep today's box (no empty padded region).
- tv slots: `content` → `flex flex-col min-h-0 flex-[1_2_260px] w-80 bg-nav-surface`;
  `nav` → drop `flex-nowrap gap-1 min-h-fit max-h-full`, add `min-h-0 overscroll-contain`, keep
  `relative flex flex-col flex-1 w-full overflow-y-auto p-6 z-[8] bg-nav-surface transition-…`;
  `wrapper` → `flex flex-col gap-px` (drop `shrink-0 min-h-full`); remove `spacer`; new
  `bottom` → `shrink-0 sticky bottom-0 z-[8] bg-nav-surface px-6 pb-6 pt-2` (the old spacer's
  `mb-2` becomes `pt-2`; horizontal inset matches the nav's `p-6`).
- mobile variant: `content` `overflow-y-scroll` → `overflow-hidden` (the nav scrolls); drop the
  `wrapper: min-h-[calc(100%-var(--spacing-toolbar))]` rule; compound `mobile` nav rule becomes
  `pt-0` only.
- Escape hatch unchanged (`:host(.autoheight)`, `:host([data-desktop])`, overlay, `::slotted`
  `display: contents`). Standalone `autoheight` still works: the host is viewport-sized, the nav
  shrinks and scrolls inside it, so the host itself never overflows.
- Docblock: `@slot bottom - Trailing content below the items (a sign-out button); stays at the
  drawer's bottom edge while the items scroll`; refresh the tv comment (drawer structure, why the
  bottom region is sticky, why it sits outside the menubar).

### 2. `packages/csc-ui/src/components/c-main/CMain.vue`

- Docblock: add `@cssprop --c-main-viewport-height - Height of the scroll viewport the layout pins
  against (default 100dvh); a bounded shell with its own scrollbar sets it to its box height`.
- Replace the `main ::slotted(c-side-navigation[data-desktop])` rule body:

```css
position: sticky;
top: var(--_nav-offset);
align-self: start;
/* Exact pinned height: the bottom slot sits at the bottom edge and a short
   menu fills the column. Overrides `.autoheight` (outer tree wins over :host). */
height: calc(var(--c-main-viewport-height, 100dvh) - var(--_nav-offset));
/* Not a scroll container: the item list scrolls inside c-side-navigation and
   the bottom slot's own sticky needs the document (or a bounded shell) as
   its nearest scrollport. */
overflow: visible;
```

  (drops `max-height`, `overflow-y: auto`, `overscroll-behavior` — the last moves to the nav in
  c-side-navigation). Update the tv docblock and the escape-hatch comment accordingly; keep the
  grid `::before` (still paints the column below the drawer when the toolbar is static).

### 3. Specs (fail before the fix; harness `src/test/harness.ts`)

`c-main/CMain.spec.ts` — new fixtures `BOTTOM = '<c-button slot="bottom">Sign out</c-button>'`,
`LONG_NAV` (40 items), helper `bottomOf(m)` = `m.host.querySelector('[slot="bottom"]')`,
`navPartOf(m)` = nav host `shadowRoot [part~="nav"]`:

- *static toolbar + banner + `class="autoheight"` + bottom slot + 3000px page*: at scroll 0
  `bottomOf.rect.bottom <= innerHeight`; after `scrollTo(500)` `=== innerHeight` and the nav host
  height `=== innerHeight` (today: off-screen, then `innerHeight − 60`).
- *short menu, pinned toolbar*: nav host height `=== innerHeight − 60`, slot bottom `=== innerHeight`
  (today: content height).
- *long menu*: `navPartOf` `scrollHeight > clientHeight`, `overscrollBehaviorY === 'contain'`; after
  `scrollTo(500)` the slot rect is inside the viewport and `navPart.rect.bottom <= slot.rect.top`.
- *bounded shell*: `m.part('root').style.cssText = 'height:320px;min-height:0;overflow-y:auto;
  --c-main-viewport-height:320px'` → nav host height `=== 260`, slot bottom `===` root rect bottom.
- Adjust existing assertions: `overflowY` → `'visible'`, `maxHeight` → `height`, move the
  `overscrollBehaviorY` check to the nav part (both in the pinned and the static test).
- `visual: the dashboard` keeps its name; add `visual: bottom slot` (short menu + `BOTTOM`) and
  commit the two PNGs from `pnpm ui test:update`.

`c-side-navigation/CSideNavigation.spec.ts`:

- autoheight test: the scroller is now the nav part (`scrollHeight > clientHeight`,
  `overscrollBehaviorY` contain); host height unchanged (`innerHeight − 60`).
- new: *mobile drawer* (`attrs: { mobile: true, 'menu-visible': true }`, 40 items + bottom slot):
  slot bottom `=== innerHeight`, nav part scrolls.

`pnpm ui exec vitest run --project node -u` refreshes `c-main/api.snapshot.json`
(`cssProperties` gains `--c-main-viewport-height`); c-side-navigation's snapshot is unchanged.

### 4. Docs

- `c-main/usage.md`: Dashboard layout paragraph — the drawer fills the pinned height, a long menu
  scrolls inside it and the bottom slot stays at the bottom edge; Customization — the bounded box
  recipe adds `--c-main-viewport-height` set to the box height.
- New `c-side-navigation/usage.md` (ADR-0026 gap; description = first paragraph): what it is; *Inside
  c-main* (pinned automatically, `autoheight` ignored there); *Bottom slot* (sign-out etc., stays at
  the bottom edge, not a menu item); *Mobile drawer*; *Standalone* (`autoheight` host state);
  *Customization* (`::part(root)`, `::part(nav)`).
- Canons `app/examples/c-main/basic.*` and `static-toolbar.*` (vue, react.tsx, angular.ts,
  typescript.html — parity guarded by `scripts/check-example-parity.mjs`): add
  `--c-main-viewport-height: 320px;` to the `.demo-shell::part(root)` demo CSS; `basic.*` also gets
  `<c-button slot="bottom" inverted>Sign out</c-button>` in the side navigation. Import `CButton`
  in the React flavor.
- `app/content/migration.ts` toolbar/page block: "(autoheight stays for standalone use; inside
  c-main it is ignored)".

### 5. Record

- `CONTEXT.md` Layout section, after **Page**:
  - **Side navigation** (`c-side-navigation`): The **dashboard layout**'s left-hand menu — section
    titles, items and sub-items. Its box is the **drawer**; below the items sits the **bottom
    slot**. On desktop `c-main` pins it beneath the **toolbar**; on mobile it is a slide-in panel.
    _Avoid_: Sidebar, side menu, nav bar, menu (the command-menu component)
  - **Drawer** (side navigation): The side navigation's box: the pinned desktop column whose item
    list scrolls on its own, or the mobile slide-in panel over the page. `autoheight` is its
    standalone viewport-high state.
    _Avoid_: Panel (transient surfaces), sidebar
  - **Bottom slot** (side navigation): The region below the items (`slot="bottom"`) for a trailing
    action such as sign-out. It stays at the drawer's bottom edge — the viewport's on desktop, the
    panel's on mobile — while the items scroll above it; not a menu item, never needs the menu
    scrolled to be reached.
    _Avoid_: Footer (`c-page`'s slot), drawer footer, sticky button
- `docs/adr/0051-c-main-scrolls-the-document.md`: Status gains "Amended 2026-09-16 (bottom slot,
  bounded shells)"; new section **Amendment (2026-09-16)**: the drawer has an explicit height
  `viewport − offset` (a fixed sticky box cannot shrink before its pin, so the bottom slot pins
  itself to the bottom edge with a second sticky; residual overlap of a long menu's tail while the
  banner is on screen); a bounded shell declares its scrollport height through
  `--c-main-viewport-height` because no CSS unit knows an ancestor scrollport's height (`cqh` falls
  back to `svh`) and measurement was rejected; `autoheight` is inert inside `c-main`.
- `.changeset/side-navigation-bottom-slot.md` (`patch` for both packages): the bottom slot stays at
  the drawer's bottom edge on desktop and mobile; inside `c-main` the drawer fills the pinned height
  (short menus, `autoheight` ignored) and the slot reaches the bottom edge before the drawer has
  pinned under a banner or static toolbar; long menus scroll above the slot; new
  `--c-main-viewport-height` for bounded shells.
- Commit: `Fix(c-side-navigation): Keep the bottom slot at the drawer's bottom edge inside c-main`.

## Verification

1. `pnpm ui test:browser -- c-main c-side-navigation` — the new specs fail on the current tree
   (run once before editing to confirm), pass after; no `[Vue warn]`/`console.error`.
2. `pnpm ui test:update`, then review the `__screenshots__` diffs (dashboard baseline should be
   near-identical; new bottom-slot PNGs).
3. `pnpm ui exec vitest run --project node -u` for the API snapshot; `pnpm ui build` (strict
   manifest: the `@cssprop` is referenced via `var(`, the new `@slot` text passes lint) and
   `pnpm ui lint`.
4. `pnpm build` then `pnpm --filter csc-ui-documentation test` (canon smoke incl. the React
   `CButton` import) and `pnpm --filter csc-ui-documentation lint:examples`.
5. Manual: `pnpm dev`, open the c-main page: in the boxed basic canon the "Sign out" button sits on
   the box's bottom edge at rest and while scrolling; in the static-toolbar canon the drawer pins to
   the box top with no gap below. Optionally reproduce the report in the app with `autoheight`
   left on the drawer.

## Outcome (2026-09-16)

Implemented as planned; all csc-ui suites (37 files), the docs example smoke and the React build pass.
Notes learned while implementing:

- **Row inflation.** Sizing the sticky drawer to `viewport − offset` makes the sidenav grid row at
  least that tall, so with a banner and/or a static toolbar the layout is `B + T − O` taller than the
  viewport even for a short page: the document scrolls by exactly that much, which is what lets the
  banner/static toolbar leave and the whole drawer come into view (clipping the overflow instead
  would have left a long menu's tail unreachable on short pages). The `dashboard` visual baseline
  grew from 800 to 840px for this reason. With a pinned toolbar and no banner nothing changes.
- **Drawers without a bottom slot** are 9px shorter (the old `spacer mb-2` + `gap-px` are gone);
  the `c-sub-navigation-item` baselines were re-authored accordingly.
- **Standalone, unclamped drawers** (no `c-main`, no `autoheight`) with a bottom slot: the sticky
  region follows the viewport's bottom edge until the drawer's end scrolls into view — the classic
  sticky-footer behaviour, consistent with the glossary definition.
- `vitest run --project browser --update <one file>` swallows the file as the flag's value and runs
  (and rewrites) every failing baseline; put `-u` after the file list.
