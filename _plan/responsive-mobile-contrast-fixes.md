# Responsive, mobile and contrast fixes (grilled 2026-09-16)

Status (2026-09-16): every item below is implemented on `development`, one
commit per item, with the specs and baselines named in the tables. Open
follow-ups: (1) port `c-tabs`' own scroll code onto `useScrollStrip` so both
tab strips share one implementation — `c-tab-buttons` uses the composable,
`c-tabs` still carries its transform-based scroller; (2) the manual iOS check
of items 6–8 (touch and WebKit cannot be driven in the Chromium harness).

Eighteen reported items, resolved in a grilling session. Delivery: one branch
(`development`), **one commit per item**, each library fix with its own
changeset and a behaviour spec that fails before the fix (ADR-0049); docs-only
items get `pnpm changeset --empty`. One PR to `main` at the end.

Decisions recorded elsewhere: ADR-0052 (nav washes), ADR-0050 amendment
(c-select's field stays in the page), CONTEXT.md (**Button group**, **Tab
buttons**, **Wash**).

## Library

| # | Item | Root cause (verified) | Decision |
|---|------|-----------------------|----------|
| 1 | `c-button-group` overlaps | Track is `grid grid-flow-col auto-cols-fr` (`minmax(0,1fr)` columns) while each `c-button` root carries `min-w-22` + `whitespace-nowrap`; grid items overflow their cell and paint over the neighbour (`CButtonGroup.vue:168`, `CButton.vue:438`). | **Wrap onto further rows** inside the track. Buttons keep natural width; the track keeps its rounded frame. Spec: narrow container, assert no two native buttons' rects intersect and the group grows in height. |
| 2 | `c-tab-buttons` overlaps | Composes `c-button-group`, so inherits #1. Sliding indicator is absolute px against the track (`CTabButtons.vue:199-248`), single-row by construction. | **Horizontal scroll, one row** on a native scroller with a hidden scrollbar: the new `shared/useScrollStrip.ts` adds edge arrows (`scroll-back` / `scroll-forward` parts), mouse drag, wheel translation and reveal of the active tab. Wrap from #1 is switched off inside the strip through the `::part(root)` rule; the indicator measures against the scrolled content. `c-tabs` keeps its own scroller for now (follow-up above). |
| 3 | `c-pagination` range placement | `details` is `flex-wrap justify-between`; wrapped range falls to flex-start, and `min-w-[132px] text-right` indents it (`CPagination.vue:222-235`). | **Fits: right-aligned as now. Wraps: flush left** under "Items per page" — drop the min-width/text-right, add a row gap. |
| 4 | `c-card-title` actions | `actions` is `flex-1 justify-end flex-wrap-reverse` (`CCardTitle.vue:52-62`); after wrapping it stays glued right and stacks reversed. | **Wrap below the title, left-aligned**; drop `wrap-reverse`. Also `c-card-actions` (footer) gains `flex-wrap`. |
| 5 | `c-button` ripple radius | Root is `rounded-csc-md` = `rounded-xl` + `corner-shape: squircle`; ripple clipper is `rounded-[inherit]`, and `corner-shape` is not inherited (`tailwind.css:208`, `CButton.vue:431`). | Restate `corner-shape: inherit` (or `rounded-csc-md`) on the ripple clipper. Also check `noRadius` vs `rounded-csc-md` merge order. |
| 6 | `c-menu` submenu flashes on iOS | One tap = `pointerover` (starts 120 ms hover-open) then `click` (toggles the now-open submenu shut). No `pointerType` guard (`CMenu.vue:776-794`, `:654-656`). Submenu has no `position-try-fallbacks` (`CMenuItem.vue:242`). | **Touch never hover-opens; tap toggles.** Add flip fallbacks (left, then below). Spec: dispatch `pointerover` with `pointerType:'touch'`, wait >120 ms, click → open. |
| 7 | Autocomplete scrolls the page on iOS | Shared `pageLock` is only `overflow:hidden` on `<html>` (`pageLock.ts:111-122`); iOS ignores it for touch panning. | **One shared lock, iOS-proof**: record `scrollY`, `position:fixed; top:-scrollY; width:100%` on the document root, restore on release. |
| 8 | `c-select` mobile panel | Field is moved into the panel (ADR-0050 §1, `CDropdown.vue:686-689`); page jumps from `body.overflow=hidden` + three racing `focus()` calls (`CDropdown.vue:532,636,697`, `CSelect.vue:1112`). | **Heading row + options only; field stays in the page** (ADR-0050 amended). `c-dropdown` drops its private lock and joins the shared one (#7); exactly one focus target on open. Re-author `fullscreen-*` baselines. |
| 9 | Tree-select value overflows / clear button outside | `content → fieldText → fieldMain` never clips, `code` is `shrink-0` (`CTreeSelect.vue:666-689`); two-line value exactly fills the 44 px unpadded slot. Clear/chevron classes sit on a `display:contents` `c-icon-button` host, so `-mr-1.5` and chevron rotation are inert (all three panel fields). Found while fixing: `c-input`'s own field row had `min-width: auto`, so a nowrap value widened the row past the slot — `min-w-0` on a flex item only lets it shrink inside its container, not reduce its contribution upward. | Clip the value block, let `code` shrink, `min-w-0` on `c-input`'s field row, two-line value gets `pt-2.5 pb-1.5` (a 52 px field; the lifted label needs the room). **Clear + chevron in `c-input`'s `post` slot** on a real span in select, autocomplete and tree select. Closed-field-with-selection baselines for all three. |
| 10 | `c-link` dark hover | `hover:bg-link-hover` is the hover *ink* role (dark `link-100`) under `link-200` text → 1.59:1 (`CLink.vue:44`); docblock says `link-subtle`. | `hover:bg-link-subtle`, text stays `link` (9.69 / 6.08). |
| 11 | `c-list` selected contrast | Active row: `primary-subtle` bg + `text-primary` (3.72:1 dark); hover ink `on-surface-muted` on `primary-subtle-hover` fails both modes (`CListItem.vue:70,77,265-271`). | Active: `text-on-primary-subtle` + 1 px inset `primary` ring (parity with menu rows). Hover: `text-on-surface`. Same paired ink on `c-dropdown`'s `aria-selected` row. |
| 12 | Sub side-nav item background | Sub-item states paint page roles (`surface-raised`, `primary-subtle-hover`, `primary`) inside the `nav-active` pill (`CSideNavigationItem.vue:148`, `CSubNavigationItem.vue:56-89`). | **Translucent `on-nav-active` washes** (ADR-0052): hover ≈10 %, active ≈18 % with `on-nav-active` text, indicator bar and focus ring in `on-nav-active`. New side-navigation spec + baselines. |
| 13 | Side-nav scroll traps to the document | Nav host is the scroller (`:host(.autoheight)`, `CSideNavigation.vue:300-304`) with no `overscroll-behavior`; wheel chains to the document and latches. Same gap in `c-main`'s pinned-nav rule (`CMain.vue:186-192`, also `100vh` not `100dvh`) and the docs `TocRail`. | `overscroll-behavior: contain` on all three scrollers; `100dvh` in `c-main`. Spec: nav taller than viewport, wheel past end, document `scrollTop` unchanged. |
| 14 | Slider tooltip delayed | Own CSS bubble, `duration-300` fade-in, triggers only `group-hover` / `group-focus-within` (`CSlider.vue:138-139`). | Add the pressed (`:active`) state as a trigger, zero the entry transition, keep a short fade-out. First `CSlider.spec.ts`. |
| 15 | Data-table autohide (component half) | Columns are measured from an already-squeezed `width:100%` table, first-measure-wins (`CDataTable.vue:1105-1214`), so autohide can hide nothing while min-content still overflows. | Measure natural widths with the table at `max-content` before comparing against the viewport width, then re-apply. |

## Documentation site

| # | Item | Cause | Decision |
|---|------|-------|----------|
| 16 | `c-input` page | In neither `INTERNAL_ONLY` (`useManifest.ts:82`) nor any `@subcomponents`; it is the field shell composed by five fields. | Add to `INTERNAL_ONLY` and the parity script's set; delete `app/examples/c-input`. **Keep the React wrapper** (removing a public export is breaking). |
| 17 | Login-card images | 4.0 port deleted `public/img/*` and dropped `src`; no `public/` dir exists. | Inline SVG/gradient **data URI** (the `c-login-button` pattern); restore `basic` with `src` + `background-position` and the lost `colored` example (`overlay`, `overlay-blend-mode`). |
| 18 | Autohide example overflows | Example's `.resizable { min-width: 320px }` beats `max-width: 100%` at 360 px. | `min-width: min(320px, 100%)`; component half is #15. |
| 19 | `c-switch` loading example | Prop exists; `loading` does not disable the input. | New `loading.vue` + react/angular/typescript variants: click sets value + `loading` + `disabled`, clears after ~1.5 s. |

## Verification notes

- The Chromium harness cannot emulate touch or WebKit; #6, #7, #8 get
  synthetic `pointerType:'touch'` specs plus a manual iOS check before merge.
- `page.viewport` phone constants are copy-pasted in three specs; lift them
  into `src/test/harness.ts` while adding the new narrow-viewport specs.
- New components under test with no prior spec: button group, tab buttons,
  pagination, card title/actions, list, side navigation (item + sub-item),
  slider, link, data table. Each gets a spec and a baseline per theme mode.
