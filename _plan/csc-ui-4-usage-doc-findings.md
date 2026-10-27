# csc-ui 4 — findings from the usage.md pass (phase 3, 2026-10-27)

Writing usage.md for the 40 undescribed tags meant reading every one of them against its source, spec and canons.
These are the faults found on the way, **not fixed**: the usage docs describe the code as it is, and where a doc
states a limitation that a fix would remove, the doc names it (listed per item, so the fix updates it too).

**Confirmed** = reproduced in headless Chromium (probe specs, deleted afterwards). Everything else is from reading
the source; "inferred" marks a finding whose effect was reasoned, not observed.

Triage per D13: behaviour bugs and a11y faults are "before rc.1" work; fixed-English strings are the 4.x `texts`
list; doc and example corrections can land any time.

## A. Host attributes reach the shadow DOM mangled (systemic, confirmed) — FIXED 2026-10-27

A Vue custom element hands every non-prop host attribute to the component camelized (`aria-label` →
`ariaLabel`), and `inheritAttrs` passes it to the root element. On an HTML element `ariaLabel` is a reflected
property, so it works; anything whose reflected property is not the naive camelization breaks:

- `c-icon`, `c-csc-logo`: the root is an `<svg>`, where Vue sets attributes verbatim → a literal `ariaLabel="…"`
  attribute; an `aria-label` on the element never names the icon. (`aria-hidden="true"` works: it stays on the host.)
  c-icon/usage.md recommends a `<span role="img" aria-label>` wrapper because of this.
- `c-icon-button aria-haspopup="dialog"` → `ariahaspopup` on the inner button (`ariaHaspopup` is not
  `ariaHasPopup`). Hits the date, time and colour pickers' trigger buttons (CDatePicker.vue:29, CTimePicker.vue:28,
  CColorPicker.vue:112); no spec asserts it. The same goes for every `aria-*` with an inner capital in its property
  (`aria-labelledby`, `aria-describedby`, `aria-valuenow`, `aria-readonly`, `aria-roledescription`, …).
- `c-link`: the root is a wrapper `<div>`, so `rel`, `download`, `aria-label` land on the div, not the `<a>`
  (the MyCSC sweep's open `rel` item). c-link/usage.md says only `href`/`target` reach the link.

Fixed in `shared/defineElement.ts`: an undeclared hyphenated host attribute reaches the component under its own
name (`$attrs['aria-haspopup']`); declared props still camelize. A labelled c-icon is `role="img"`, and c-link
forwards ARIA and link attributes to its `<a>`. The all-components conformance suite now fails any tag that
forwards a mangled name (39 of 79 did); c-icon / c-link / c-icon-button usage.md no longer describe workarounds.
`data-*` attributes are not forwarded at all (a follow-up fix): an exact copy inside made Playwright's
`[data-test="…"]` match twice. A change to one still re-renders the component, since c-input reads its
`data-hide-details` off the host at render time.

## B. Behaviour bugs

- **c-steps** — dividers are created once at mount (CSteps.vue:105-113): a `c-step` added later gets no line and
  the next `value` change throws (`dividers[index]` undefined). Usage says to render every step up front.
- **c-accordion** — items added after mount are never set up (CAccordion.vue:194-214; confirmed); in `multiple`
  mode a non-array value is dropped at the first toggle (167-169; usage says to pass an array).
- **c-side-navigation** — sub-items are slotted, and parents detected, only at mount (CSideNavigation.vue:259-268,
  CSideNavigationItem.vue:289); the drawer toggles and fires `change:open` on a navigation-button click even when not
  `mobile` (254); activating a leaf sets its `active` but never clears the others → several `aria-current="page"`
  (241-245); an `href` item may fire `select` twice on Enter (inferred).
- **c-tags** — `size` is copied onto the tags at mount and on change only (CTags.vue:108-122): tags added later
  keep their own size.
- **c-tag** — `flat` puts `pointer-events-none` on the root, so a `flat closeable` tag's close button is probably
  unclickable (CTag.vue:156; inferred).
- **c-slider** — ticks, tick numbers and the active-tick check ignore `min` (CSlider.vue:286-297); the default value
  50 is not clamped, so `max="8"` without a value draws the bubble at 625 % (usage says always set a value); the
  bubble formats with a hard-coded `fi-FI` locale and 0 decimals (279-283).
- **c-otp-input** — `hide-details` never reaches the message (COtpInput.vue:57, 145-174); clearing a middle digit
  shifts later digits left in the value (293-296); the digit check `isNaN(+x)` lets a space, `1e5`, `0x1F`, `-12`,
  `1.5` through (375, 400); a `length` change after mount keeps the old column count (440); toggling the host `error`
  class strips a consumer's own `error` class (439, 449).
- **c-login-card** — `url(${src})` is unquoted (CLoginCard.vue:187): a URL with parentheses, quotes or spaces drops
  the declaration (confirmed; both canons' data URIs contain `url(%23g)`, so they show no image).
- **c-page** — the scroll indicator (z 9) paints under the pinned toolbar (z 10) inside c-main (confirmed).
- **c-card** — the fullscreen toggle overlaps the end of c-card-title's `actions` slot by 32px (confirmed; usage
  says to keep a fullscreen card's actions slot empty); `exitFullscreen()` exits whatever element is fullscreen
  (CCard.vue:109, 141-148).
- **c-tabs** — `transform` / `overflow: hidden` + `translate` on the row and panels (CTabs.vue:832,
  CTabItems.vue:262-269) make containing blocks for `position: fixed`: a `c-modal` inside a tab panel is likely
  positioned and clipped within the panel (**inferred, potentially serious** — c-modal is not top-layer);
  `disable-animation` still animates the overflow scroll (514-517, 640); `touchmove` always `preventDefault()`s in
  horizontal mode, so a vertical swipe starting on the tab row may not scroll the page (629; inferred);
  `--c-tab-items-animation-duration` lacks the `_` and does nothing (CTabItems.vue:220); `isDirty` set by any keyup
  inside c-tabs lets a later value change or resize focus the tab, stealing focus from panel content (753, 521;
  inferred); undeclared `[disabled]` styling on c-tab-item (CTabItem.vue:129).
- **c-data-table** — `change:sort` is typed `| null` but never emits null (650, 971); `aria-sort` is set on a
  non-sortable column given a `sort` (974); the manifest lists `sort` as an attribute (analyzer `Alias | null`
  trap); the `external` description mentions a `filter` prop that is now `query` (477); `change:page` also fires
  without user action (query change, shrinking rows) — description says "when the user changes the page" (635).
- **c-pagination** — `endTo` is not clamped to the last item (378); legacy host classes `c-pagination` / `--small`
  / `--simple` are still added and fall through onto the `<nav>` (479-486).

## C. Accessibility

- **c-tag** — a plain tag is a `role="button"` Tab stop with no Enter/Space handling (CTag.vue:213-219; WCAG
  2.1.1); `active` is not exposed (no `aria-pressed`). c-tags/usage.md states both.
- **c-list-item** — `ripple` makes a Tab stop that Enter/Space do not activate (CListItem.vue:192, 220-224;
  confirmed), and the c-list canons select items by `click` on ripple items, so they are mouse-only; link items
  lose the library focus ring (269; confirmed); `active` is not exposed; `aria-disabled` on `listitem` (175).
- **c-login-button** — without `href` it is a focusable `<a>` that Enter does not activate (CLoginButton.vue:2);
  its prop description invites that use (62).
- **c-tabs** — `role="tablist"` on the host, which also owns the panels and arrow buttons (CTabs.vue:694);
  buttons mode has no `role="tab"`; a disabled tab is `aria-hidden` yet arrow-focusable (CTab.vue:137); arrows act on
  keyup, no Home/End, no Up/Down for `vertical`, no `aria-orientation` (747-786); string values with no `value` set
  leave the row with no Tab stop (default `value` 0).
- **c-steps** — host `tabindex="0"` with no role (CSteps.vue:169); summary not a live region.
- **c-navigation-button** — no `aria-expanded` / `aria-controls`, and `inheritAttrs: false` keeps authors from
  adding them.
- **c-side-navigation** — `<nav role="menubar">` drops the landmark and promises a keyboard model that is not
  there; the mobile drawer has no focus move, Escape or inert page; a c-sub-navigation-item with `href` is a
  `div role=menuitem` navigating by script (no link semantics); titles have no heading/group semantics.
- **c-otp-input** — `required` without `aria-required`; the `invalid` description promises `aria-invalid`, nothing
  sets it (also c-message); the message has no part and no `aria-describedby`.
- **c-data-table** — the banner's `aria-live` sits on a `v-if` element (first message likely unannounced); no
  `aria-busy` while loading; row checkbox / expander names carry no row context.
- **c-pagination** — the page-size button's `aria-label` hides the current size from its name (12); page-button
  names come from `aria-label` on a `<span>` (73).
- **c-icon-button** — `loading` exposes nothing (no `aria-busy` / `aria-disabled`) and removes slotted text
  (339-343, 394-403).
- **c-csc-logo** — accessible name is the `<title>` "CSC_logo_no_tagline" (CCscLogo.vue:9); the docs app's home
  link is announced that way (app.vue:9-14).
- **Cards** — c-card-title is a `<p>`, c-login-card-title a `<header>` (not headings); c-card-content /
  c-login-card-content nest an `<article>` in the card's; the actions rows are `<menu>` with non-`li` children.
- **Fixed English** (4.x `texts` list): c-tabs arrows, c-side-navigation close, c-card fullscreen toggle, c-steps
  summary, c-otp-input labels and announcements, c-message prefixes.

## D. Docs, glossary and examples

- CONTEXT.md:595, 714 — c-tag "only inside c-tags": it works standalone (c-tag canon, c-table/usage.md).
- CONTEXT.md:669 — "utility columns always pinned left": the expander is pinned right.
- CONTEXT.md:567 and c-tab-buttons/usage.md — the c-tabs row scrolls by touch and its arrows only, not wheel or
  mouse drag.
- CStatus.vue:9-11, CAlert.vue:33-35 — "neutral primary pill": it is grey.
- Canons: c-page/basic says "centered" (it is start-aligned); c-steps/basic binds `v-model` (no events) where the
  other flavours use `:value`; c-sub-navigation-item/basic uses `@click` / `@keyup.enter` instead of `@select`;
  c-badge/basic has an unnamed icon button and the palette token `--c-success-500`; c-login-buttons canons give the
  logo a redundant `alt`; c-accordion types omit `null`; c-data-table external-data fetches twice on a page-size
  change (race); custom-cells has an empty actions header; c-status/basic has a baselined contrast failure.
- 185 `@seeded … verify` prop descriptions remain; noticed: c-slider "Thow ticks", c-pagination `hide-details`
  ("pages" for items), c-login-card `overlayBlendMode` (copy of `overlay`), c-list "arount".
- Fixed in this pass: c-toasts/usage.md pointed to c-message for page-level status; c-spinner/usage.md said
  c-loader's message is announced; the migration guide's c-tag `block` / `fit` replacements sized only the part,
  which cannot fill a row (confirmed: the host is a content-sized `inline-flex`).
