# @cscfi/csc-ui

## 4.0.0-alpha.22

### Patch Changes

- [#289](https://github.com/CSCfi/ui/pull/289) [`7587a76`](https://github.com/CSCfi/ui/commit/7587a760f8453c0d57a1994812a2f07d3c5c2141) Thanks [@razorfever](https://github.com/razorfever)! - Fix a `c-badge` slotted into a `c-tab` being cut off. The badge is a corner
  overlay that paints 8px outside its parent, and the tab clipped it three times
  over — on the tab's inner content box, on the tab element itself, and again on
  the tab strip's viewport. The tab now clips with a margin wide enough for the
  badge, the redundant second clip on the tab element is gone, and the strip's
  viewport allows the same overhang while still hiding the tabs that scroll past
  it. Badges in tabs now behave like badges in `c-button` and `c-icon-button`.

## 4.0.0-alpha.21

### Minor Changes

- [#287](https://github.com/CSCfi/ui/pull/287) [`0116d82`](https://github.com/CSCfi/ui/commit/0116d82b1559d6625d25a043902f0b084ee6f6ba) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - One shared control height of 52px (ADR-0055). The `default` field box of
  `c-input` — behind `c-text-field`, `c-select`, `c-autocomplete` and
  `c-tree-select` — grows from 44px to 52px, held in the new `--spacing-control`
  theme value together with the `default` `c-button` (52px, from 44px), the
  `c-button-group` frame (52px, its buttons 44px inside) and `c-tab` (52px, as
  before). `c-tree-select` no longer grows on selection: its two-line path and
  label value fits the box. The button scale becomes 28 / 52 / 60: `large` rises
  to the toolbar height so it stays a step above `default`; `small` buttons and
  `small` fields are unchanged. Layouts aligned to the old 44px need to follow.

### Patch Changes

- [#287](https://github.com/CSCfi/ui/pull/287) [`7628ea6`](https://github.com/CSCfi/ui/commit/7628ea6da5e07543fdda4a271cb741b1949c2678) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Fix two field regressions from the 52px control height (ADR-0055). The resting
  floating label — the one sitting inside an empty, unfocused field — now centres
  in the box again instead of hanging 2px high, across `c-text-field`, `c-select`,
  `c-autocomplete` and `c-tree-select`. The `small` field box is 36px again: it
  had been rendering at the 52px default height, which also left its label far off
  centre. The lifted label and the value text are unchanged.

- [#287](https://github.com/CSCfi/ui/pull/287) [`0116d82`](https://github.com/CSCfi/ui/commit/0116d82b1559d6625d25a043902f0b084ee6f6ba) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-tab-buttons` scrolls sideways inside `c-tabs` again. The tab row that
  `c-tabs` slots the strip into may outgrow its viewport (that is how the
  underlined tab row scrolls), so an overflowing strip pushed the row wide
  instead of scrolling: the frame was clipped at the edge, the last tab was cut
  off, and neither the edge arrows nor touch panning appeared — as seen on a
  phone with three tabs. In buttons mode the row now squeezes the strip to its
  own width, so the strip scrolls by touch, drag, wheel and the edge arrows as
  documented.

  The strip's corners clip correctly too: the scrolled buttons and the sliding
  indicator are now cut by the track's own frame, following its squircle at the
  inner edge of the hairline, instead of a round radius that ran 1px past it.

- [#287](https://github.com/CSCfi/ui/pull/287) [`0116d82`](https://github.com/CSCfi/ui/commit/0116d82b1559d6625d25a043902f0b084ee6f6ba) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - The dark-mode hover tint is subtle again. `primary-subtle-hover` mapped to
  primary-600 in dark mode — brighter than the primary-700 fill of the selected
  state — so a hovered tab, list row or table row outshone the selected one. It
  now maps to primary-800, a step fainter than the fill, as in light mode where
  primary-50 sits under the primary-100 fill.

## 4.0.0-alpha.20

### Minor Changes

- [#285](https://github.com/CSCfi/ui/pull/285) [`cac5376`](https://github.com/CSCfi/ui/commit/cac5376a2939b187511fa598530365a72cfc71e4) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Invert the theme mode for part of a page. An element carrying
  `data-theme-invert` resolves the semantic tokens in the opposite mode to the one
  it sits in — dark inside a light page, light inside a dark one — so a region
  that must always stand apart from its surroundings needs no per-page variant.
  Inverting scopes nest like pinned ones, so inverting twice is back in the
  surrounding mode, and a `data-theme` on the same element wins over the
  inversion. On `<html>` it means the opposite of the OS preference. The attribute
  is presence-only, like `hidden`: `data-theme-invert="false"` still inverts, so
  remove it to stop.

  `data-theme` is unchanged and still takes only `light` and `dark`, so a
  `data-theme` your own theming system already sets still cannot pull components
  out of the surrounding mode.

  Every mode block now publishes the mode it resolved as `--c-mode` (`light` or
  `dark`). It is public: read it in JS, or style-query it from your own CSS with
  `@container style(--c-mode: dark) { … }` instead of duplicating the `data-theme`
  selectors.

  `themeMode(element)` now reads that property instead of walking up for a
  `data-theme` attribute, so it always gives the same answer as the CSS — and it
  now works for an element **inside a shadow root**, where the old ancestor walk
  stopped at the boundary and fell back to the OS preference.
  `observeThemeMode()` follows `data-theme-invert` too.

  A hand-written role override needs the new scope as well:
  `:root, [data-theme], [data-theme-invert] { --c-surface: … }`. Seed overrides
  via `applyTheme` are unaffected.

### Patch Changes

- [#285](https://github.com/CSCfi/ui/pull/285) [`e073115`](https://github.com/CSCfi/ui/commit/e0731154c81ad8e418c64211517a597ace3faa43) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Every dropdown meets its field with the same gap: none. `c-select`'s listbox
  sat flush under the field and `c-menu` opens at its `distance` (0 by default),
  but `c-autocomplete` and `c-tree-select` left 8px — the anchored panel pulled
  back only the field's message area, not the gap above it — and opened upward
  `c-select` left 8px while the anchored panels left none. The anchored panel
  now measures the field box itself, below and above (so an on-top label no
  longer pushes a flipped panel up), and the upward listbox drops its padding.

- [#285](https://github.com/CSCfi/ui/pull/285) [`e073115`](https://github.com/CSCfi/ui/commit/e0731154c81ad8e418c64211517a597ace3faa43) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-menu` submenus open on tap on iOS. A click on a parent item toggled its
  submenu, so whenever the submenu was open — or merely recorded as open — by
  the time the tap's delayed `click` arrived, the tap closed it and nothing ever
  showed. A click on a parent item now only ever opens its submenu and moves
  into it; the record of open submenus follows the panel's real popover state,
  hover-open is reserved for mouse and pen pointers, and on a narrow viewport,
  where neither side of the row has room, the submenu drops below (or above)
  its row instead of rendering off screen.

- [#285](https://github.com/CSCfi/ui/pull/285) [`5059f47`](https://github.com/CSCfi/ui/commit/5059f47a7396e1d6ba7875efae14f876bf6d2a13) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - An option's label resolution honours an explicit empty `name`: a `<c-option>`
  authored with `name=""` now has an empty label, and the field falls back to
  its own last resort (the raw value), instead of the empty string being
  treated as absent and the option's text content taking over. Only a `name`
  that was never set (the property and attribute both missing) falls through to
  `c-option-value` or the option's text, as before.

- [#285](https://github.com/CSCfi/ui/pull/285) [`e073115`](https://github.com/CSCfi/ui/commit/e0731154c81ad8e418c64211517a597ace3faa43) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Stop the fullscreen panels of `c-autocomplete`, `c-tree-select` and `c-select`
  flickering on iOS when a short list is dragged. With the on-screen keyboard
  up, iOS Safari pans the visual viewport on any single-finger drag the page
  did not consume, and the panel content that follows the visual viewport to
  stay above the keyboard jumped after every pan. While the shared page lock is
  held, a single-touch drag with no scrollable list in its path is cancelled; a
  drag inside an overflowing list still scrolls it.

- [#285](https://github.com/CSCfi/ui/pull/285) [`5059f47`](https://github.com/CSCfi/ui/commit/5059f47a7396e1d6ba7875efae14f876bf6d2a13) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Side navigation items sit 4px apart instead of 1px, so adjacent pills — and
  the hover and active washes they paint — no longer read as one continuous
  strip.

- [#285](https://github.com/CSCfi/ui/pull/285) [`e073115`](https://github.com/CSCfi/ui/commit/e0731154c81ad8e418c64211517a597ace3faa43) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-side-navigation`'s mobile drawer fits the visible viewport. It was sized
  in `vh`, which on a phone is the viewport with the browser chrome collapsed,
  so while the address bar was shown the drawer's tail — the last items and the
  bottom slot — sat behind it. The drawer is now sized in `dvh` and follows the
  browser chrome as it shows and hides.

- [#285](https://github.com/CSCfi/ui/pull/285) [`5b384d6`](https://github.com/CSCfi/ui/commit/5b384d6e8aa7aeae261f75e40bb14f439b17cbae) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Fix the ink of content projected onto a surface that pins its own theme mode
  (ADR-0053). A mode scope re-points the semantic tokens but paints nothing, so a
  `color` resolved outside it inherits in as a literal: `<c-card
data-theme="light">` on a dark page flipped its background but left its slotted
  body copy in dark-mode ink, near-invisible on the light surface.

  Containers that paint a surface ladder rung and project consumer content now
  declare the matching `on-` ink on that same box, so everything they project
  re-resolves with the surface:

  - `c-card` — `on-surface` on the `root` part (the `surface-raised` box). The
    card sections and their slotted content inherit it, and
    `c-card::part(root) { color }` stays the single lever for recolouring the
    whole card.
  - `c-login-card` — `on-surface` on the `root` part (the `surface` box).
  - `c-menu` — `on-surface` on the `list` part (the `surface-overlay` panel), for
    content slotted into a menu beside its `c-menu-item`s.

  Under a pinned document mode nothing moves: the ink these boxes inherited was
  already `on-surface`. The one intentional change is a `c-card` inside a
  `c-modal`, whose body copy now renders the card's own `on-surface` instead of
  the modal's `on-surface-muted` — matching a standalone card and the card title.

- [#285](https://github.com/CSCfi/ui/pull/285) [`e073115`](https://github.com/CSCfi/ui/commit/e0731154c81ad8e418c64211517a597ace3faa43) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-tree-select` centres the committed value in its field and never truncates
  its code. The two-line value block sat 10px from the top and 6px from the
  bottom, so both a path-and-label value and a single-line root value read as
  bottom-heavy; the block is now centred with even padding. The code kept
  ellipsising along with the label; it is the item's identity, so it now keeps
  its full width and only the label beside it truncates.

## 4.0.0-alpha.19

### Minor Changes

- [#283](https://github.com/CSCfi/ui/pull/283) [`a2606bb`](https://github.com/CSCfi/ui/commit/a2606bb73a16629d89ed9f552ecb9a0204cd584a) Thanks [@razorfever](https://github.com/razorfever)! - Pin a theme mode to part of a page. `data-theme="light"` or `"dark"` now works
  on any element, not just `<html>`: that element and everything inside it resolve
  the semantic tokens in that mode, whatever the rest of the page is doing. Scopes
  nest and the nearest one wins, the mode carries into shadow roots and into
  top-layer panels, and a single component works too — `<c-button data-theme="dark">`.
  A scope re-points colours and paints nothing, so give a container `bg-surface`
  and `text-on-surface` to make it draw the mode it pins.

  New `observeThemeMode(element, callback)` reports the mode in effect for an
  element and follows it — a `data-theme` flip on any ancestor, or the OS
  preference changing. `themeMode(element)` now resolves the nearest scope rather
  than only the element you hand it, which is what a chart inside a pinned panel
  needs.

  The mode blocks now also set `color-scheme`, so UA chrome — scrollbars, textarea
  resize grabbers, autofill, date pickers — follows the pinned mode instead of the
  OS. This also fixes dark mode at the document root, where that chrome rendered
  light.

  Only `light` and `dark` pin a mode; any other value is now ignored rather than
  treated as light. If you set `data-theme` on `<html>` to something else, it
  previously rendered light and now follows the OS preference. A hand-written
  `:root { --c-<role>: … }` override no longer applies inside a scope — write
  `:root, [data-theme]` to cover both. Seed overrides via `applyTheme` are
  unaffected.

## 4.0.0-alpha.18

### Patch Changes

- [#281](https://github.com/CSCfi/ui/pull/281) [`a47238e`](https://github.com/CSCfi/ui/commit/a47238e55175b25c64c9533259b42df2ae6ad334) Thanks [@razorfever](https://github.com/razorfever)! - Keep `c-select`'s fullscreen panel open on a narrow viewport. In `multiple`
  mode the panel closed on the pick that made the field's row of tags wrap: the
  field stays in the page on a narrow viewport, so growing it reflowed the page,
  and the menu still treated any page reflow as a reason to close. Anything else
  that grew the page behind the open panel closed it the same way. The reflow
  close now applies only to the anchored menu, which is placed against the page;
  the fullscreen panel closes on the viewport crossing the narrow threshold, as
  before. A tap on the panel surface beside its content — visible only while the
  browser chrome or the on-screen keyboard is animating — no longer closes it.

- [#281](https://github.com/CSCfi/ui/pull/281) [`4009914`](https://github.com/CSCfi/ui/commit/4009914070c0e087ceec69783af2f68b43988c47) Thanks [@razorfever](https://github.com/razorfever)! - `c-side-navigation`'s bottom slot stays at the drawer's bottom edge. Inside
  `c-main` the desktop drawer fills its pinned height, so a short menu no longer
  leaves the slot under the last item and the 3.x `autoheight` class is ignored
  there (it left the drawer one toolbar height short under a `static` toolbar).
  Under a banner or a static toolbar the slot reaches the viewport's bottom edge
  before the drawer has pinned. A long menu scrolls on its own above the slot,
  which stays visible, on desktop and in the mobile drawer alike; the slot's
  content is no longer inside the `menubar` nav. A bounded `c-main` shell with
  its own scrollbar declares its height with the new `--c-main-viewport-height`
  custom property.

## 4.0.0-alpha.17

### Minor Changes

- [#279](https://github.com/CSCfi/ui/pull/279) [`7f03095`](https://github.com/CSCfi/ui/commit/7f03095f9cf034736c4845cb3f9d6ff56e6f945f) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Dashboard layout scrolls the document (ADR-0051):

  - `c-toolbar` is pinned with CSS sticky instead of `position: fixed`, drops its
    spacer, and gains a `static` prop that keeps it in the page flow so it scrolls
    away with the content. The `class="relative"` host-class switch is removed;
    use `static`.
  - `c-main` grows with its content instead of clamping to the viewport, and pins
    the desktop `c-side-navigation` beneath the toolbar (or to the top edge when
    the toolbar is static) with an inner scrollbar. No consumer markup needed.
  - New `banner` slot on `c-main`: a full-width strip above the toolbar that
    scrolls away with the page; the toolbar pins to the top edge once it is gone.
  - `c-page` is no longer a scroll container: no fixed height, no own scrolling.
    `scroll-indicator` tracks the document. Code that read or set c-page's scroll
    offset must target the window; smooth scrolling is the document's
    (`html { scroll-behavior: smooth }`).
  - The toolbar height is the shared `--spacing-toolbar` theme value (60px)
    instead of a literal.

### Patch Changes

- [#279](https://github.com/CSCfi/ui/pull/279) [`77ad07a`](https://github.com/CSCfi/ui/commit/77ad07a0b3c79ba054ca685d7f48660947a36c17) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-button-group` wraps its buttons onto further rows when the track is
  narrower than one row of them. The track was a single-row grid whose cells
  could shrink below the buttons, so on a narrow viewport the buttons painted
  over each other. The columns stay equal and as wide as the longest label; the
  group keeps its natural one-row width where there is room.

- [#279](https://github.com/CSCfi/ui/pull/279) [`f5d59f9`](https://github.com/CSCfi/ui/commit/f5d59f9003d318b8e1a768bcf607ca953870dfdd) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-button`'s ripple is clipped to the same corner shape as the button. The
  clip inherited the radius but not the squircle corner shape, so on browsers
  with `corner-shape` the ripple bled past the painted corners.

- [#279](https://github.com/CSCfi/ui/pull/279) [`07a7e42`](https://github.com/CSCfi/ui/commit/07a7e42b020f0ac4981bf6dc9effa4d08d2c40eb) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-card-title`'s `actions` slot drops onto its own row under the title,
  starting at the left edge, when the two do not fit side by side; it stayed
  right-aligned (and stacked its own rows in reverse) after wrapping.
  `c-card-actions` wraps a footer row longer than the card instead of
  overflowing it.

- [#279](https://github.com/CSCfi/ui/pull/279) [`c05c7ee`](https://github.com/CSCfi/ui/commit/c05c7eede9808db1a85d20ed377fd7ea9fe76f9a) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-data-table` with `autohide` measures its columns at their natural widths.
  It measured them from the already-squeezed `width: 100%` layout, so in a box
  narrower than the content the total always equalled the box, nothing was
  hidden, and the table scrolled sideways instead of moving columns into the
  expansion row.

- [#279](https://github.com/CSCfi/ui/pull/279) [`c35aedc`](https://github.com/CSCfi/ui/commit/c35aedc379d4ec5f20dec85ce076b238bad38a54) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-tree-select` keeps a long selection inside its field: the two-line value
  block is clipped and a long code ellipsises like the label instead of painting
  out through the field and across the clear button. In `c-select`,
  `c-autocomplete` and `c-tree-select` the clear button and chevron now render in
  the field's `post` slot on a real box, so they sit flush at the trailing edge
  and the chevron turns while the list is open (their classes sat on a
  `display: contents` host and never applied).

- [#279](https://github.com/CSCfi/ui/pull/279) [`76a8b91`](https://github.com/CSCfi/ui/commit/76a8b91789023877b99569aa1f9b8b1a78c5ed5b) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-link` hovers with the `link-subtle` tint. It painted the `link-hover` role,
  which is the hover _ink_ — in dark mode a lighter step than the link text, so
  hovered links were unreadable (1.6:1).

- [#279](https://github.com/CSCfi/ui/pull/279) [`96f844b`](https://github.com/CSCfi/ui/commit/96f844b854c1ada8b8b6ac089e741c88fffd99f1) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-list-item`'s active row uses the `on-primary-subtle` ink paired with its
  `primary-subtle` tint and adds the 1px inset `primary` ring the other row
  components paint; the hover step carries the `on-surface` ink. `primary` on
  the tint fell short of AA in dark mode and the muted ink on the hover step in
  both modes. `c-select`'s selected option row takes the same paired ink.

- [#279](https://github.com/CSCfi/ui/pull/279) [`b06e623`](https://github.com/CSCfi/ui/commit/b06e62321d33ba86b127aed2740ab57917a240d3) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-menu` submenus open on tap in Safari and iOS. A touch fires `pointerover`
  before its `click`; the hover-open that `pointerover` started had the submenu
  open by the time the click arrived, and the click toggled it straight back
  shut, so the submenu flashed and vanished. Touch no longer hover-opens — a
  tap on the item toggles its submenu — and the submenu panel now flips to the
  other side or below when there is no room to the right.

- [#279](https://github.com/CSCfi/ui/pull/279) [`826a24c`](https://github.com/CSCfi/ui/commit/826a24c6903f365dd7d4f6c0332e69436c99c466) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Fix the page scroll lock on iOS: the shared lock behind `c-modal` and the
  fullscreen panels of `c-autocomplete`, `c-tree-select` and `c-select` only set
  `overflow: hidden` on the document, which iOS Safari ignores for touch panning,
  so swiping through the options scrolled the page underneath. The lock now also
  takes the body out of the scroll flow at its current offset and restores that
  offset on release, so nothing visibly moves. `c-select`'s listbox drops its
  private body-overflow lock and holds the shared one.

- [#279](https://github.com/CSCfi/ui/pull/279) [`3b4303a`](https://github.com/CSCfi/ui/commit/3b4303ab381b5603b97b3cfca4ee5796ca69d55c) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-pagination` keeps the range text ("1 - 10 of 100 items") at the right edge
  beside the items-per-page control while both fit and puts it flush under the
  control on its own row when the viewport is too narrow. A fixed right-aligned
  box used to leave it indented at a width-dependent offset, and wrapped rows
  had no gap between them.

- [#279](https://github.com/CSCfi/ui/pull/279) [`826a24c`](https://github.com/CSCfi/ui/commit/826a24c6903f365dd7d4f6c0332e69436c99c466) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-select` on a narrow viewport no longer moves its field into the fullscreen
  panel: the panel is the heading row (the field's label and a close button) and
  the options, the same shape as `c-tree-select`. The moved field repeated the
  label and spent a row of a phone screen on a readonly control, and focusing it
  during the open was one of the things that scrolled the page behind the panel.
  Focus now lands on the list inside the panel (the highlighted row when there is
  a selection).

- [#279](https://github.com/CSCfi/ui/pull/279) [`31f8ed9`](https://github.com/CSCfi/ui/commit/31f8ed99e776b2120867fc3c2e6381ffd6896be7) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - A pinned `c-side-navigation` that scrolls on its own (the `autoheight` state
  and the desktop drawer inside `c-main`) contains its overscroll: a wheel or
  swipe that reached the drawer's end chained to the document, and the browser
  then kept scrolling the page for the rest of the gesture while the drawer
  could not be scrolled back. The drawer is also sized to the visible viewport
  (`dvh`) so it fits while a phone's browser chrome is expanded.

- [#279](https://github.com/CSCfi/ui/pull/279) [`515bd82`](https://github.com/CSCfi/ui/commit/515bd82ed73a83af662d0d506edf3b76382761bb) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Side navigation sub-items paint their hover, active, indicator bar and focus
  ring as translucent washes of the `on-nav-active` ink of the pill they sit in
  (ADR-0052). They still carried page roles — `surface-raised`, the primary
  tint — which in dark mode made the selected sub-item a grey slab at 2:1 inside
  the teal drawer and its hover states near-invisible.

- [#279](https://github.com/CSCfi/ui/pull/279) [`cef330a`](https://github.com/CSCfi/ui/commit/cef330a9ae15884bbbd6050d88a025ec47dc7811) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-side-navigation-title` drops its top margin when it is the first child of
  `c-side-navigation`, so the first section title sits directly under the nav
  padding instead of adding a section gap above it.

- [#279](https://github.com/CSCfi/ui/pull/279) [`7d0675b`](https://github.com/CSCfi/ui/commit/7d0675b3b3e1f1844ae125f0bc09263fa6c5d6f4) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-side-navigation-title`'s underline is visible again in light mode: it paints
  a translucent `on-nav` ink instead of the page's `divider` ink, which is a
  translucent black that vanished on the dark nav surface.

- [#279](https://github.com/CSCfi/ui/pull/279) [`c6105de`](https://github.com/CSCfi/ui/commit/c6105de2ffe67819faf771e24a08122b8ec2e4aa) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-slider`'s value bubble appears the moment the thumb is pressed or the
  input focused, on touch as well as with a mouse; the 300ms transition now
  only plays when it hides.

- [#279](https://github.com/CSCfi/ui/pull/279) [`33191df`](https://github.com/CSCfi/ui/commit/33191dff05deba9f330bda36f701dfe563e01c51) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-tab-buttons` scrolls sideways when the strip is wider than its box instead
  of letting the buttons overlap: a single row inside a native scroller with a
  hidden scrollbar, edge arrows (new `scroll-back` / `scroll-forward` parts)
  while it overflows, mouse drag and wheel scrolling, and the active tab is
  scrolled into view when `c-tabs` changes it. The sliding indicator follows the
  buttons through the scroller.

## 4.0.0-alpha.16

### Patch Changes

- [#277](https://github.com/CSCfi/ui/pull/277) [`0777e00`](https://github.com/CSCfi/ui/commit/0777e0015d746e8e7f66ca2e59d7405ecfede840) Thanks [@razorfever](https://github.com/razorfever)! - Fix the fullscreen panel of `c-autocomplete`, `c-tree-select` and `c-select`
  uncovering the page while the on-screen keyboard is open: the panel keeps
  covering the whole screen, and only its content — the heading row, the search
  input and the options — shrinks to the space the keyboard leaves.

## 4.0.0-alpha.15

### Minor Changes

- [#275](https://github.com/CSCfi/ui/pull/275) [`5855ff9`](https://github.com/CSCfi/ui/commit/5855ff924450fadbb3267d17b61a2ffeeaae60a5) Thanks [@razorfever](https://github.com/razorfever)! - Add app-wide prop defaults (ADR-0048): `applyDefaults()` sets a preference
  prop once for every instance of a tag, and `resetDefaults()` clears it.

  - `applyDefaults({ 'c-text-field': { labelOnTop: true } })` makes every text
    field label on top; `applyDefaults({ 'c-select': { texts } })` translates
    every select in one call. Later calls merge with earlier ones, a key set to
    `undefined` clears it, and mounted elements follow live — a locale switch is
    one call.
  - Only defaultable props take part, badged "app default" in each component's
    Properties table and typed as `AppDefaults`: `labelOnTop`, `hideDetails`,
    `shadow` and `size` on c-text-field, c-select, c-autocomplete and
    c-tree-select; `itemsPerPage` on the three list fields; `texts` on those
    three and c-data-table. An unknown tag or prop throws.
  - An explicit attribute or property on an instance always wins over the app
    default; `texts` merges key by key over the built-in strings. Both functions
    are re-exported from `@cscfi/csc-ui-react`.

  Two visible changes for these props: when unset, the element property now
  reads `undefined` instead of the built-in (`el.labelOnTop`, `el.size`,
  `el.itemsPerPage`), and the host no longer carries the reflected default
  attributes `size="default"` / `items-per-page="6"`.

- [#275](https://github.com/CSCfi/ui/pull/275) [`fd4bf56`](https://github.com/CSCfi/ui/commit/fd4bf56ba38095517dc0c9f95fe0bea263d29e5d) Thanks [@razorfever](https://github.com/razorfever)! - Value-selection fields open a fullscreen panel on narrow viewports. Below
  760px, `c-autocomplete` and `c-tree-select` no longer anchor their panel under
  the field: it covers the viewport with a heading row (the field's label and a
  close button), the search input pinned beneath it and the options filling the
  rest, following the on-screen keyboard so the search stays visible. The page
  behind the panel is inert until it closes. `c-select`'s existing phone layout
  now covers the whole viewport (no gaps below the small viewport or at the
  corners), follows the keyboard the same way and gains the same heading row.
  The close button's label is the new `closePanel` text; the row exposes the
  `heading-row`, `heading` and `close` parts.

  Transient panels (`c-menu`, `c-popover`, `c-autocomplete`, `c-tree-select`) no
  longer close when a scroll or drag gesture starts outside them: light dismiss
  now needs the press and its release both outside, as for a native popover.

## 4.0.0-alpha.14

### Minor Changes

- [#273](https://github.com/CSCfi/ui/pull/273) [`c3725b5`](https://github.com/CSCfi/ui/commit/c3725b501ae2ddc3e18ee876e1e7f8226592ad4d) Thanks [@razorfever](https://github.com/razorfever)! - Add `c-tree-select`, a single-value field for picking one item from nested
  data of arbitrary depth (ADR-0047) — a stepped listbox in c-autocomplete's
  field-plus-panel arrangement.

  - The panel browses one level at a time: picking a branch lists its children,
    a breadcrumb climbs back, and the header names the level (`level-labels`)
    with a step counter while the depth is uniform.
  - Typing into the in-panel search input lists matches from the whole tree
    with their path; the query matches names and codes of an item and of its
    ancestors, a `filter` predicate replaces the default, and matches are
    marked (`::part(match)`).
  - `items` (a DOM property) is the tree: `{ value, name, code?, disabled?,
children? }`. The closed field shows the committed item's path above its
    code and name; `return-object` emits `{ value, name, code, path }`.
  - `allow-branch` lets a branch be committed through a pinned select-branch
    row at the top of its level list.
  - Value events follow the 4.x convention: `change` (with the value),
    `update:value` and a native `input` — no `changeValue`. `change:query`
    reports the query.
  - Parts: `panel`, `card`, `search`, `breadcrumb`, `crumb`, `header`, `list`,
    `item`, `select-branch`, `code`, `path`, `match`, `info`. Texts are
    overridable through `texts`; keyboard: arrows, Enter, ArrowRight /
    ArrowLeft / Backspace to move between levels, Escape.

  Also in this change: the anchored-panel lifecycle and the live status region
  c-autocomplete used inline are now shared internals it and c-tree-select
  build on, and a click on a disabled option row in c-autocomplete no longer
  moves keyboard focus out of the search input.

### Patch Changes

- [#273](https://github.com/CSCfi/ui/pull/273) [`d54ae8a`](https://github.com/CSCfi/ui/commit/d54ae8a9c05d7a4a0a9cd4a763dadad57d204653) Thanks [@razorfever](https://github.com/razorfever)! - Fix(c-select): the picked option's row ends in a check mark, as in
  c-autocomplete — for slotted options and `items` alike. The mark follows the
  value, not the keyboard highlight.

  Fix(c-select): a value set from code (an initial `v-model`, say) now marks its
  option like a click does, and opening the list with the mouse highlights the
  picked option, so the arrow keys continue from it instead of the first row.

## 4.0.0-alpha.13

### Minor Changes

- [#271](https://github.com/CSCfi/ui/pull/271) [`5f0a398`](https://github.com/CSCfi/ui/commit/5f0a398aef3bf49ee211e1ad255a49562b8ba908) Thanks [@razorfever](https://github.com/razorfever)! - c-select and c-autocomplete gain a `select-all` attribute for `multiple` mode
  (ADR-0046): a row pinned at the top of the list that selects every listed
  enabled option — in c-autocomplete, the current matches — and unselects them
  again when they are all selected, with a checkbox indicator that reads none,
  some or all. Its label is `texts.selectAll`, a function receiving the number
  of listed options (default "Select all"), and the row is stylable through
  the new `select-all` part.

  In a `multiple` c-select, Space now only toggles the focused row (and opens
  the closed list, like Enter); it no longer also feeds the type-ahead, which
  silently dropped the tracked highlight after every Space toggle.

### Patch Changes

- [#271](https://github.com/CSCfi/ui/pull/271) [`2d3d34b`](https://github.com/CSCfi/ui/commit/2d3d34b3b062eddffab19869e19430698eeff91e) Thanks [@razorfever](https://github.com/razorfever)! - Fix(c-autocomplete): a component nested in a slotted option — a `c-icon` with
  a bound `path`, for instance — renders in the panel as soon as it opens, not
  only after a query is typed. Changing an option's `disabled`, `value` or the
  attributes of its content after mount now updates its row as well.

## 4.0.0-alpha.12

### Minor Changes

- [#269](https://github.com/CSCfi/ui/pull/269) [`4c2f2b1`](https://github.com/CSCfi/ui/commit/4c2f2b12542d5643b8ea7e76c26d8396f8523d0c) Thanks [@razorfever](https://github.com/razorfever)! - c-option-value is the option's label region again (ADR-0045). In c-select and
  c-autocomplete a slotted option's label — the closed field's text, its tag in
  `multiple` mode, what the autocomplete filter matches — is its `name`, else
  the text of its `c-option-value`, else the option's whole text, so an option
  can carry a description or an icon beside its label. c-autocomplete marks the
  runs of each label that equal the typed query with `<mark>` again, inside the
  `c-option-value` of a slotted option or in an `items` entry's label; an option
  without the wrapper renders exactly as authored. The marks are the new `match`
  part (`c-autocomplete::part(match)`), and the query is matched literally, so
  `c++` or `(` no longer throw as they did in 3.x.

- [#269](https://github.com/CSCfi/ui/pull/269) [`d81a761`](https://github.com/CSCfi/ui/commit/d81a761ee30b60037f4d45827f3702dc74f8be11) Thanks [@razorfever](https://github.com/razorfever)! - c-select and c-autocomplete gain a `multiple` mode (ADR-0044). With the
  `multiple` attribute set, `value` holds an array of the picked values (or
  items with `return-object`), in the order they were picked, and the value
  events carry that array — `v-model` keeps working. Every option row shows a
  checkbox indicator and toggles without closing the list; the selections
  render as removable tags inside the field, and Backspace in the closed field
  removes the last one. `max-tags` folds the row: `N` shows the first N tags
  and one "+X more" tag, `0` shows only "X selected". A new `texts` prop
  localises those strings and the field's control labels (clear, toggle,
  search, loading, no results) that were hardcoded before.
  `c-select::part(indicator)` / `::part(mark)` recolour the row checkboxes the
  same way they do on c-checkbox; the new `tags`, `tag` and `tag-root` parts
  reach the tag row, and c-autocomplete's option rows gain the `item` part.

  c-tag gains a `close-label` prop naming its close button for assistive
  technology.

  BREAKING: because `value` can now be an array, the manifest no longer lists a
  `value` attribute on c-select and c-autocomplete — bind it as a property
  (`v-model`, `:value.prop`, `element.value = …`); the single-value contract
  is otherwise unchanged. c-autocomplete's `no-results-text` prop is removed:
  set `texts.noResults` instead. A `closeable` c-tag's host is no longer a
  `role="button"` tab stop — its close button is the interactive control — so
  listen for `close` rather than key events on a closeable tag.

### Patch Changes

- [#269](https://github.com/CSCfi/ui/pull/269) [`8ef62d1`](https://github.com/CSCfi/ui/commit/8ef62d16494ad5fe0b0ac2651a5f8bb83b6dfcb9) Thanks [@razorfever](https://github.com/razorfever)! - `c-menu`, its submenus and `c-select` now hide the list scrollbar, as
  `c-autocomplete` already did (ADR-0043). In its place an overflowing panel
  always ends on a half-visible row — the peek — so it is clear that more items
  follow. `items-per-page` keeps meaning that many full rows before the peek, and
  menus cap at the viewport. The cap is now measured from the real rows, so
  taller `c-option` rows and menus mixing items with labels and dividers cut
  correctly. Restore the scrollbar with `scrollbar-width: auto` on
  `c-select::part(list)`, `c-autocomplete::part(list)`, `c-menu::part(list)` or
  `c-menu-item::part(submenu)`.

## 4.0.0-alpha.11

### Patch Changes

- [#267](https://github.com/CSCfi/ui/pull/267) [`eabb9fa`](https://github.com/CSCfi/ui/commit/eabb9fa1d57ea7cf19c805d59efca1ce4c83334c) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-button-group` and `c-tab-buttons` now read on every surface (ADR-0042).
  Their track was drawn only by an opaque fill, which disappeared on the page
  canvas, on `surface-muted`, and on dark-mode cards. The track keeps its fill
  and gains a 1px hairline frame painted with the `divider` token, so the
  control is visible wherever it is placed. The height is unchanged: the frame
  replaces 1px of the inner padding. The `root` part of both components now
  carries a border; `::part(root)` overrides of `background` are unaffected.

## 4.0.0-alpha.10

### Minor Changes

- [#265](https://github.com/CSCfi/ui/pull/265) [`db862f7`](https://github.com/CSCfi/ui/commit/db862f72a692d3904cd03cacab76fcc5c36b6ff9) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Publish the chart tokens as importable data (ADR-0040), so canvas charts no
  longer scrape `--c-chart-*` from the document.

  - `chartSlots` and `chartAnatomy`: the twelve series slots and the chart
    anatomy roles (`surface`, `grid`, `axis`) per theme mode, as `oklch()`
    strings — the palette's own colour space, ready for CSS, SVG and canvas.
  - `chartSlotsHex` and `chartAnatomyHex`: the same colours as `#rrggbb`, for
    chart libraries that do their own colour maths in sRGB (ECharts, Chart.js)
    and cannot parse `oklch()`.
  - `themeMode()`: resolves the mode on screen by the same cascade tokens.css
    uses (explicit `data-theme` wins, else the OS preference; light on the
    server).

  The data is generated from the semantic token maps at build time and guarded
  by a parity lint, and it always reports the frozen, validated set — it never
  follows a consumer's `--c-chart-*` overrides. Re-exported from
  `@cscfi/csc-ui-react`.

- [#265](https://github.com/CSCfi/ui/pull/265) [`db862f7`](https://github.com/CSCfi/ui/commit/db862f72a692d3904cd03cacab76fcc5c36b6ff9) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Export `DEFAULT_SEEDS` and `FAMILIES` from the package root.

  A theme UI (colour pickers, a brand switcher) can now start from the
  library's built-in step-500 seeds and the list of themable families instead
  of reading `--c-<family>-500` back off the document — those values are
  `oklch()` strings since ADR-0041 and are not what an `<input type="color">`
  accepts. `applyTheme` / `resetTheme` are unchanged.

  The published typings now include the hand-written `ramp.d.ts`, so `Family`,
  `ThemeSeeds`, `DEFAULT_SEEDS` and `FAMILIES` resolve to their real types for
  consumers instead of falling through to an unresolved module.

- [#265](https://github.com/CSCfi/ui/pull/265) [`db862f7`](https://github.com/CSCfi/ui/commit/db862f72a692d3904cd03cacab76fcc5c36b6ff9) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Emit every colour token as `oklch()` (ADR-0041).

  All `--c-*` custom properties in `tokens.css` — palette steps, semantic
  roles' literal values (chart slots, logo marks) — and the ramps written by
  `applyTheme` / `themeToCss` are now `oklch(L C H)` strings instead of
  `#rrggbbff`. Colours are unchanged: each value is converted from the same
  validated hex at a precision that round-trips exactly, and the build's ramp
  parity check compares tokens.css and the runtime output byte for byte. The
  `--c-<family>-rgb` compositing triples stay numeric.

  Requires a browser with `oklch()` support (Chrome 111, Safari 15.4, Firefox
  113 and later), which the library's custom-element and Tailwind v4 baseline
  already implies. Consumers who read `--c-*` back and parsed hex should use
  the exported chart data (`chartSlotsHex`) or the `-rgb` triples instead.

### Patch Changes

- [#265](https://github.com/CSCfi/ui/pull/265) [`db862f7`](https://github.com/CSCfi/ui/commit/db862f72a692d3904cd03cacab76fcc5c36b6ff9) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-csc-logo` renders fully white in dark mode. The dark `logo-wordmark`,
  `logo-teal` and `logo-magenta` roles all resolve to `white`; previously the
  star and wordmark were near-white (`slate-100`) and the kite kept a
  brightened magenta literal, so the mark read as two-tone on the dark header.
  Light mode is unchanged.

## 4.0.0-alpha.9

### Patch Changes

- [#263](https://github.com/CSCfi/ui/pull/263) [`e8d275b`](https://github.com/CSCfi/ui/commit/e8d275b53571ed519cd3185ae873459af848ba5d) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Restore the coloured `on-*-subtle` ink in dark mode.

  The dark-mode retune (alpha.8) moved the `on-*-subtle` ink to the near-white
  `*-50` step, which turned alert icons and headings white: `c-alert` paints
  them with that ink on an alpha wash over the surface, not on the solid
  subtle fill. The ink returns to the coloured `*-200` step for every family.
  Primary, secondary, info, error and link keep the `*-700` subtle fill; accent,
  success and warning go back to `*-800` (hover `*-700`) so the pair still
  clears WCAG AA. Every `on-*-subtle / *-subtle` pair passes the strict
  contrast audit (4.74:1–6.49:1).

## 4.0.0-alpha.8

### Minor Changes

- [#260](https://github.com/CSCfi/ui/pull/260) [`6f3ac93`](https://github.com/CSCfi/ui/commit/6f3ac93ea3c0670884c5e22d23b7a73fbfcc29b3) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Re-derive the twelve chart series slots (`--c-chart-1` … `--c-chart-12`) as
  vivid single hues (ADR-0030, amended).

  - The previous set was five dark/light shade pairs plus two singles, parked
    just above the chroma floor; it read flat, and the dark shades read too
    dark. The new set is twelve single hues at a mid lightness (OKLCH L
    0.55–0.67 light, 0.58–0.67 dark) with chroma pushed to the sRGB gamut under
    per-hue ceilings.
  - Slots 1–7 keep their hue identities (blue, magenta, gold, purple, teal,
    rose, cyan) so charts with up to seven series keep familiar colours; slots
    8–12 are new hues (indigo, orchid, olive, violet, aqua). Status hue bands
    (reds, oranges, greens) are excluded.
  - Every slot now clears 3:1 on both chart surfaces — the four dark-mode
    relief slots are gone. The all-pairs safe prefix for scatter/bubble/map
    forms stays at slots 1–3.
  - Validated as a set with the dataviz validator: adjacent-pair CVD ΔE 10.2
    (light) / 8.7 (dark), normal-vision floor 17.9 / 16.9.

  Chart tokens are frozen literals, so this does not interact with
  `applyTheme`; consumers who override `--c-chart-*` are unaffected.

- [#260](https://github.com/CSCfi/ui/pull/260) [`6f3ac93`](https://github.com/CSCfi/ui/commit/6f3ac93ea3c0670884c5e22d23b7a73fbfcc29b3) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Make dark mode more vibrant: saturated fills and visible subtle tints, all
  still resolved inside each role's own family (ADR-0034).

  - The ramp core (`src/theme/ramp.js`) now holds full seed chroma through
    steps 400–300 and tapers only from 200 up (`C_FACTOR` 400/300/200:
    0.92/0.78/0.55 → 1.0/1.0/0.72). Step 300 is every family's dark-mode fill
    and 200 its hover, and the old taper left low-chroma seeds reading grey —
    the dark primary button moves from `#67a2b0` to `#54a5b7` at the same
    contrast. Every family's 200–400 steps shift accordingly in both modes
    (light-mode hover fills get slightly richer); warning and error are at the
    sRGB gamut edge and do not move. Consumer ramps from `applyTheme` /
    `themeToCss` follow the same curve.
  - Dark-mode status and accent fills move to the saturated `*-400` step
    (hover `*-300`, ink `*-950`). Primary, secondary and link fills stay where
    they are — their next step fails WCAG AA text with any ink.
  - Dark-mode subtle tints move from `*-800` to `*-700` (hover `*-600`) with
    the near-white `*-50` ink. `*-800` sat within 1.0–1.6:1 of the slate-800
    page and read as the page colour.
  - Dark nav chrome moves one step lighter (`primary-700`, hover `primary-600`)
    and the active item becomes the brand `primary-500` under white ink.
  - The frozen chart slots (ADR-0030) are literals and do not move.

  Dark mode passes every audited text pair at AA and every non-text pair at
  3:1 (`scripts/audit-contrast.mjs --strict`); ramp parity
  (`scripts/check-ramp-parity.mjs`) holds.

## 4.0.0-alpha.7

### Minor Changes

- [#258](https://github.com/CSCfi/ui/pull/258) [`51a0521`](https://github.com/CSCfi/ui/commit/51a052127f844dc385597764f8f2627ab49f648c) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Add designated triggers and popover nesting (ADR-0038).

  - `c-popover`, `c-menu` and `c-tooltip` accept a new `trigger` prop — the
    document ID of an element, or the element itself — for opening the overlay
    from a trigger that cannot be slotted. The component wires its usual
    opening interaction (click, or hover/focus for the tooltip), ARIA mirroring
    and focus return onto the designated element and anchors the panel to it.
    When both the slot and the prop are supplied, the prop wins and a console
    warning flags it.
  - `c-popover`s now nest: the open popovers form a chain where Escape closes
    only the innermost popover (one press per layer), clicking outside closes
    every popover that does not contain the click, and closing a popover closes
    everything nested inside it. Previously a single Escape press closed every
    open popover at once.

- [#258](https://github.com/CSCfi/ui/pull/258) [`b0f195f`](https://github.com/CSCfi/ui/commit/b0f195f79c67ffd172a54bf894ed53821b6b7f04) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - The keyboard focus ring of `c-checkbox` and `c-radio` now follows the
  indicator's colour (ADR-0039). It is drawn by the `indicator` part with
  `currentColor`, and the checkbox indicator's border and checked fill draw with
  `currentColor` too, so one rule recolours box, dot and focus ring together:
  `c-checkbox::part(indicator) { color: green }`. Ring geometry is unchanged, the
  hover tint stays on the primary colour, and `c-switch` is unchanged.

### Patch Changes

- [#258](https://github.com/CSCfi/ui/pull/258) [`5e501b9`](https://github.com/CSCfi/ui/commit/5e501b96f62b48b1cc6a1b5cf9280da888727ac1) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Fix c-modal focus behaviour: the dialog box no longer shows a focus ring
  (the native `<dialog>` root is a focus start point, not an interactive
  control — it now suppresses the UA `:focus-visible` outline), and initial
  focus reliably moves to the first focusable or `[autofocus]` element also
  when the modal is open at mount. Previously the mount-time open path ran the
  focus search before the slotted csc-ui elements had upgraded (their shadow
  roots were still empty), so focus always fell back to the dialog itself.

## 4.0.0-alpha.6

### Minor Changes

- [#256](https://github.com/CSCfi/ui/pull/256) [`444e2d9`](https://github.com/CSCfi/ui/commit/444e2d9f4ba67d44f6bbfdafc567a129e7388ce5) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - c-alert heading API:

  - New `heading` string prop renders the alert heading; the slot overrides
    it for rich content. New `heading` CSS part on the prop-rendered heading.
  - The `title` slot is renamed to `heading` (`slot="heading"`) — `title` is
    avoided across the library because the native `title` attribute triggers
    the browser tooltip.

- [#256](https://github.com/CSCfi/ui/pull/256) [`b30f342`](https://github.com/CSCfi/ui/commit/b30f3425b9ee541b8ac481591cdd63ee05acf67a) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Selection controls are now stylable per state from consumer CSS (ADR-0035).
  `c-checkbox`, `c-radio` and `c-switch` expose their interaction state as
  custom states (`c-checkbox:state(checked)`, `:state(indeterminate)`,
  `c-radio:state(checked)`, `:state(disabled)`, `c-switch:state(checked)`),
  and the `indicator` part now targets the actual visual control — the
  checkbox box (with the new `mark` part for the check glyph) and the radio
  ring (its dot is the ring's `::after`) — so rules like
  `c-checkbox:state(checked)::part(indicator) { background: green }` work.

  BREAKING: `::part(indicator)` no longer targets the circular ripple/hover
  surface on `c-checkbox`/`c-radio`; that surface is internal and no longer
  stylable. Also fixes the indeterminate checkbox never filling its box.

- [#256](https://github.com/CSCfi/ui/pull/256) [`692cf41`](https://github.com/CSCfi/ui/commit/692cf41b387b8119e92a4b7c7a40953bfb2ebcc8) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - c-table now leaves your `<table>` in your own DOM instead of moving it into
  its shadow root:

  - Your page CSS and `::part()` selectors now reach everything inside the
    table — e.g. a `c-tag` in a cell can be styled with
    `c-tag.status::part(root) { … }`, matching how other components customize.
  - c-table installs its table styling once per page as a scoped stylesheet
    (`c-table > table.c-table …`). Note that your own global table resets can
    now also reach the table, which the shadow boundary previously blocked.
  - Responsive mobile labels are cloned from the header cells as live nodes
    instead of serialized HTML, and header lookup now only considers
    `<th>` elements inside `<thead>`.
  - A `<table>` slotted in after mount is now picked up automatically.

### Patch Changes

- [#256](https://github.com/CSCfi/ui/pull/256) [`284e9ec`](https://github.com/CSCfi/ui/commit/284e9ec98461d45473c562ca3e0d41168e9c4420) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - `c-autocomplete`'s in-panel search input now shows a magnifying-glass icon
  in front of the input as a "type to filter" affordance. The glyph is
  decorative (hidden from assistive technology) and inherits its color from
  the search row, so `::part(search)` color overrides apply to it as well.
  The options list also gained a small gap below the search row's divider.

- [#256](https://github.com/CSCfi/ui/pull/256) [`b30f342`](https://github.com/CSCfi/ui/commit/b30f3425b9ee541b8ac481591cdd63ee05acf67a) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Separator lines are now visible on dark-mode overlay surfaces (ADR-0036).
  `c-divider` inside `c-menu` and the search-row line in `c-autocomplete`'s
  panel used the `border` token, which in dark mode resolves to the same color
  as the panel background. Both now paint a new `divider` semantic token — a
  translucent ink (black @ 12% in light mode, white @ 12% in dark) that reads
  consistently on every surface. The token is exported as `--c-divider` and,
  via the Tailwind theme export, as the `divider` color utilities.

## 4.0.0-alpha.5

### Minor Changes

- [#254](https://github.com/CSCfi/ui/pull/254) [`4f24cf0`](https://github.com/CSCfi/ui/commit/4f24cf047dd38a926309c4e7747f5a7b5e832706) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Add `c-progress-circle`, a circular determinate progress indicator — the
  circular counterpart of `c-progress-bar`.

  - Props: `value` (0–100, clamped), `size` (diameter in px, default 32) and
    `width` (track thickness in px, default 6; the value arc draws at half
    this, inset within the track).
  - Default slot for optional centered content (e.g. '57%' or an icon); nothing
    auto-renders in the center.
  - Customization via `::part(root)` / `::part(track)` / `::part(bar)` /
    `::part(content)`; the arc strokes the primary role on a muted surface
    track.
  - Exposes `role="progressbar"` with `aria-valuemin/max/now`; name it with
    `aria-label` on the element.
  - Determinate-only by design: circular unknown-duration waiting remains
    `c-spinner`'s job.

### Patch Changes

- [#254](https://github.com/CSCfi/ui/pull/254) [`ec7528b`](https://github.com/CSCfi/ui/commit/ec7528bf31f1a4ed784bd62afdfa361312aa055b) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Fix `c-progress-bar`'s inverted `aria-busy`: the host now reports
  `aria-busy="true"` only while the bar is indeterminate, instead of the
  opposite. A determinate bar's value updates are no longer marked as content
  assistive technology should defer.

## 4.0.0-alpha.4

### Minor Changes

- [#252](https://github.com/CSCfi/ui/pull/252) [`11d0dcb`](https://github.com/CSCfi/ui/commit/11d0dcb71be11827f6f55083fae3903c980a1846) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Redesign c-alert per the MyCSC alert spec:

  - The box is now a tinted container: a 10% wash of the type's role colour
    with a 40% hairline border and a solid 4px accent edge on the left,
    replacing the old 2px outline + 12px edge look.
  - Severity is carried by the icon, the title and the accent edge (the
    role's `on-*-subtle` ink); body copy stays high-contrast `on-surface`.
    Slotted titles now render at body size in the type's ink (previously
    18px neutral).
  - The `default` type now renders an icon and the brand-primary look
    (previously icon-less).
  - New `dismissible` prop renders a dismiss button (`aria-label="Dismiss"`)
    that emits the new `dismiss` event; the alert never removes itself — the
    consumer owns that. New `dismiss` CSS part.
  - Alerts now carry an ARIA live-region role: `role="alert"` (assertive) for
    warning/error, `role="status"` (polite) for neutral/info/success.

- [#252](https://github.com/CSCfi/ui/pull/252) [`11d0dcb`](https://github.com/CSCfi/ui/commit/11d0dcb71be11827f6f55083fae3903c980a1846) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Add a validated dataviz palette as semantic chart tokens: twelve categorical
  series slots (`--c-chart-1` … `--c-chart-12`) plus chart anatomy roles
  (`--c-chart-surface`, `--c-chart-grid`, `--c-chart-axis`), in light and dark
  mode, exposed in the Tailwind theme export as `chart-*` color roles.

  - The 12 slots pass the computable accessibility checks as a set, per mode,
    against the chart surface (which equals the raised card surface): CVD
    separation on adjacent pairs, a normal-vision separation floor, OKLCH
    lightness band and chroma floor, and contrast (with documented dark-mode
    relief slots).
  - Series slots are frozen viz-owned values (ADR-0030): `applyTheme`
    re-seeding re-themes components but never charts, so the validated
    guarantee cannot be silently broken. Override `--c-chart-*` directly to
    opt out and own re-validation.
  - Slot order is part of the contract: assign series in slot order, never
    cycle or re-rank; scatter/bubble/map forms cap at slots 1–3.
  - New docs guide "Data visualization" documents the palette and shows
    dependency-free SVG bar and line charts on a `c-card`.

- [#252](https://github.com/CSCfi/ui/pull/252) [`11d0dcb`](https://github.com/CSCfi/ui/commit/11d0dcb71be11827f6f55083fae3903c980a1846) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Redesign the ghost variant per the "soft tint" ghost design: instead of the
  solid `primary-subtle` slab (which read as a third solid style and barely
  separated from dark surfaces), ghost buttons now rest on an 8% `primary`
  wash that deepens to 15% on hover and 22% while pressed, with the `primary`
  text color carrying the accent. Applies to `c-button` and `c-icon-button`
  `ghost` variants; the `c-accordion-item` header adopts the same treatment
  (soft-tint fill ladder, `primary` text and chevron, hairline border removed)
  so accordions match ghost buttons. The `text` and `outlined` variants of both
  buttons adopt the same 15% `primary` hover wash, replacing the old
  `primary-subtle-hover` / `primary-subtle` hover fills, so all three quiet
  variants share one hover treatment. Focus keeps the offset outline ring.

- [#252](https://github.com/CSCfi/ui/pull/252) [`11d0dcb`](https://github.com/CSCfi/ui/commit/11d0dcb71be11827f6f55083fae3903c980a1846) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Add selectable-choice support and leading icons to c-menu-item:

  - New `active` prop marks an item as the currently selected choice: it
    renders a trailing indicator icon (a check mark by default) and stamps
    `role="menuitemradio"` + `aria-checked`. The state is consumer-owned — the
    menu still emits `select` and never toggles it. Leave `active` unset for
    regular command items (tri-state like c-button's `active`).
  - New `activeIcon` prop overrides the indicator's SVG path.
  - New `icon` prop renders a leading icon (SVG path data) before the item's
    content, following the row color through hover/highlight/danger/disabled
    states.
  - New `icon` and `check` CSS parts for customization.
  - Fix: c-menu's `distance` prop (documented but previously inert) now works —
    it offsets the panel from the trigger on the placement's axis (surviving
    the flip fallbacks) and is inherited by every submenu, which leaves the
    identical gap from its parent surface instead of overlapping it. Default
    stays `0`: surfaces touch, no gap.

- [#252](https://github.com/CSCfi/ui/pull/252) [`9b42b11`](https://github.com/CSCfi/ui/commit/9b42b111e91967b0ef532d8b570b332ac06b00e1) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Refactor `c-radio` / `c-radio-group` onto semantic HTML: each `c-radio` now
  renders its own native radio input with its default slot as the clickable,
  announced label, so radios can be wrapped in arbitrary layout markup at any
  depth inside the group — custom option-card layouts are now plain HTML. The
  group implements the standard radio-group keyboard pattern (one tab stop on
  the checked radio, arrow keys move and select, wrapping and skipping
  disabled; Enter no longer selects, leaving it to form submission), gains a
  `label` slot for rich label content (the `label` prop stays primary), and
  reserves the message row's height so a runtime validation error no longer
  shifts the layout. `c-radio` emits a bubbling `change` event carrying its
  value. Removed: the group's `items`, `return-object`, and `host-id` props
  (author slotted `c-radio` children; values are strings matched against the
  group's `value`) and `c-radio`'s `checked` prop (set the group's `value`
  instead).

- [#252](https://github.com/CSCfi/ui/pull/252) [`603ed29`](https://github.com/CSCfi/ui/commit/603ed2979cf820117401af3dcd0d8052f07929e0) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Redesign toasts as inverted-surface notifications: a borderless
  contrast-flipping pill (near-black in light mode, white in dark mode) with
  the status carried by a circular tinted icon badge, a neutral dismiss button
  (new `badge` and `dismiss` CSS parts) and a neutral progress bar. Adds the
  inverted-surface semantic tokens (`surface-inverted`,
  `on-surface-inverted(-muted)` and the `*-inverted` status roles) to the
  token set and the Tailwind theme export. Toast enter/exit motion now follows
  the stack's placement (top-anchored stacks slide from the top edge) and
  respects `prefers-reduced-motion` (cross-fade instead of a slide).

- [#252](https://github.com/CSCfi/ui/pull/252) [`c580279`](https://github.com/CSCfi/ui/commit/c580279271f396b1d4ca3495b8dbf36fc5908e44) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Add two new anchor-positioned overlay components:

  - `c-tooltip` — a non-interactive text hint shown on hover or keyboard focus
    of its slotted trigger, on the inverted surface tier. Content via the
    `text` prop or the `content` slot; WCAG 1.4.13 behaviour (hoverable panel,
    Escape dismiss, configurable show `delay`).
  - `c-popover` — a click-opened, non-modal interactive surface anchored to its
    slotted trigger, with light dismiss and Escape. Optional `heading`; body
    via the default slot.

  Both float in the top layer via the native Popover API + CSS anchor
  positioning (no z-index management needed), support `position` (12
  placements, new shared `CPlacement` type), `distance`, and a controlled
  `open` prop with a `change:open` event, and are customizable via
  `::part(trigger)` / `::part(panel)` (+ `::part(heading)` on the popover) and
  the semantic tokens.

  Also fixes `c-alert` mirroring its live-region `role` onto the shadow root
  element (duplicate role for assistive tech).

### Patch Changes

- [#252](https://github.com/CSCfi/ui/pull/252) [`11d0dcb`](https://github.com/CSCfi/ui/commit/11d0dcb71be11827f6f55083fae3903c980a1846) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Fix c-accordion-item header text color inconsistency: content in the `header`
  slot inherited the icon/chevron accent tone instead of the heading color, so
  a slotted header rendered a different color than the `heading` prop (teal vs
  white in dark mode). The header button now sets the text color on itself so
  both paths render identically, and the icon/indicator accents are set
  explicitly rather than via `currentColor`.

- [#252](https://github.com/CSCfi/ui/pull/252) [`517ae71`](https://github.com/CSCfi/ui/commit/517ae712a8d423b9aef56992b9359fcf3e9a7acc) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Fix `hide-details` being silently overridden on `c-select` and
  `c-autocomplete`: the dropdown restored its own stale snapshot of the
  setting onto the field when it closed — which also ran on an initial
  `v-model` value arriving at mount — permanently re-showing the message
  area. The dropdown now captures the field's state when it opens and puts
  exactly that back on close.

## 4.0.0-alpha.3

### Patch Changes

- [#250](https://github.com/CSCfi/ui/pull/250) [`0db984e`](https://github.com/CSCfi/ui/commit/0db984ed3dc4d6f20d6f44dd03a4e64d5674a719) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Fix(c-autocomplete): anchor the items panel to the bottom of the field instead of the hint/error message area, and hide the list scrollbar.
  Fix(c-text-field): the border no longer stays primary on a filled-but-blurred field, and `0` in a `type="number"` field counts as a value (floating label lifts).
  Fix(c-select): the dropdown list opens flush under the field when `hide-details` is not set; list text uses the surface text token (was black in dark mode); new `menu`, `list` and `item` CSS parts, plus any `part` attribute inside a slotted `<c-option>` is exported through `c-select::part(<name>)`.
  Feat(c-button-group): the default size is 44px tall (36px buttons in a 4px frame), level with a c-text-field.
  Fix(c-status): the default (untyped) pill is neutral (`surface-muted` / `on-surface-muted`) instead of primary-tinted.
  Fix(c-modal): the `root` part carries the same `rounded-csc-xl` corners as c-card.
  Fix(c-card): the `root` part no longer clips overflow.
  Fix(c-checkbox): the message area is reserved like c-input's so a validation error appearing at runtime causes no layout shift; `message` part is now that area.
  Feat(c-login-button): new `image` slot (and `image-wrap` part) for custom logo markup instead of `src`.
  Feat(c-select, c-text-field, c-autocomplete): `size="small"` renders a 36px field (new shared `CFieldSize` type; `c-input` gains the same `size` prop).
  Docs: example demos render on the card surface by default; canvas-level components (c-card, c-main, navigation chrome, login card) opt into the c-main canvas via `<docs>surface: canvas</docs>` in the canon example.

## 4.0.0-alpha.2

### Minor Changes

- [#248](https://github.com/CSCfi/ui/pull/248) [`149a53a`](https://github.com/CSCfi/ui/commit/149a53a7e5a93f4e8a1e642aef3b6e3e094a2874) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Recolour c-accordion-item per the MyCSC accordion spec (colours only — no
  geometry changes).

  - Header keeps its `primary-subtle` fill and gains a `primary-subtle-hover`
    hairline border plus a hover state on the same tone, so hovering closes
    the fill/border gap (teal-tinted header with a lighter teal outline in
    dark mode, near-invisible on the light tint).
  - Heading text uses `on-surface` (near-white in dark, deep navy-teal in
    light — the spec's headings role); the icon slot and chevron use
    `on-primary-subtle`; slotted content uses `on-surface-muted` instead of
    inheriting the page colour.

- [#248](https://github.com/CSCfi/ui/pull/248) [`149a53a`](https://github.com/CSCfi/ui/commit/149a53a7e5a93f4e8a1e642aef3b6e3e094a2874) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Align c-card and c-card-title with the MyCSC card anatomy.

  - `c-card` now draws a hairline `border`-token outline and a single soft
    drop shadow (`0 2px 8px rgba(0,0,0,.25)`) instead of the heavy two-layer
    shadow — elevation reads from the surface + border, matching the design
    spec in both modes.
  - Card sections get the spec's 24px/28px padding rhythm: a new
    `--_c-card-padding-inline` host contract (28px at desktop) drives the
    inline padding of c-card-title / c-card-content / c-card-actions, while
    `--_c-card-gap` keeps owning block padding and section gaps.
  - `c-card-title` follows the spec's section-title anatomy: 13.5px/700
    uppercase with 1.2px tracking, `on-surface` heading colour (the spec's
    headings role), and a 42×3px rounded `primary` accent bar 8px below.

- [#248](https://github.com/CSCfi/ui/pull/248) [`149a53a`](https://github.com/CSCfi/ui/commit/149a53a7e5a93f4e8a1e642aef3b6e3e094a2874) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Retune the dark-mode palette to the approved MyCSC dark theme v2 spec.

  - The hand-tuned `slate` ladder now carries the spec's neutral grays: no
    near-black surfaces (page canvas `#24272a`, cards `#2b2f33`), softer
    hairline borders (`#3c4247`), and off-white body text (`#e9ecee` instead
    of pure white). A new `slate-850` step (`#26292d`) backs the inset/muted
    surface tier.
  - Dark-mode surface-ladder roles shifted up the retuned ladder so elevation
    reads from progressively lighter surfaces (`surface-sunken` `slate-900` →
    `surface`/`surface-raised` `slate-800` → `surface-overlay` `slate-700`).
  - Bright interactive roles (`primary` fills, `link`, `ring`) now resolve to
    accent-family steps in dark mode — the vivid CSC teal — instead of the
    chroma-tapered pre-anchor primary steps that read washed on dark
    surfaces. Deep navy-teal fills (nav chrome, subtle fills) stay on primary
    steps, one step lighter than before. Re-seed `accent` to rebrand the dark
    interactive teal; `primary` still drives nav/subtle fills.
  - Subtle-fill hover states now lighten instead of darken in dark mode
    (`*-subtle-hover`: step 900 → 700).
  - The dark-mode logo keeps the magenta kite as a brightened fixed brand
    mark (`#c2447c`) instead of rendering fully white.

  All dark-mode text pairs pass WCAG AA (body text 11.4:1, secondary text
  ≥ 4.75:1 on every surface); non-text UI pairs pass 3:1.

## 4.0.0-alpha.1

### Minor Changes

- [#246](https://github.com/CSCfi/ui/pull/246) [`1135100`](https://github.com/CSCfi/ui/commit/11351000f2f1a07df58dec4789c6900524638656) Thanks [@razorfever](https://github.com/razorfever)! - c-autocomplete gains an external (async) data mode. A new `external` prop
  turns internal filtering off so `items` can come from a server, a new
  `change:query` event carries the typed query (it also fires with an empty
  string whenever the panel opens — use that to load the initial list), and
  the panel shows a loading row while `loading` is set with nothing to
  display. The selected label now survives `items` swaps. Default filtering
  behaviour is unchanged.

## 4.0.0-alpha.0

### Major Changes

- [#244](https://github.com/CSCfi/ui/pull/244) [`84882b8`](https://github.com/CSCfi/ui/commit/84882b8bf323c3aa480f5da513055724276279dc) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Complete rewrite of the component library as Vue SFCs compiled to custom
  elements, replacing the Stencil implementation.

  All 73 component tags are preserved, but this is a breaking upgrade — see
  the migration guide in the documentation. Highlights:

  - Native Vue `v-model` contract; the `v-control` directive and the
    `@cscfi/csc-ui-vue` / `@cscfi/csc-ui-vue2` wrapper packages are retired.
  - Consumer styling goes exclusively through CSS `::part()`; per-component
    class/override props are removed.
  - Semantic design tokens with built-in dark mode and runtime consumer
    theming.
  - `@cscfi/csc-ui-react` is now generated from the Custom Elements Manifest
    onto `@lit/react` and is version-locked to the core package.
  - Component API changes per the 4.x documentation (e.g. `c-menu-items` →
    `c-menu-item`/`c-menu-label`, `c-button-group` split out of
    `c-tab-buttons`, data-table column API reworked).
  - Removed components: `c-row`, `c-spacer` (use your own flexbox layout) and
    `c-swiper`/`c-swiper-tab` (no replacement).
