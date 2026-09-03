# @cscfi/csc-ui-react

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
- Updated dependencies [[`db862f7`](https://github.com/CSCfi/ui/commit/db862f72a692d3904cd03cacab76fcc5c36b6ff9), [`db862f7`](https://github.com/CSCfi/ui/commit/db862f72a692d3904cd03cacab76fcc5c36b6ff9), [`db862f7`](https://github.com/CSCfi/ui/commit/db862f72a692d3904cd03cacab76fcc5c36b6ff9), [`db862f7`](https://github.com/CSCfi/ui/commit/db862f72a692d3904cd03cacab76fcc5c36b6ff9)]:
  - @cscfi/csc-ui@4.0.0-alpha.10

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

- Updated dependencies [[`e8d275b`](https://github.com/CSCfi/ui/commit/e8d275b53571ed519cd3185ae873459af848ba5d)]:
  - @cscfi/csc-ui@4.0.0-alpha.9

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

### Patch Changes

- Updated dependencies [[`6f3ac93`](https://github.com/CSCfi/ui/commit/6f3ac93ea3c0670884c5e22d23b7a73fbfcc29b3), [`6f3ac93`](https://github.com/CSCfi/ui/commit/6f3ac93ea3c0670884c5e22d23b7a73fbfcc29b3)]:
  - @cscfi/csc-ui@4.0.0-alpha.8

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
- Updated dependencies [[`51a0521`](https://github.com/CSCfi/ui/commit/51a052127f844dc385597764f8f2627ab49f648c), [`5e501b9`](https://github.com/CSCfi/ui/commit/5e501b96f62b48b1cc6a1b5cf9280da888727ac1), [`b0f195f`](https://github.com/CSCfi/ui/commit/b0f195f79c67ffd172a54bf894ed53821b6b7f04)]:
  - @cscfi/csc-ui@4.0.0-alpha.7

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
- Updated dependencies [[`444e2d9`](https://github.com/CSCfi/ui/commit/444e2d9f4ba67d44f6bbfdafc567a129e7388ce5), [`284e9ec`](https://github.com/CSCfi/ui/commit/284e9ec98461d45473c562ca3e0d41168e9c4420), [`b30f342`](https://github.com/CSCfi/ui/commit/b30f3425b9ee541b8ac481591cdd63ee05acf67a), [`b30f342`](https://github.com/CSCfi/ui/commit/b30f3425b9ee541b8ac481591cdd63ee05acf67a), [`692cf41`](https://github.com/CSCfi/ui/commit/692cf41b387b8119e92a4b7c7a40953bfb2ebcc8)]:
  - @cscfi/csc-ui@4.0.0-alpha.6

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
- Updated dependencies [[`ec7528b`](https://github.com/CSCfi/ui/commit/ec7528bf31f1a4ed784bd62afdfa361312aa055b), [`4f24cf0`](https://github.com/CSCfi/ui/commit/4f24cf047dd38a926309c4e7747f5a7b5e832706)]:
  - @cscfi/csc-ui@4.0.0-alpha.5

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
- Updated dependencies [[`11d0dcb`](https://github.com/CSCfi/ui/commit/11d0dcb71be11827f6f55083fae3903c980a1846), [`11d0dcb`](https://github.com/CSCfi/ui/commit/11d0dcb71be11827f6f55083fae3903c980a1846), [`11d0dcb`](https://github.com/CSCfi/ui/commit/11d0dcb71be11827f6f55083fae3903c980a1846), [`517ae71`](https://github.com/CSCfi/ui/commit/517ae712a8d423b9aef56992b9359fcf3e9a7acc), [`11d0dcb`](https://github.com/CSCfi/ui/commit/11d0dcb71be11827f6f55083fae3903c980a1846), [`11d0dcb`](https://github.com/CSCfi/ui/commit/11d0dcb71be11827f6f55083fae3903c980a1846), [`9b42b11`](https://github.com/CSCfi/ui/commit/9b42b111e91967b0ef532d8b570b332ac06b00e1), [`603ed29`](https://github.com/CSCfi/ui/commit/603ed2979cf820117401af3dcd0d8052f07929e0), [`c580279`](https://github.com/CSCfi/ui/commit/c580279271f396b1d4ca3495b8dbf36fc5908e44)]:
  - @cscfi/csc-ui@4.0.0-alpha.4

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
- Updated dependencies [[`0db984e`](https://github.com/CSCfi/ui/commit/0db984ed3dc4d6f20d6f44dd03a4e64d5674a719)]:
  - @cscfi/csc-ui@4.0.0-alpha.3

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

### Patch Changes

- Updated dependencies [[`149a53a`](https://github.com/CSCfi/ui/commit/149a53a7e5a93f4e8a1e642aef3b6e3e094a2874), [`149a53a`](https://github.com/CSCfi/ui/commit/149a53a7e5a93f4e8a1e642aef3b6e3e094a2874), [`149a53a`](https://github.com/CSCfi/ui/commit/149a53a7e5a93f4e8a1e642aef3b6e3e094a2874)]:
  - @cscfi/csc-ui@4.0.0-alpha.2

## 4.0.0-alpha.1

### Minor Changes

- [#246](https://github.com/CSCfi/ui/pull/246) [`1135100`](https://github.com/CSCfi/ui/commit/11351000f2f1a07df58dec4789c6900524638656) Thanks [@razorfever](https://github.com/razorfever)! - c-autocomplete gains an external (async) data mode. A new `external` prop
  turns internal filtering off so `items` can come from a server, a new
  `change:query` event carries the typed query (it also fires with an empty
  string whenever the panel opens — use that to load the initial list), and
  the panel shows a loading row while `loading` is set with nothing to
  display. The selected label now survives `items` swaps. Default filtering
  behaviour is unchanged.

### Patch Changes

- Updated dependencies [[`1135100`](https://github.com/CSCfi/ui/commit/11351000f2f1a07df58dec4789c6900524638656)]:
  - @cscfi/csc-ui@4.0.0-alpha.1

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

### Patch Changes

- Updated dependencies [[`84882b8`](https://github.com/CSCfi/ui/commit/84882b8bf323c3aa480f5da513055724276279dc)]:
  - @cscfi/csc-ui@4.0.0-alpha.0
