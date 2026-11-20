# Post-4.0.0 fixes

Grilled 2026-11-20. Two PRs, docs first.

Status: PR 1 pushed on `development` (1364e92e..67807334). PR 2 built on the
local branch `overlay-fixed-anchors`; waiting on the iOS gate below.

## PR 1: docs site (empty changeset, merges on green CI)

1. **Checked toolbar choices.** `FlavorSwitcher.vue`, `ThemeToggle.vue` and
   `ColorSwitcher.vue` bind `:active` on `c-menu-item`, a 3.x prop 4.0 removed,
   so nothing is marked. Each item becomes `type="radio"` + `:checked`. A
   custom primary seed (from the customization playground) checks no colour
   item; the trigger keeps reading "Custom".
2. **Dead-binding guard.** A docs lint script (run by `pnpm lint`) fails on a
   `c-*` attribute or property binding in the site's `.vue` files that is
   neither in the manifest nor a global attribute. Today's scan finds exactly
   the three `active` bindings above (prototype:
   scratchpad `deadprops.mjs`; strip quoted values before matching names, and
   mind `=>` inside handler values).
3. **Colour labels.** Drop `text-accent` from the colour names in
   `ColorSwitcher.vue`.
4. **Icon buttons below `md`.** Flavour, theme and colour switchers all use a
   `c-icon-button` trigger below `md`, and the flavour switcher is shown on
   phones (drop `max-md:hidden` in `app.vue`). Each switcher renders twice, the
   labelled `c-button` menu in a `max-md:hidden` wrapper and the icon-button
   menu in an `md:hidden` one: CSS switches them, so the prerendered page is
   right on first paint (no JS breakpoint, no hydration swap). `ThemeToggle`'s
   client-only fallback must reserve the matching size per breakpoint. Verify
   the 360px toolbar with the docs viewport smoke.
5. **Version badge.** `v{{ major }}` → the full core version, `v4.0.0`, lowercase
   (drop `uppercase`; a prerelease reads `v5.0.0-alpha.1`). Read from the core
   `package.json` at build time, which only the Version PR changes.

Commits: `Fix(docs): …` per item; one `pnpm changeset --empty`.

## PR 2: overlays drift on Safari 26 (patch changeset → 4.0.1)

**Fault.** iOS report: the docs toolbar's menus sink by the scroll distance as
the page scrolls, and open that far below their trigger after a scroll. The
toolbar is pinned (`position: sticky`). Safari 27.0 lists a fix for
fixed-position anchored elements that overcompensated for scrolling; Safari 26
is still supported (`last 2 Safari/iOS versions`), so it is a bug. Same family
as the 2026-11-02 submenu fault. Possibly also in-flow `c-popover` demos (the
user recalls something similar, unconfirmed).

**Decisions** (ADR-0056 and ADR-0038 amended 2026-11-20):

- At every open, `useFallbackPosition` walks the anchor's flat-tree ancestors
  (parent, shadow host, assigned slot). If one is `position: fixed` or
  `sticky` (a top-layer panel or modal dialog is fixed by UA style), Floating
  UI places the panel, in every browser. In-flow anchors stay native.
  Rejected: scripting every panel, a Safari 26 feature probe.
- The scripted style must also switch off the native declarations it would
  otherwise sit under (`position-area`, `position-anchor`,
  `position-try-fallbacks`), or the area still sets the containing block.
- Preload Floating UI at mount when the anchor already sits in such a box, so
  the first open does not wait on the import.
- Designated triggers (`trigger` prop) are always scripted, against the element
  itself; the fixed-position proxy anchor and its rAF loop are deleted.
- Covers every consumer centrally: `c-menu`, `c-popover`, `c-tooltip`,
  `c-breadcrumb`, `c-menu-item` (already scripted) and the `useAnchoredPanel`
  field panels (fields in a `c-modal` become scripted too).

**Specs.** New anchored-overlay conformance scenarios for every overlay tag:
anchored in a pinned box after the page scrolls, and a designated trigger after
a scroll. Each asserts the panel stays on its trigger (geometry) and that it is
script-placed (mechanism; this part fails before the fix on all three
engines). The existing "against a designated trigger" native-vs-fallback
comparison changes meaning once both sides are scripted; rework it.

**Gate.** Unconfirmed: the reporter's iOS version. The diagnosis assumes iOS
26 (the Safari 27 fix); on iOS 27 the cause may differ. So, on the same phone,
without updating iOS in between:

1. Ask which iOS version it runs (Settings → General → About).
2. Reproduce on the live site first (csc-ui 4.0.0): open a toolbar menu and
   scroll; scroll, then open one; open a `c-popover` demo and scroll.
3. Repeat the same steps on the PR's Netlify deploy preview.

Merge waits for "drifts on live, holds on preview".

Scope the gate does not cover: every panel opened from a form in a `c-modal`
(the dialog is fixed) is now placed by script in every browser, Chrome and
Firefox included. The conformance suite covers it ("stays on a trigger in a
modal as the modal content scrolls", all overlay tags, Chromium and Firefox;
WebKit in CI). The docs have no modal with a field in it, so the reporter
cannot try it on the preview; check it in MyCSC when it moves to 4.0.1: open a
select, autocomplete and date picker in a modal form, scroll the modal, in
Safari and in Chrome. If it drifts on iOS 27,
re-diagnose before merging. If the in-flow popover demos still drift on the
preview, that is a new decision (park it, do not widen the rule unasked).

Commit: `Fix(overlays): …` with a patch changeset, user-facing wording.

Found while testing (user chose: fix on this branch, own commit): a designated
`c-button` (any `display: contents` host) measured as an empty rect at 0,0, so
its panel opened at the page's top-left corner, before and after the fix
above. `useFallbackPosition` now measures such a reference by the union of the
boxes it renders; a conformance spec compares it with a slotted `c-button`.
