# @cscfi/csc-ui

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
