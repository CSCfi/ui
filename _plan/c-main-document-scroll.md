# c-main: document scroll and a static toolbar

> Plan record. Step 0 of the implementation copies this file to `_plan/c-main-document-scroll.md`
> in the repo (plan records live under `_plan/`), then applies the CONTEXT.md and ADR edits queued
> below (plan mode blocked them during the grilling session).

## Context

The request: "we'd like the toolbar to be hideable on scroll (not be fixed to the top). Requires a
new prop?" Added during the session: "we'd also like to add a banner slot on top of the toolbar
in c-main."

What the code does today (verified 2026-09-15):

- `c-main` does **not** position the toolbar. It is a CSS grid (`toolbar toolbar / sidenav page`)
  clamped to `h-screen`, and it only assigns `grid-area` to slotted children via `::slotted()`.
- `c-toolbar` fixes itself: root `fixed z-10 h-[60px]` plus a 60px spacer div. The only in-flow
  switch is the host class `relative` (a `:host(.relative)` escape-hatch rule with
  `margin-bottom: -60px`). Zero props.
- **The scroll container is `c-page`'s host** (`height: calc(100lvh - 60px); overflow-y: auto`).
  Neither the window nor `c-main` scrolls. So inside `c-main` the toolbar never moves whether it is
  fixed or not; `class="relative"` changes nothing there. "Hideable on scroll" is really a question
  about **which element scrolls**.
- 60px is hardcoded in four library places (`CToolbar.vue` root + spacer + escape hatch,
  `CPage.vue` host height, `CSideNavigation.vue` `.autoheight` and mobile wrapper) plus the docs
  site's `sticky top-15`.
- The page lock (`shared/pageLock.ts`, ADR-0014) sets `overflow: hidden` on the document element,
  so today a modal opened inside `c-main` does not stop `c-page` scrolling behind it.
- Neither `c-main` nor `c-toolbar` has a spec or a visual baseline; `c-toolbar` has no `usage.md`.
- The glossary has no entry for the layout family; "sticky" is reserved for data-table rows;
  "pinned" already means "stuck to an edge of the scroll viewport while content scrolls".
- Changesets pre mode (4.0.0-alpha.16): breaking the layout contract is cheap now.
- **Verified in the pinned headless Chromium 148: `:host(:has(c-toolbar[static]))` does not
  match** (`CSS.supports` false, rule never applied) while `::slotted()` rules do. c-main therefore
  reads the toolbar's mode with a slot-scoped `MutationObserver`, not CSS (see step 3).

## Decisions (grilling session, 2026-09-15)

| # | Decision | Chosen |
|---|----------|--------|
| 1 | Behaviour | **Scroll-away toolbar**: an in-flow bar that leaves with the page. CSS only. Auto-hide deferred; can be a second boolean later. |
| 2 | Scroll container | **The document.** `c-main` grows with content, `c-page` stops scrolling, the side navigation is pinned by `c-main`. |
| 3 | Mode owner | **Prop on `c-toolbar`; `c-main` reads it.** Mechanism revised after verification: c-main observes the slotted toolbar's reflected `static` attribute (slotchange + MutationObserver) and feeds a `tv` variant. `c-main` gets no new prop. |
| 4 | Prop name | **`static`**, boolean, default `false`. Default state is *pinned*. Not `@defaultable`. |
| 5 | `class="relative"` | **Removed now.** Canons switch to `static`; migration guide gets an entry. |
| 6 | Side navigation | **`c-main` pins the desktop side navigation automatically** (sticky + inner scroll; offset follows toolbar mode). `autoheight` host class untouched for standalone use. |
| 7 | Glossary term | **Dashboard layout**. Avoid: app shell, frame, chrome. |
| 8 | ADR | **One ADR (0051)**: c-main scrolls the document; pinned toolbar + side-navigation coupling as consequences. |
| 9 | Banner | **Named slot `banner` on c-main, top row of the grid, in flow.** It scrolls away with the page; the sticky toolbar pins to the top edge once it is gone (native sticky hand-over, no new mechanics). Works unchanged with a static toolbar. |
| 10 | Banner name | **`banner`**: matches c-data-table's `banner` part (a message strip with an action). The ARIA `banner` landmark (the site header) is a different sense, recorded in the glossary's avoid line. |

Routine calls made without asking (flag if wrong):

- Pinned toolbar = `sticky top-0 z-10` on the root; no spacer. Sticky works in any scroll
  container, so the docs canon can demo the real pinned behaviour inside a bounded shell.
- **`static` mode uses `position: relative`**, not `static`: `static` discards `z-index`, and the
  bar's drop shadow would then paint under positioned page content (c-page's container is
  `relative`). The prop and glossary term describe the in-flow behaviour, not the CSS keyword.
- `c-toolbar` keeps `defineOptions({ inheritAttrs: false })` even as a single-root template: a
  legacy `class="relative"` on the host would otherwise land on the root as `.relative` and fight
  the positioning utilities (known host-class leak hazard).
- Toolbar height becomes a Tailwind theme value `--spacing-toolbar: 60px` (`@theme static`, so the
  variable survives even when no utility uses it). Internal, not a public token. Gives `h-toolbar`.
- `c-page` keeps `scroll-indicator`, retargeted to the document scroller.
- `c-main`'s root uses `min-h-screen` in both variants (`disable-layout` too). `vh` not `dvh`:
  `dvh` would resize on mobile URL-bar collapse.
- The side-navigation column keeps painting `nav-surface` for the full page height (as today)
  via a `::before` grid item behind the now content-tall sticky host.
- The remaining `60px` literals in `CSideNavigation.vue` switch to `var(--spacing-toolbar)`
  (behaviour-preserving).
- The banner slot is a **raw** named slot: c-main only places the slotted element full-width
  above the toolbar (and first in the `disable-layout` column). No wrapper, no `banner` part, no
  default look; the consumer brings the content (a `c-alert`, or their own strip). It is c-main's
  first named slot.

## Implementation

### 0. Records

- Copy this file to `_plan/c-main-document-scroll.md`.
- Add the `### Layout` section and the flagged ambiguity to `CONTEXT.md` (text below).
- Write `docs/adr/0051-c-main-scrolls-the-document.md` (text below).

### 1. `packages/csc-ui/src/tailwind.css` — toolbar height theme value

After the `--ease-standard` block (~line 164):

```css
/*
 * Layout value. The toolbar height was a 60px literal in c-toolbar, c-page and
 * c-side-navigation; `--spacing-toolbar` gives c-toolbar `h-toolbar` and lets
 * c-main's escape-hatch CSS offset the pinned side navigation. `static` keeps
 * the variable in the sheet even when no utility references it (c-main reads
 * it through `var()`). Theme values are emitted under `:root, :host`, so they
 * resolve on every component host and inherit into slotted light-DOM children.
 */
@theme static {
  --spacing-toolbar: 60px;
}
```

Verified: the built sheet already emits `@layer theme{:root,:host{…--ease-standard…}}`, so theme
variables resolve inside shadow roots and on hosts. Tailwind 4.3.1 resolves `h-*` against
`--spacing-*`, so `h-toolbar` exists.

### 2. `packages/csc-ui/src/components/c-toolbar/CToolbar.vue`

- Template: single root, remove the spacer div.
- `tv`: `slots.root = 'z-10 flex h-toolbar w-full items-center gap-x-3 px-4 bg-surface-raised text-on-surface-muted shadow-[2px_4px_10px_#00000029] border-b border-border'`;
  `variants.static = { false: { root: 'sticky top-0' }, true: { root: 'relative' } }`;
  `defaultVariants.static = false`.
- Props: `interface CToolbarProps { /** Keep the toolbar in the page flow so it scrolls away with the content instead of staying pinned to the top of its scroll container */ static?: boolean }`,
  `withDefaults(…, { static: false })`. No `@defaultable`, no `@default`/`@since` tags (none exist
  in this codebase; the analyzer reads the default from `withDefaults`).
- `ui = computed(() => toolbar({ static: coerceBoolean(props.static) }))` (import from
  `../../shared/coerceBoolean`; bare attributes arrive as `''`).
- Keep `defineOptions({ inheritAttrs: false })`; update its comment (host classes must not leak to
  the root).
- Delete the `<style>` block (`:host(.relative)` rule) entirely.
- `@csspart root` text: "The toolbar bar itself: pinned to the top of its scroll container by
  default, in flow when `static`".
- Rewrite the styling doc comment: sticky pinning, own grid row so no spacer, `static` in flow via
  `relative`, height from `--spacing-toolbar`, ADR-0051.

Vue 3.5.39 verified: setting the property (`el.static = true/false`) reflects to / removes the
`static` attribute via `_setProp(shouldReflect=true)`; `static="false"` strings normalise at
connect (`defineElement.ts` `normalizeBooleanAttributes`).

### 3. `packages/csc-ui/src/components/c-main/CMain.vue`

**Template**

```html
<main :class="ui.root()" part="root">
  <slot name="banner" />
  <slot ref="slotRef" @slotchange="syncToolbar" />
</main>
```

Docblock: add `@slot banner - A full-width message strip above the toolbar; it scrolls away with
the page` (the analyzer requires `@slot` tags to match the template 1:1).

**tv**

- `slots.root`: `'flex flex-col min-h-screen bg-surface-sunken text-on-surface'`.
- `variants.disableLayout.false.root`: add the banner row and the column fill:
  `"grid gap-0 [grid-template:'banner_banner'_auto_'toolbar_toolbar'_auto_'sidenav_page'_1fr_/_auto_1fr] before:content-[''] before:[grid-area:sidenav] before:bg-nav-surface"`.
  An empty banner slot leaves its `auto` row at 0, so nothing shifts when no banner is slotted.
  The `::before` is a grid item stretched over the whole `sidenav` cell; it has no intrinsic width,
  so without a desktop side navigation the `auto` column stays 0 and nothing paints. The slotted
  nav host comes later in the flat tree and paints above it.
- New variant `staticToolbar`: `{ true: { root: '[--_nav-offset:0px]' }, false: { root: '[--_nav-offset:var(--spacing-toolbar)]' } }`,
  `defaultVariants.staticToolbar = false`. `--_nav-offset` is a private channel from `main` to
  the `::slotted()` rule below (custom properties inherit along the flat tree through the slot).

**Script** — observe the slotted toolbar

```ts
const host = useHost();
const slotRef = useTemplateRef<HTMLSlotElement>('slotRef');   // <slot ref="slotRef" @slotchange="syncToolbar" />
const staticToolbar = ref(false);
let observer: MutationObserver | null = null;
let observed: Element | null = null;

const readStatic = (bar: Element | null) => {
  const attr = bar?.getAttribute('static');
  staticToolbar.value = attr != null && coerceBoolean(attr);
};

const syncToolbar = () => {
  const bar = slotRef.value?.assignedElements({ flatten: true }).find((el) => el.localName === 'c-toolbar') ?? null;
  if (bar !== observed) {
    observer?.disconnect();
    observed = bar;
    if (bar) observer?.observe(bar, { attributes: true, attributeFilter: ['static'] });
  }
  readStatic(bar);
};

onMounted(() => { observer = new MutationObserver(() => readStatic(observed)); syncToolbar(); });
onBeforeUnmount(() => { observer?.disconnect(); observer = null; observed = null; });

const ui = computed(() => main({ disableLayout: coerceBoolean(props.disableLayout), staticToolbar: staticToolbar.value }));
```

Pattern precedent: `shared/useHasSlot.ts` (native `slotchange`), `CSideNavigation.vue` listener
cleanup in `onBeforeUnmount`. Reading the attribute (not the property) is deliberate: Vue reflects
the prop to the attribute, and `'false'` strings must read as pinned, matching `coerceBoolean`.

**Escape-hatch `<style>`** (replaces the current block; ADR-0007 allow-list only)

```css
::slotted(*) { color: var(--c-on-surface); }

/* The banner is whatever the consumer slots; c-main only places it in the top row. */
main slot[name='banner']::slotted(*) { grid-area: banner; }

main ::slotted(c-toolbar) { grid-area: toolbar; }

main ::slotted(c-page) {
  grid-area: page;
  /* disable-layout flex column: the page still fills the viewport so the footer slot sits at the bottom; inert in the grid. */
  flex: 1 1 auto;
}

main ::slotted(c-side-navigation) { grid-area: sidenav; }

/*
 * Desktop drawer (c-side-navigation sets `data-desktop` itself) pinned beneath the toolbar,
 * or to the top edge when the toolbar is static (`--_nav-offset`, set by the tv variant).
 * `align-self: start` stops the sticky box from stretching to the whole row — a stretched
 * sticky item has nowhere to move. The height clamp gives a long menu its own scrollbar.
 * The mobile drawer carries no `data-desktop` and is untouched.
 */
main ::slotted(c-side-navigation[data-desktop]) {
  position: sticky;
  top: var(--_nav-offset);
  align-self: start;
  max-height: calc(100vh - var(--_nav-offset));
  overflow-y: auto;
}
```

Cascade: c-main's `::slotted()` declarations beat c-side-navigation's own `:host([data-desktop])`
(outer tree wins for normal declarations) and set different properties anyway; a consumer's
document stylesheet beats both.

- Update the doc comment (root grows with content, document scrolls, ADR-0051) and `@csspart root`
  text ("carrying the page canvas and the dashboard grid").

### 4. `packages/csc-ui/src/components/c-page/CPage.vue`

- `:host` rule: drop `height`, `overflow-y`, `scroll-behavior`; keep `display: grid;
  grid-template-rows: 1fr auto; grid-template-columns: 1fr; width: 100%; position: relative;
  place-items: start start`. As a stretched item of c-main's `1fr` row it fills the viewport, so
  the footer slot stays at the bottom on short pages; standalone it grows with content.
- `onScroll`: read `document.scrollingElement` (`scrollTop / (scrollHeight - clientHeight)`);
  listen on `window` with `{ passive: true }`; remove in `onBeforeUnmount`.
- Update the comments (host is no longer the scroll container; the document is).

### 5. `packages/csc-ui/src/components/c-side-navigation/CSideNavigation.vue`

- `:host(.autoheight) { height: calc(100vh - var(--spacing-toolbar)) }`.
- Mobile `wrapper: 'min-h-[calc(100%-var(--spacing-toolbar))]'`.
  Behaviour-preserving; `autoheight` itself stays (standalone use, docs site).

### 6. Build, regenerate, lint

```bash
pnpm --filter @cscfi/csc-ui build
grep -o '\.h-toolbar{[^}]*}\|\.min-h-screen{[^}]*}\|--spacing-toolbar:[^;}]*' packages/csc-ui/dist/csc-ui.js   # all three must appear; rebuild on a first-build scan miss
pnpm --filter @cscfi/csc-ui-react build
pnpm --filter @cscfi/csc-ui lint
pnpm --filter @cscfi/csc-ui exec vitest run --project node -u   # api.snapshot.json
```

Committed diffs to review: `packages/csc-ui/src/tag-name-map.ts` (`CToolbarElement` gains
`static`), `packages/csc-ui-react/src/components.ts` (JSDoc from the new usage.md),
`packages/csc-ui/src/components/c-toolbar/api.snapshot.json` (`"static": "boolean = false"`).

### 7. Specs and baselines (ADR-0049)

Harness: `mount(tag, { attrs, html, props, stage })` in `src/test/harness.ts`; pass
`stage: false` for viewport-wide roots; `settle()` = 2 rAF; `matchScreenshotInBothModes(el, name)`;
`afterEach(() => window.scrollTo(0, 0))` because the page is shared.

`c-toolbar/CToolbar.spec.ts`
- pinned by default: root `position: sticky`, `top: 0px`, height 60, no `static` attribute, one
  shadow child (no spacer)
- `host.static = true` reflects the attribute and puts the bar in flow (`position: relative`);
  `false` removes it and restores sticky
- bare `static` attribute is honoured (`attrs: { static: true }`)
- visual: `pinned` and `static` baselines on `m.part('root')`

`c-main/CMain.spec.ts` (fixture: c-main > c-toolbar + c-side-navigation (title + item) + c-page
with a 3000px block and a footer)
- the document scrolls and c-page does not (`scrollingElement.scrollTop === 500`; c-page
  `overflowY === 'visible'`, `scrollHeight === clientHeight`)
- the toolbar stays at the viewport top while the document scrolls (root rect top 0)
- the desktop side navigation is pinned beneath the toolbar (`sticky`, `top 60px`, `alignSelf
  start`, `maxHeight === innerHeight - 60`, `overflowY auto`; rect top 60 after scrolling)
- a static toolbar scrolls away and the side navigation pins to the top (`toolbar.static = true;
  await settle()` → `top 0px`, `maxHeight === innerHeight`; after scrolling toolbar rect top < 0,
  nav rect top 0; flipping back restores 60px) — this is the observer's spec
- a toolbar slotted after mount is observed too (append `c-toolbar static` later → `top 0px`)
- a banner sits above the toolbar and scrolls away, then the toolbar pins (fixture adds
  `<div slot="banner" style="height:40px">Notice</div>`; at scroll 0 banner rect top 0 and toolbar
  rect top 40; after `scrollTo(0, 500)` banner rect bottom < 0, toolbar rect top 0, nav rect
  top 60); with no banner the toolbar rect top is 0 at scroll 0 (empty row collapses)
- the banner renders first in the `disable-layout` column
- a short page still puts the footer at the bottom of `main` (main height === innerHeight)
- the mobile drawer is not pinned (`nav.mobile = true` → no `data-desktop`, `position static`)
- `disable-layout` keeps a flex column at least a viewport tall
- visual: `dashboard` and `dashboard-static` baselines on `m.part('root')` with the short fixture

`c-page/CPage.spec.ts`
- the host is not a scroll container (`overflowY visible`, height equals content)
- `scroll-indicator` tracks the document scroll (50% at half, 100% at bottom)
- footer sits at the bottom of a sized host (`style="height: 240px"`, the canon's shape)

Then, in the devcontainer: `pnpm --filter @cscfi/csc-ui test:update`, commit the PNGs under
`c-toolbar/__screenshots__/CToolbar.spec.ts/` and `c-main/__screenshots__/CMain.spec.ts/`, and run
`pnpm --filter @cscfi/csc-ui test`. Conformance suites need no change (`NO_ROOT_PART` unchanged,
c-main already renders viewport-tall in the bare mount).

### 8. Docs

- New `packages/csc-ui/src/components/c-toolbar/usage.md` (¶1 is the description everywhere,
  ADR-0026): the app-wide bar at the top of the dashboard layout, pinned by default, `static`
  keeps it in flow. Sections: Pinned or static · Inside c-main (spans both columns; the side
  navigation pins beneath it, or to the top edge when static) · Content (flex row; push actions
  right with `margin-inline-start: auto`) · Customization (`::part(root)`; the height is the
  library's layout value, overriding it does not move the side navigation).
- Expand `packages/csc-ui/src/components/c-main/usage.md`: ¶1 the page shell that paints the
  canvas and lays out toolbar, side navigation and page, at least a viewport tall and growing with
  content so the document scrolls. Sections: Dashboard layout · Banner (`slot="banner"`: a
  full-width strip above the toolbar that scrolls away; slot a `c-alert` or your own markup;
  `c-alert::part(root)` to drop the radius for an edge-to-edge strip; not the ARIA `banner`
  landmark) · Disabling the layout · Scrolling (the document scrolls; `scroll-indicator`;
  `html { scroll-behavior: smooth }`) · Customization (`::part(root)`; bounded demo-shell recipe
  with `min-height: 0; overflow-y: auto`).
- Canons (`packages/csc-ui-documentation/app/examples/`), every canon in all four flavors
  (`.vue`, `.react.tsx`, `.angular.ts`, `.typescript.html`; parity is enforced by
  `scripts/check-example-parity.mjs`; booleans are bare attributes, React bare props):
  - `c-toolbar/basic.*`: `class="relative"` → `static`; comment "`static` keeps the toolbar in
    the page flow; by default it is pinned to the top".
  - `c-main/basic.*`: drop `class="relative"`; shell `.demo-shell::part(root) { height: 320px;
    min-height: 0; overflow-y: auto; }` (**`min-height: 0` is mandatory** or `min-h-screen` wins);
    delete the dead `.demo-shell c-page { height: auto }`; add a `c-side-navigation` and enough
    paragraphs to overflow so the pinned bar and nav are visible in the card; add
    `<c-alert slot="banner" type="info">Scheduled maintenance on Saturday 06:00–08:00 EEST.</c-alert>`
    so the banner's scroll-away and the toolbar's hand-over are visible in the same demo
    (`slot="banner"` is a plain attribute in all four flavors).
  - New `c-main/static-toolbar.*`: the same shell with `<c-toolbar static>` so both modes sit side
    by side (title auto-derives as "Static toolbar").
  - `c-page/basic.*`: keep `height: 240px`; fix the comment.
- Migration guide `packages/csc-ui-documentation/app/content/migration.ts`, section
  `id: 'components'` (line ~402), new block before "Other components": `c-toolbar` /
  `c-page` — the document scrolls: `class="relative"` → `static` (React `static` prop); c-page has
  no height and does not scroll (drop `c-page { height }` overrides and c-page scroll listeners;
  `scroll-indicator` tracks the document; smooth scrolling is `html { scroll-behavior: smooth }`);
  inside c-main the desktop side navigation is pinned automatically (`autoheight` remains for
  standalone use).
- Docs shell `app/app.vue` needs no change (sticky toolbar inside `flex min-h-screen flex-col`;
  `sticky top-15` still matches 60px).

```bash
pnpm --filter @cscfi/csc-ui-documentation lint:examples && pnpm --filter @cscfi/csc-ui-documentation lint && pnpm --filter @cscfi/csc-ui-documentation test
```

### 9. Changeset (`pnpm changeset` → `.changeset/dashboard-document-scroll.md`)

```md
---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Dashboard layout scrolls the document (ADR-0051):

- `c-toolbar` is pinned with CSS sticky instead of `position: fixed`, drops its spacer, and
  gains a `static` prop that keeps it in the page flow so it scrolls away with the content. The
  `class="relative"` host-class switch is removed; use `static`.
- `c-main` grows with its content instead of clamping to the viewport, and pins the desktop
  `c-side-navigation` beneath the toolbar (or to the top edge when the toolbar is static) with an
  inner scrollbar. No consumer markup needed.
- New `banner` slot on `c-main`: a full-width strip above the toolbar that scrolls away with the
  page; the toolbar pins to the top edge once it is gone.
- `c-page` is no longer a scroll container: no fixed height, no own scrolling.
  `scroll-indicator` tracks the document. Code that read or set c-page's scroll offset must
  target the window; smooth scrolling is the document's (`html { scroll-behavior: smooth }`).
- The toolbar height is the shared `--spacing-toolbar` theme value (60px) instead of a literal.
```

### 10. Final gate

`pnpm build && pnpm test` at the root. Commit style `Feat(c-toolbar): …` / `Feat(c-main): …`.

## Verification

1. `pnpm --filter @cscfi/csc-ui test` passes, including the new CToolbar/CMain/CPage specs; the
   CMain "static toolbar" case fails before step 3's observer is added (proves the coupling).
2. Baselines reviewed: pinned/static toolbar, dashboard/dashboard-static in light and dark.
3. `pnpm dev`, open http://localhost:3500/components/c-main: the basic shell scrolls inside its
   card, the banner scrolls away, then the toolbar and side navigation pin; the "Static toolbar"
   example scrolls the bar away and the nav re-pins to the top. On the docs site itself the
   toolbar still pins (sticky).
4. Manual: a page with a modal inside c-main no longer scrolls behind the open modal (page lock
   now locks the real scroller).
5. `grep -rn '60px' packages/csc-ui/src/components` returns only c-progress-bar.
6. `pnpm build && pnpm test` at the root is green; `tag-name-map.ts`, React `components.ts` and
   `api.snapshot.json` diffs are exactly the `static` prop.

## Out of scope, noted as follow-ups

- Auto-hide (slide away on scroll down, return on scroll up) as a second `c-toolbar` boolean.
- The docs site adopting `c-main`/`c-page` for its own shell.
- `c-side-navigation`'s `autoheight` host class → a prop (same retired shape as `relative`).
- `c-page`'s `scroll-indicator` paints at `z-[9]`, under the toolbar's `z-10`, so it is invisible
  in pinned mode (already true today); raise it above the toolbar in a separate fix.
- Exposing `--c-toolbar-height` as a public `@cssprop` if a consumer needs a taller bar.

## Queued documentation text

### CONTEXT.md — new `### Layout` section (before `### Overlays`)

**Dashboard layout** (`c-main`):
The default arrangement `c-main` gives its slotted layout components: the **toolbar** spanning the
top, the **side navigation** down the left, the **page** filling the rest. The document is the
scroll container; the toolbar and the desktop side navigation are **pinned** by default, and the
layout grows with the page's content. `disable-layout` opts out and leaves `c-main` a plain column.
_Avoid_: App shell, frame, chrome, grid (the mechanism, not the concept)

**Toolbar** (`c-toolbar`):
The app-wide bar at the top of the **dashboard layout** holding the logo, service name and global
actions. **Pinned** by default; **static** puts it in flow so it leaves with the page.
_Avoid_: App bar, header, navbar, fixed toolbar (it is no longer CSS-fixed)

**Banner** (dashboard layout):
A full-width message strip the consumer slots above the **toolbar** (`slot="banner"`): a service
notice, an environment warning. It scrolls away with the page and the toolbar pins in its place.
The same sense as `c-data-table`'s select-all banner: a strip carrying a message and, at most, an
action. Not a landmark.
_Avoid_: the ARIA `banner` landmark (that is the site header region, i.e. the toolbar), header,
notification (transient; that is a toast), alert (the component that may fill the slot)

**Page** (`c-page`):
The routed-content region of the **dashboard layout**, with an optional footer slot at its bottom
edge. It grows with its content and never scrolls on its own; the document does.
_Avoid_: Content area, view, scroll container (the Stencil-era and early-4.0 behaviour)

**Pinned**:
Stuck to an edge of the scroll viewport while the surrounding content scrolls: the **toolbar** and
the desktop **side navigation** in the dashboard layout, a **pinned column**, the **select-all
row**. The concept; CSS `position: sticky` is one way to implement it.
_Avoid_: Sticky (the mechanism; as a term reserved for data-table header/footer rows), fixed (a
different mechanism the toolbar no longer uses), frozen

**Static** (toolbar):
The **toolbar**'s opt-in in-flow state (`static`): the bar is ordinary content at the top of the
page and leaves the viewport as the page scrolls. The opposite of **pinned**. Named for the
behaviour, not the CSS keyword (the bar is positioned `relative` to keep its stacking).
_Avoid_: Relative (the retired 3.x host-class switch), in-flow, unpinned, hidden (nothing hides it)

### CONTEXT.md — `### Flagged ambiguities`, add

**"Sticky"** means (a) the data-table `sticky-header` / `sticky-footer` rows, (b) the CSS mechanism
behind **pinned** elements. Say **pinned** for the concept and reserve "sticky" for the data-table
rows and for literal CSS.

### docs/adr/0051-c-main-scrolls-the-document.md

```md
---
status: accepted
---

# c-main scrolls the document, not an inner element

In 3.x and the early 4.0 alphas `c-main` clamped itself to the viewport, `c-toolbar` was
`position: fixed` behind a spacer, and `c-page`'s host was the scroll container, sized
`calc(100lvh - 60px)`. Making the toolbar able to leave the screen exposed the cost of that shape:
the toolbar's row never scrolled, so no positioning change could move it; the 60px bar height was
hardcoded in four library places and in consumers; the page lock (ADR-0014) locks *document*
scroll, so a modal inside `c-main` never stopped the page behind it; and mobile browser chrome,
router scroll restoration, find-in-page and anchors all address the document scroller and missed.

We decided the **document is the only scroll container of the dashboard layout**. `c-main` grows
with its content, `c-page` is a plain region, and the **toolbar** and desktop **side navigation**
are **pinned** with CSS sticky: the toolbar pins itself, `c-main` pins the side navigation. The
toolbar's `static` prop opts it into flow. `c-main` follows the toolbar's reflected `static`
attribute with a slot-scoped `MutationObserver` to move the side navigation's pin to the top edge,
so the two slotted siblings agree without a second prop. (`:host(:has(c-toolbar[static]))` would
have been CSS-only but does not match in Chromium.)

## Considered options

- Keep `c-page` as the scroller and add an opt-in on `c-main`: nothing breaks, but two layout
  modes forever, the hardcodes stay, and the toolbar prop only does anything in one mode.
- Scroll `c-main`'s root: self-contained, but an inner scroller has the same losses as today (no
  chrome collapse, no scroll restoration, ineffective page lock).
- Own the mode on `c-main` and drive the toolbar from there: `::slotted()` cannot reach the
  toolbar's inner bar, and a standalone toolbar (the docs site) would lose the switch.

## Consequences

- `c-page`'s scroll offset is no longer meaningful; `scroll-indicator` tracks the document.
  Consumer code that scrolled `c-page` must scroll the window.
- `c-toolbar`'s `class="relative"` switch is gone; use `static`.
- The toolbar height is a theme value (`--spacing-toolbar`), no longer a literal.
- `c-side-navigation`'s `autoheight` host class remains for use outside `c-main`.
- A `banner` slot above the toolbar rides on the same sticky hand-over: it scrolls away and the
  toolbar pins in its place, with no measurement or extra channel.
- A future auto-hide (slide away on scroll down) can be a second boolean on `c-toolbar`; it does
  not need to reopen this decision.
```

## Implementation notes (2026-09-15, after the plan)

- **Boxless hosts and grid areas.** The first baseline showed the toolbar spanning only the left
  column: csc-ui hosts are `display: contents`, so a `grid-area` set on the slotted host by
  `::slotted(c-toolbar)` is ignored and the inner bar is auto-placed. Fix: `c-toolbar`'s root
  claims `[grid-area:toolbar]` itself (inert outside a grid), and the banner `<slot>` is styled
  as a block with `[grid-area:banner]` so it is the grid item whatever is slotted into it (a
  `c-alert` host is boxless too). `c-main`'s `::slotted(c-toolbar)` rule is gone. Still no wrapper
  element and no `banner` part. The c-main spec now asserts full-width placement for both the
  toolbar and a slotted `c-alert`.
- **`:host(:has(c-toolbar[static]))`** confirmed non-matching in Chromium 148; the slot-scoped
  `MutationObserver` in `CMain.vue` is the coupling, exercised by the "follows a static toolbar"
  and "observes a toolbar slotted after mount" cases.
- **Baseline anomaly.** A `vitest run … -u` after the grid-area fix left the stale narrow-toolbar
  reference in place and a plain run passed against it, although the render was full-width in a
  probe minutes later and a deliberate fixture change fails the matcher at a 27% mismatch.
  Unexplained; the references were deleted and re-authored from scratch (`-u` only rewrites
  references that fail). Re-author by deleting the PNGs whenever a layout change is expected.
- The `dashboard-static` baseline was dropped: at scroll zero a short page renders identically in
  both toolbar modes, so it duplicated `dashboard`.
- `static` mode is `position: relative` (keeps `z-10`), as decided; the c-toolbar spec asserts
  `relative`.
