# @cscfi/csc-ui

## 4.0.0-rc.6

### Patch Changes

- [#322](https://github.com/CSCfi/ui/pull/322) [`f4cd793`](https://github.com/CSCfi/ui/commit/f4cd7937e95071d20f59d3e3046d7a1a35abaa49) Thanks [@razorfever](https://github.com/razorfever)! - `focus()` on a `c-button` or `c-icon-button` now focuses its button (its
  link, or the slotted button), as on a native button. It did nothing, so a
  `c-menu` closed from one of them left focus on the page instead of on the
  trigger.

- [#322](https://github.com/CSCfi/ui/pull/322) [`04df6ad`](https://github.com/CSCfi/ui/commit/04df6ad5fbe308805f898c51be5ee450215a80a9) Thanks [@razorfever](https://github.com/razorfever)! - Picking a `c-menu` item or pressing Escape returns focus to the menu's
  trigger with its focus ring when a key closed the menu, in Firefox and Safari
  too; a mouse pick leaves no ring. Escape from inside a `c-popover` returns
  focus to its trigger the same way, a `c-button` or `c-icon-button` trigger
  included.

- [#322](https://github.com/CSCfi/ui/pull/322) [`fe59b03`](https://github.com/CSCfi/ui/commit/fe59b03ab64ab12f5619dc25a5419d279bc3d9b7) Thanks [@razorfever](https://github.com/razorfever)! - The `open` property of `c-menu`, `c-popover` and `c-tooltip` follows the
  panel: it reads `true` while the user has the panel open and `false` once they
  close it, and setting it to `true` again reopens a panel the user closed. It
  used to keep the page's last value, so that second write did nothing.

## 4.0.0-rc.5

### Minor Changes

- [#320](https://github.com/CSCfi/ui/pull/320) [`819d222`](https://github.com/CSCfi/ui/commit/819d22289ccf8590a4feb87009386adae14aaf4e) Thanks [@razorfever](https://github.com/razorfever)! - Outlined `c-button` and `c-icon-button` border in their variant's colour, the
  edge the filled button has, so primary's outline is lighter in light mode.
  Ghost buttons take a stronger tint (14%), and text, outlined and ghost buttons
  share one 20% hover; a pressed ghost button no longer darkens further, the
  ripple marks the press.

- [#320](https://github.com/CSCfi/ui/pull/320) [`5f66b2e`](https://github.com/CSCfi/ui/commit/5f66b2ec8bdb858c6721419d56986adebd03ae73) Thanks [@razorfever](https://github.com/razorfever)! - A password manager can read a `c-button` submit button: write the `<button>`
  inside it, `<c-button><button type="submit">Create account</button></c-button>`.
  The button stays in the page, where a manager that reads a form's submit
  button finds it — Proton Pass offers no password to generate on a sign-up
  form otherwise — and the `c-button` paints it with its appearance, variant,
  size and loading state. The button's own attributes apply, and it submits its
  form natively. Use it for the submit button of a sign-up, log-in or
  change-password form.

- [#320](https://github.com/CSCfi/ui/pull/320) [`8a665d6`](https://github.com/CSCfi/ui/commit/8a665d6302866ce37714c7c368bbf83ffc849545) Thanks [@razorfever](https://github.com/razorfever)! - Error is a cooler red (`#dd042a`), and in dark mode its fills, outlines and
  indicators use a vivid red (`--c-error`, now step 400) instead of salmon.
  Error text on a surface uses the new `--c-on-surface-error` token (Tailwind:
  `text-on-surface-error`), which stays light enough to read in dark mode. Field
  error messages, required marks and other error text use it; an app that
  colours its own error text with `--c-error` should switch to it.

- [#320](https://github.com/CSCfi/ui/pull/320) [`a6a97ba`](https://github.com/CSCfi/ui/commit/a6a97ba767305778b4f7d6f4a3a5799c600ee4ef) Thanks [@razorfever](https://github.com/razorfever)! - The form fields take part in a native `<form>`, as built-in controls do. Each
  submits its value under its `name` (`new FormData(form)` and a posted form
  include it), `form.reset()` returns it to the value its markup set, and a
  disabled `<fieldset>` disables it. A form without `novalidate` now stops its
  submit on a `required` field left empty, bad input, a number out of range, an
  incomplete mask or a partly filled code, with the browser's own message; add
  `novalidate` where your app validates the form itself. Enter in a text, number,
  code or closed picker field now submits the form, as in a native field: through
  its first `<c-button type="submit">`, or, with no submit button, when the form
  has one text field. Handle the form's `submit` (`@submit.prevent`) so it does
  not reload the page, and cancel the Enter keydown where Enter should not save. `c-switch`,
  `c-radio-group`, `c-otp-input` and `c-button-group` gain `name`;
  `c-file-upload` stays out of forms. `c-button` acts on the form its `form`
  attribute names, and a disabled `<fieldset>` disables `c-button` and
  `c-icon-button`.

- [#320](https://github.com/CSCfi/ui/pull/320) [`5aea92d`](https://github.com/CSCfi/ui/commit/5aea92d417058fa5adacda46aec98a11318f9ee2) Thanks [@razorfever](https://github.com/razorfever)! - Password managers can fill a `c-text-field`: write the `<input>` inside it,
  `<c-text-field label="Password"><input autocomplete="current-password"
name="password" type="password"></c-text-field>`. The input stays in the
  page, where Safari's, Firefox's and the extensions' password managers find
  it, and the field frames it with its label, message and password toggle. The
  input's own attributes apply, and in a form it submits and validates itself.
  This replaces 3.x's `c-text-field-open`.

- [#320](https://github.com/CSCfi/ui/pull/320) [`be48a5c`](https://github.com/CSCfi/ui/commit/be48a5c6a2e000167137aba69b2e2b6896dcbd1d) Thanks [@razorfever](https://github.com/razorfever)! - Warning is yellow (`#ffc400`) instead of orange, so it no longer reads like
  error. The `warning` family's ramp changed, and a few warning roles moved to
  darker steps to stay at WCAG AA: `--c-on-warning-subtle` in light mode,
  `--c-inverse-warning`, and `--c-warning-inverted` in dark mode. The no-results
  icon in `c-autocomplete` and `c-tree-select` takes the warning tint's ink.

  Yellow is a fill colour: as text or an icon on a light surface it reads 1.6:1.
  Where an app colours text or icons with `--c-warning` (or `text-warning`),
  switch to `--c-on-warning-subtle` (`text-on-warning-subtle`), which reads
  7.2:1 on white and stays legible in dark mode.

### Patch Changes

- [#320](https://github.com/CSCfi/ui/pull/320) [`8aae9e1`](https://github.com/CSCfi/ui/commit/8aae9e1274b49c6c0f069197eafe16807ecd5b09) Thanks [@razorfever](https://github.com/razorfever)! - The accent and link tokens meet WCAG AA contrast. In light mode
  `--c-on-accent` is dark (accent-950) and `--c-on-accent-subtle` is
  accent-800, so text on the accent fill and tint reads at AA; `--c-link-hover`
  and `--c-link-subtle-hover` stay in the link family (link-600, link-50)
  instead of a pale accent. In dark mode the status and accent tints darken on
  hover (`--c-<role>-subtle-hover`), so their ink stays readable.

- [#320](https://github.com/CSCfi/ui/pull/320) [`64c0e7d`](https://github.com/CSCfi/ui/commit/64c0e7dc00ce3f3654e2663d7cc13003198769a2) Thanks [@razorfever](https://github.com/razorfever)! - Tab moves past a loading `c-button`, and past a disabled link button, instead
  of keeping the keyboard focus on it. Enter and Space still do nothing there.

- [#320](https://github.com/CSCfi/ui/pull/320) [`59d4945`](https://github.com/CSCfi/ui/commit/59d49451e251b475f4cce662b58bb282e8198bb1) Thanks [@razorfever](https://github.com/razorfever)! - Custom states (`:state(checked)`, `:state(bad-input)` …) keep following the
  component after its element is taken off the page and put back, as KeepAlive
  or a moved list item does. Until now they stopped updating there.

- [#320](https://github.com/CSCfi/ui/pull/320) [`3c6dbda`](https://github.com/CSCfi/ui/commit/3c6dbda17c9dc3ff3e002adb0592ca768a4d9bdf) Thanks [@razorfever](https://github.com/razorfever)! - Components no longer declare Tailwind's spacing variable on their hosts, so
  an app's own Tailwind spacing scale reaches content slotted into them.

- [#320](https://github.com/CSCfi/ui/pull/320) [`a5336a3`](https://github.com/CSCfi/ui/commit/a5336a339f8f94aacb526375057b3d683093ba60) Thanks [@razorfever](https://github.com/razorfever)! - The Tailwind theme export (`@cscfi/csc-ui/css/tailwind-theme.css`) maps the
  button variants' inverse tokens, so `text-inverse-secondary`,
  `text-inverse-success`, `text-inverse-info` and `text-inverse-warning` work in
  an app's own Tailwind build.

- [#320](https://github.com/CSCfi/ui/pull/320) [`b974ec7`](https://github.com/CSCfi/ui/commit/b974ec7454c888afbedfe9c1a712e9360b038d28) Thanks [@razorfever](https://github.com/razorfever)! - An inverted filled `c-button` or `c-icon-button` stays light under the pointer.
  Its hover was see-through, so on the dark backdrop an inverted button sits on,
  its label nearly vanished; the hovered white now takes a little of the
  variant's colour instead.

- [#320](https://github.com/CSCfi/ui/pull/320) [`7873b92`](https://github.com/CSCfi/ui/commit/7873b928ac92be0315082c4e50eb38839893f47e) Thanks [@razorfever](https://github.com/razorfever)! - In light mode, a filled primary, secondary or danger button keeps its white
  label at WCAG AA contrast while hovered: its hover fill darkens instead of
  lightening (`--c-primary-hover`, `--c-secondary-hover` and `--c-error-hover`
  moved to step 600). The label read as low as 2.5:1 on the lighter fill. The
  pickers' Done buttons, their selected cells and an active `c-tag` hover the
  same way.

- [#320](https://github.com/CSCfi/ui/pull/320) [`b47b065`](https://github.com/CSCfi/ui/commit/b47b065ee9ef34e9c0dad296a1e73cd44b805abf) Thanks [@razorfever](https://github.com/razorfever)! - A `danger` `c-menu-item` label meets WCAG AA contrast at rest, hovered and
  keyboard-highlighted, in both theme modes. It read as low as 3.6:1 before.

- [#320](https://github.com/CSCfi/ui/pull/320) [`4236ce4`](https://github.com/CSCfi/ui/commit/4236ce46e2349fec36f326abc3187f2285f6c5b2) Thanks [@razorfever](https://github.com/razorfever)! - Ghost, text and outlined buttons and `c-alert` read at WCAG AA on popovers,
  menus and the page canvas, not only on the page surface. Their tints were
  see-through, so a dark popover or the light `c-main` canvas showed through
  under the label (primary's ghost read 4.3:1 on a dark popover, a success
  alert's heading 4.3:1 on the light canvas). Each tint is now the colour mixed
  into the page surface, the same on any background, or, inside an alert's
  message or a `c-data-table` banner or selected row, into that container at half
  strength so a ghost or hovered button still stands out there. The accordion
  header, breadcrumb links, file-upload's choose button and `c-table`'s mobile
  rows follow.

- [#320](https://github.com/CSCfi/ui/pull/320) [`0978080`](https://github.com/CSCfi/ui/commit/097808097db323ec2b90c384600f81e9a61dc911) Thanks [@razorfever](https://github.com/razorfever)! - Secondary text, ghost and outlined buttons read at WCAG AA in dark mode on
  popovers and menus. Dark `--c-on-secondary-subtle` is a lighter pink
  (secondary-100), which read 4.35:1 on `--c-surface-overlay` before and now
  reads 6.7:1.

- [#320](https://github.com/CSCfi/ui/pull/320) [`c96277f`](https://github.com/CSCfi/ui/commit/c96277f505eddd6e2ac373eb1616044c4cda0ce9) Thanks [@razorfever](https://github.com/razorfever)! - A long tag in a `multiple` `c-select` or `c-autocomplete` ellipsises inside
  the field instead of widening it past a narrow screen, also when the page
  sizes the field from its content (a flex row or a grid column). In
  `c-select` it no longer pushes the clear button and chevron out of a
  fixed-width field.

- [#320](https://github.com/CSCfi/ui/pull/320) [`0ad8434`](https://github.com/CSCfi/ui/commit/0ad8434b23fdc03e3efc35764b03f6d698b4ad20) Thanks [@razorfever](https://github.com/razorfever)! - A hovered `c-side-navigation-item` keeps its white label at WCAG AA contrast in
  light mode: the hover fill (`--c-nav-surface-hover`) darkens instead of
  lightening. The label read 4.25:1 before.

- [#320](https://github.com/CSCfi/ui/pull/320) [`0ec50d7`](https://github.com/CSCfi/ui/commit/0ec50d728a391b509020889eba61c626f96d1fba) Thanks [@razorfever](https://github.com/razorfever)! - Highlighted rows and hovered controls meet WCAG AA contrast in dark mode.
  Where a component tints its background with primary on hover, focus or
  selection, its text now takes the tint's ink (`--c-on-primary-subtle`) instead
  of primary, which read 3.7:1. This covers the active option in `c-select`,
  `c-autocomplete` and `c-tree-select`, a hovered `c-menu-item`, the pickers'
  hovered and selected cells, a hovered `c-accordion-item` header, breadcrumb
  links, a sortable `c-data-table` header, `c-file-upload`'s choose button,
  `c-card`'s fullscreen button and a hovered `c-link`.

- [#320](https://github.com/CSCfi/ui/pull/320) [`947fb44`](https://github.com/CSCfi/ui/commit/947fb441b1170cbd8a6bda5517e8ee3268daa69e) Thanks [@razorfever](https://github.com/razorfever)! - `c-tree-select` shows a long value whole where the page has room. In a
  layout that sizes the field from its content, the field still takes the
  width of a `c-select` and grows past it only for a value that needs more,
  never past its container.

- [#320](https://github.com/CSCfi/ui/pull/320) [`c104548`](https://github.com/CSCfi/ui/commit/c1045484ee23b5e3916e64b2fb14e67529858c17) Thanks [@razorfever](https://github.com/razorfever)! - A long selection in `c-tree-select` ellipsises inside the field instead of
  widening it past a narrow screen, also when the page sizes the field from its
  content (a flex row or a grid column).

- [#320](https://github.com/CSCfi/ui/pull/320) [`f640461`](https://github.com/CSCfi/ui/commit/f64046161e8b85933e3053acfa893cebce951e8c) Thanks [@razorfever](https://github.com/razorfever)! - `c-tree-select` keeps the width of a `c-select` when the page sizes the field
  from its content (a flex row, a column aligned to the start), empty or
  holding any value. It was as narrow as its chevron while empty and changed
  width with each pick.

- [#320](https://github.com/CSCfi/ui/pull/320) [`b9b6a34`](https://github.com/CSCfi/ui/commit/b9b6a34b60298731e2fb0300b35f51788aa21c70) Thanks [@razorfever](https://github.com/razorfever)! - `c-tree-select` matches the width of a `c-select` in Safari too, where it
  came out a pixel wider.

## 4.0.0-rc.4

### Minor Changes

- [#318](https://github.com/CSCfi/ui/pull/318) [`ae56c6e`](https://github.com/CSCfi/ui/commit/ae56c6ece55a272f5b22bff03fe15479a864dabf) Thanks [@razorfever](https://github.com/razorfever)! - `c-button` and `c-icon-button` have a `variant` prop that sets the button's
  colour in every appearance: `primary` (the default), `secondary`, `success`,
  `info`, `warning` or `danger`. An app can change the default for every button
  with `applyDefaults({ 'c-button': { variant: 'secondary' } })`; the buttons the
  library draws inside its own components stay `primary`.

  ```html
  <c-button variant="danger">Delete</c-button>
  <c-button appearance="outlined" variant="success">Approve</c-button>
  ```

  The `danger` boolean attribute is deprecated: it keeps working until 5.0,
  `variant` wins when both are set, and it now colours the outlined, ghost and
  text appearances too. A pressed toggle button fills with its variant.

  The label of an outlined, ghost or text button is a darker teal in light mode
  and a lighter one in dark mode, so it meets WCAG AA contrast on its tint and
  hover; in dark mode it read 3.8:1 on hover.

### Patch Changes

- [#318](https://github.com/CSCfi/ui/pull/318) [`d95be1d`](https://github.com/CSCfi/ui/commit/d95be1d48a4d56c3fd9e74f22d867424ccfc24fb) Thanks [@razorfever](https://github.com/razorfever)! - In light mode, text on the success, info and warning fills is dark instead of
  white, so it meets WCAG AA contrast: `--c-on-success`, `--c-on-info` and
  `--c-on-warning` changed. This fixes the count on `c-badge` and on a
  `c-icon-button` badge, which read at 3.2:1.

## 4.0.0-rc.3

### Minor Changes

- [#316](https://github.com/CSCfi/ui/pull/316) [`d37b24b`](https://github.com/CSCfi/ui/commit/d37b24bff42edba1d3d3710b6aab76132970bf30) Thanks [@razorfever](https://github.com/razorfever)! - `c-button` and `c-icon-button` have an `appearance` prop: `filled` (the
  default), `outlined`, `ghost` or `text`. It replaces the `outlined`, `ghost`
  and `text` boolean attributes, which are deprecated: they keep working until
  5.0, and `appearance` wins when both are set.

  ```html
  <c-button appearance="outlined">Cancel</c-button>
  ```

- [#316](https://github.com/CSCfi/ui/pull/316) [`a2825e9`](https://github.com/CSCfi/ui/commit/a2825e94f7153f16c446f0243d5708caadb324b8) Thanks [@razorfever](https://github.com/razorfever)! - `c-card` has a `show-fullscreen` attribute for its fullscreen toggle button.
  It replaces `fullscreen`, which is deprecated and keeps working until 5.0;
  `show-fullscreen` wins when both are set.

- [#316](https://github.com/CSCfi/ui/pull/316) [`57a91a5`](https://github.com/CSCfi/ui/commit/57a91a5f21aa2bba573415acbdb7cf0c1c560c35) Thanks [@razorfever](https://github.com/razorfever)! - A deprecated prop is now marked as one wherever its name shows: in the
  editor completions (VS Code and JetBrains), in the TypeScript element types
  and the React wrappers (struck through), and on the documentation site. The
  note names the prop to use instead. A deprecated prop keeps working until the
  next major version.

- [#316](https://github.com/CSCfi/ui/pull/316) [`6e8ce6d`](https://github.com/CSCfi/ui/commit/6e8ce6d314ad43957e346898ebc730369b3db668) Thanks [@razorfever](https://github.com/razorfever)! - The form fields have a `hide-message` attribute, named after the `message`
  part it removes: the hint and error message under the field, and the room
  they keep. It replaces `hide-details`, which is deprecated and keeps working
  until 5.0; `hide-message` wins when both are set. This covers `c-text-field`,
  `c-number-field`, `c-select`, `c-autocomplete`, `c-tree-select`,
  `c-date-picker`, `c-time-picker`, `c-color-picker`, `c-file-upload`,
  `c-checkbox`, `c-radio-group` and `c-otp-input`. `applyDefaults()` takes
  `hideMessage` as well, and an element's own setting under either name beats
  an app default under either name. `c-pagination` and `c-progress-bar` keep
  `hide-details`, which hides their `details` part.

- [#316](https://github.com/CSCfi/ui/pull/316) [`71cc449`](https://github.com/CSCfi/ui/commit/71cc4493a9aa0237103d2587441b2268ae4aa618) Thanks [@razorfever](https://github.com/razorfever)! - `c-side-navigation-item` splits `active` into what it meant on each kind of
  item: `current` marks the item of the page you are on
  (`aria-current="page"`), and `expanded` shows a parent item's sub-items.
  `c-sub-navigation-item` takes `current` too. `active` is deprecated and keeps
  working until 5.0; the new ones win when set. Bind `current` from your
  router's current route; the side navigation writes `expanded` itself as
  parents open and close.

- [#316](https://github.com/CSCfi/ui/pull/316) [`64d6526`](https://github.com/CSCfi/ui/commit/64d652672d1ff4ade8496be565edf0994227da50) Thanks [@razorfever](https://github.com/razorfever)! - `c-slider` has a `tick-labels` attribute for the numbers under the track,
  next to `ticks`. It replaces `labels`, which is deprecated and keeps working
  until 5.0; `tick-labels` wins when both are set.

- [#316](https://github.com/CSCfi/ui/pull/316) [`4964cd2`](https://github.com/CSCfi/ui/commit/4964cd27b665f06c52496b6591089f38a6b8809d) Thanks [@razorfever](https://github.com/razorfever)! - `c-spinner` and `c-loader` have a `thickness` attribute for the stroke width
  in pixels, the name `c-progress-circle` already uses. It replaces `width`,
  which is deprecated and keeps working until 5.0; `thickness` wins when both
  are set.

- [#316](https://github.com/CSCfi/ui/pull/316) [`e60e849`](https://github.com/CSCfi/ui/commit/e60e849309874c637d2003d7b9d28d0b448445a2) Thanks [@razorfever](https://github.com/razorfever)! - `c-toasts` has a `position` attribute — `bottom`, `bottom-start`,
  `bottom-end`, `top`, `top-start` or `top-end`, the words the menus and
  popovers use — and a `contained` boolean that keeps the stack inside its
  nearest positioned ancestor. They replace `vertical` + `horizontal` and
  `absolute`, which are deprecated and keep working until 5.0; the new ones win
  when set.

  ```html
  <c-toasts position="top-end"></c-toasts>
  ```

## 4.0.0-rc.2

### Patch Changes

- [#314](https://github.com/CSCfi/ui/pull/314) [`5fd35a8`](https://github.com/CSCfi/ui/commit/5fd35a8d58b1f844858a93d43842f73b566ed04b) Thanks [@razorfever](https://github.com/razorfever)! - The `c-tabs` underline sits under the selected tab again. In 4.0.0-rc.1 it
  was shifted by the tab set's distance from the edge of the page. It also no
  longer stays under the previous tab when a tab is picked just after the tab
  set appears or resizes, or on an overflowing row with `disable-animation`.

## 4.0.0-rc.1

### Major Changes

- [#311](https://github.com/CSCfi/ui/pull/311) [`9e9ffb8`](https://github.com/CSCfi/ui/commit/9e9ffb8a20d22d66bad4a411830bf1982d570e4f) Thanks [@razorfever](https://github.com/razorfever)! - Fixes and clean-ups that change the API:

  - `target` defaults to `''` on `c-button` and `c-list-item`, as on a native
    `<a>`: an `href` opens in the same tab. Add `target="_blank"` where you
    relied on a new tab. Space on a `c-button` link now clicks it like Enter,
    instead of opening a new window.
  - `c-slider`'s `value`, `min`, `max`, `step` and `segments` are numbers, and
    its events carry numbers; `unit` defaults to no unit (add `unit="%"`).
  - `hidden` now hides any `c-*` element, as it hides any element.
  - `c-table`'s `updateMobileLabels()` is documented and typed.
  - `c-progress-bar`'s `label` names the progress bar for assistive technology.
  - `c-navigation-button` has an accessible name, "Menu" by default, set with
    `texts.label` (also as an app default).
  - `c-tabs`' overflow arrows are named, and `c-sub-navigation-item` no longer
    reads ", Current page" after the current item (`aria-current` says it).
  - `c-color-picker` no longer lists the unused `separator` part.

- [#311](https://github.com/CSCfi/ui/pull/311) [`9994f37`](https://github.com/CSCfi/ui/commit/9994f373702c3e0a011bf2fa3f479e181267e499) Thanks [@razorfever](https://github.com/razorfever)! - `c-data-table`:

  - `change:selected` carries the selected ids, `string[]` — the new
    `selected`, as a value event carries its value. The selected row objects
    are the new read-only `selectedRows` property.
  - `filter` (the client-side search string) is renamed `query`, so it no longer
    shares its name with `c-autocomplete`'s and `c-tree-select`'s `filter`
    predicate.

- [#311](https://github.com/CSCfi/ui/pull/311) [`aefa9de`](https://github.com/CSCfi/ui/commit/aefa9de53bec67f1047cb27f453d4f4b2cb8046e) Thanks [@razorfever](https://github.com/razorfever)! - `c-data-table` announces a sort (`aria-sort`, and the sorted column's tint)
  only on a `sortable` column: a `sort` naming another column sorts nothing, but
  was announced as sorted. `change:sort` is typed `CDataTableSort`, as it never
  carries `null`.

  The manifest, and the editor data built from it, no longer list a `sort`
  attribute on `c-data-table` (it takes an object; set the `sort` property), and
  list the `value` attributes of `c-date-picker`, `c-time-picker` and
  `c-tree-select` as the string (or number) they take.

- [#311](https://github.com/CSCfi/ui/pull/311) [`4fc6389`](https://github.com/CSCfi/ui/commit/4fc6389516c8be7614ace3fe9d47d1e4658526d2) Thanks [@razorfever](https://github.com/razorfever)! - Names that now follow the library's glossary:

  - `c-alert`: `dismissible` → `closeable`, the `dismiss` event → `close`
    (`onClose` in React) and the `dismiss` part → `close`, as on every other
    closeable component. `type` drops `'default'`: leave it unset for the
    neutral look, as on `c-status`. `CAlertIconType` is no longer exported.
  - `c-accordion-item`: the `header` slot → `heading`, like the `heading` prop.
    A leftover `slot="header"` renders nothing.
  - `c-loader`: `contentdelay` (seconds) → `content-delay` (milliseconds):
    `contentdelay="1"` becomes `content-delay="1000"`.
  - `c-data-table`: the `selectAllItems` text → `selectAllRows`.

- [#311](https://github.com/CSCfi/ui/pull/311) [`67a3e09`](https://github.com/CSCfi/ui/commit/67a3e0960a958aef32a343496ad3d589ecdbf295) Thanks [@razorfever](https://github.com/razorfever)! - `c-input` and `c-dropdown` are no longer public API (ADR-0075). They are the
  pieces the form fields and `c-select` build themselves from, and consumers never
  author them. They still register, but they are left out of
  `custom-elements.json`, the IDE data and the element types (`CInputElement`,
  `CDropdownElement`), and `@cscfi/csc-ui-react` no longer exports `CInput`. The
  manifest names them in `csc.internalTags`.

- [#311](https://github.com/CSCfi/ui/pull/311) [`ba39ece`](https://github.com/CSCfi/ui/commit/ba39ece821d0ca411780b125109aa7e8ac90952a) Thanks [@razorfever](https://github.com/razorfever)! - The events composed children send only to their parent are no longer public
  API (ADR-0075): `c-tab`'s `tabChange` and `tabFocus`, `c-tab-buttons`'
  `tabChange`, `c-tab-item`'s `contentChange`, `c-accordion-item`'s
  `item-change` and `c-radio`'s `change`. They have lowercase internal names now,
  stop at the parent, and are left out of `custom-elements.json`, the element
  types and the React wrapper (`onTabChange`, `onTabFocus`, `onContentChange`,
  `CAccordionItem`'s `onItemChange`, `CRadio`'s `onChange`). Listen on the
  parent: `c-tabs`, `c-accordion` and `c-radio-group` report the value.
  `c-select` no longer lets its inner list's `selectOption` and
  `dropdownStateChange` reach the page.

  Fixed: toggling an item of an accordion nested inside another accordion's item
  no longer changes the outer accordion's value too.

- [#311](https://github.com/CSCfi/ui/pull/311) [`980729e`](https://github.com/CSCfi/ui/commit/980729ecc991f3363fc310c5e489a82185726a74) Thanks [@razorfever](https://github.com/razorfever)! - Props, slots and methods that only a parent component sets or calls are now
  internal (ADR-0075): they leave the manifest, the IDE data, the element types
  and the React wrapper, and no release promises anything about them.

  - `c-tab` `active`, `c-tab-item` `active`, `c-tab-items` `value` and
    `disable-animation`, and `c-tab-buttons` `value`: `c-tabs` sets them from its
    own `value` and `disable-animation`. `c-tab` loses `host-id`, `position` and
    `setsize`; a plain `id` on a tab or a panel now stays, where `c-tabs` used to
    replace it.
  - `c-accordion-item` `expanded`, `collapsable` and `outlined`: `c-accordion`
    sets them. Style an expanded item with `c-accordion-item:state(expanded)`.
  - `c-step` `current` and `complete` (`c-steps` sets them from its `value`),
    `c-list-item` `disabled-by-parent`, `c-list-item-title` `active`, `c-button`
    `no-ripple`, and `focusable` on `c-side-navigation-item` and
    `c-sub-navigation-item`.
  - The slots a component assigns its own children to: `c-breadcrumb` `first`
    and `folded`, `c-side-navigation-item` `sub-item`.
  - `c-menu-item`'s `openSubmenu()`, `closeSubmenu()` and `isSubmenuOpen()`.

  The package entry no longer exports the `C*Props` types (use the `C*Element`
  types), `migratedTags` or `tailwindVariantTags`.

- [#311](https://github.com/CSCfi/ui/pull/311) [`7b75a71`](https://github.com/CSCfi/ui/commit/7b75a71c915da1e83dcdf6591c18e56498862fcd) Thanks [@razorfever](https://github.com/razorfever)! - `c-menu-item` says what it is instead of reading a three-state `active`:
  `type="radio"` makes it one choice of several, `checked` marks the current
  one (a check mark and `aria-checked`), and the default `type="command"` is a
  plain item that never shows a check. The `icon` prop (an SVG path) becomes
  an `icon` slot, so put a `<c-icon slot="icon">` there; `active-icon` is
  removed. `c-menu`'s `select` detail is typed `{ value: string | undefined }`.

- [#311](https://github.com/CSCfi/ui/pull/311) [`24fe47a`](https://github.com/CSCfi/ui/commit/24fe47a4006826c8c843e9f24fba844e0c6d03f8) Thanks [@razorfever](https://github.com/razorfever)! - Escape closes every `c-modal` again, as in 3.x and as on a native dialog.
  `dismissable` now governs only the backdrop click: a non-dismissable modal
  still nudges when the backdrop is clicked, but no longer when Escape is
  pressed. Any modal can therefore close itself: a page that sets `value`
  one way (`:value="open"`) must also listen for `change` or use `v-model`,
  or its state stays open and setting it to `true` again does nothing.

- [#311](https://github.com/CSCfi/ui/pull/311) [`948d91c`](https://github.com/CSCfi/ui/commit/948d91c7949ff24ec01c56d7ab198adb785a8c00) Thanks [@razorfever](https://github.com/razorfever)! - No boolean prop defaults to `true` any more (ADR-0076), so markup can set
  every one of them: an absent attribute means `false`.

  - `valid` is renamed `invalid`, with the opposite meaning, on every field,
    `c-checkbox`, `c-radio-group`, `c-otp-input`, `c-message` and
    `c-file-upload`: `:valid="!error"` becomes `:invalid="!!error"`, and a bare
    `invalid` attribute now shows the error, where `valid="false"` showed none.
    A leftover `valid` is ignored.
  - `c-loader`'s `visible` is renamed `hide` (its 3.x name), with the opposite
    meaning; its `show()` and `hide()` methods are removed — set `hide`.

- [#311](https://github.com/CSCfi/ui/pull/311) [`cdcc47f`](https://github.com/CSCfi/ui/commit/cdcc47fbdba9cbc918a632a3cd8f90939b11e1a4) Thanks [@razorfever](https://github.com/razorfever)! - `c-pagination`'s value is `{ itemCount, page, pageSize, … }`, matching
  `c-data-table`: `currentPage` is `page` and `itemsPerPage` is `pageSize`. The
  pagination no longer writes into your object; each pick emits a new value with
  `startFrom` and `endTo`, and nothing is emitted at mount or when you set
  `value`.

  `textOverrides` is replaced by a `texts` prop (`CPaginationTexts`), which works
  as an app default too: `pageSize`, `previousPage`, `nextPage`,
  `range(start, end, count)`, `page(page, pageCount)` and `pagination`, the
  landmark's name. `c-data-table`'s `texts` takes the same keys for its
  pagination.

  The page-size menu's `select` no longer reaches the page.

  The ellipsis between runs of page buttons is hidden from assistive
  technology: it was a focusable separator.

- [#311](https://github.com/CSCfi/ui/pull/311) [`b20fe9d`](https://github.com/CSCfi/ui/commit/b20fe9d4a95686fa12e0ddc2126e2aa49709760f) Thanks [@razorfever](https://github.com/razorfever)! - Parts renamed to the library's vocabulary, so a `::part()` rule reads the
  same across components:

  - A list row is `option` on `c-select`, `c-autocomplete` and
    `c-tree-select` (was `item`), as on the pickers.
  - `c-select`'s panel is `panel` and `card` (was `menu`), as on the other
    value fields: a `::part(card)` rule now styles every field's panel.
  - `c-checkbox`: the label text is `label`, as on `c-switch` (was
    `content`); the row around box and text has no part.
  - `c-color-picker`: `color-chip` → `value-color`.
  - `c-login-button`: `title` → `label`.
  - `c-menu-item`: `submenu` → `submenu-list`, beside `submenu-panel`.
  - `c-side-navigation-title`: `label` → `heading`.
  - `c-time-picker`: `end-tab` → `end`.

- [#311](https://github.com/CSCfi/ui/pull/311) [`4aee2cd`](https://github.com/CSCfi/ui/commit/4aee2cd7a9d4ac11cd1fc18cf51f1b9002c17c79) Thanks [@razorfever](https://github.com/razorfever)! - The attribute names 3.x markup used work again (they had been replaced
  during the alphas, so 3.x markup stopped reaching the component silently):

  - `autofocus` on `c-text-field` and `c-otp-input` (was `has-autofocus` on
    `c-otp-input`; `c-text-field` had none).
  - `autocapitalize` on `c-text-field` (was `automatic-capitalize`).
  - `name` on `c-checkbox` and `c-slider` (was `host-name`).
  - `aria-label` on `c-slider` names its range input (`aria-label-internal` is
    removed, and no longer shows up in the visible label).

  `host-id` (on every field, `c-button`, `c-checkbox`, `c-switch` and
  `c-slider`) and `element-id` (`c-otp-input`) are removed: an id inside a
  component's shadow root cannot be reached from your page's `for` or `aria-*`.
  An `id` stays on the element itself, as on any element; `c-otp-input` no
  longer overwrites it. `c-message`'s unused `input-id` and `c-otp-input`'s
  undocumented `reset()` are removed.

- [#311](https://github.com/CSCfi/ui/pull/311) [`1aa4ac9`](https://github.com/CSCfi/ui/commit/1aa4ac94acbf766d7623919cb700127365a817e9) Thanks [@razorfever](https://github.com/razorfever)! - `c-side-navigation`'s `menu-visible` is renamed `open`, and
  `change:menu-visible` is `change:open` (`onChangeOpen` in React). It now fires
  whenever the user opens or closes the drawer: a `c-navigation-button`, the
  close button, the backdrop, or activating an item, which closes the drawer.
  Enter on a `c-navigation-button` opens the drawer again; it used to toggle it
  twice.

  Inline-style props are removed (ADR-0006): `c-side-navigation`'s `styles` and
  `c-link`'s `weight`. Restyle through `::part()`, e.g.
  `c-link::part(root) { font-weight: 400; }`.

- [#311](https://github.com/CSCfi/ui/pull/311) [`ab62239`](https://github.com/CSCfi/ui/commit/ab622392c5424ba978cbd242171bd01627f297ed) Thanks [@razorfever](https://github.com/razorfever)! - `c-side-navigation-item` fires `select` instead of `itemChange` when it is
  activated (ADR-0075), as `c-menu` does: the detail is `{ value }`, from the
  item's new `value` prop, instead of the originating DOM event. In React,
  `onItemChange` becomes `onSelect`.

  `c-sub-navigation-item` gains the same `value` prop and `select` event, so a
  sub-item no longer needs `click` and `keyup` listeners. Both events bubble, so
  one `select` listener on `c-side-navigation` can route every item. An item
  nested in another item's sub-items no longer stops its event from reaching the
  page.

- [#311](https://github.com/CSCfi/ui/pull/311) [`e3b90a9`](https://github.com/CSCfi/ui/commit/e3b90a99c3694db48e4d4a25ca203ac2cc79f19f) Thanks [@razorfever](https://github.com/razorfever)! - `texts` keys renamed after what they name:

  - `c-number-field`: `increase` / `decrease` → `stepUp` / `stepDown`, as its
    `step-up` / `step-down` parts.
  - `c-tree-select`: `select` → `selectBranch` (the select-branch row) and
    `step` → `levelCounter`.
  - `c-file-upload`: `waiting` → `queued` (the row's status) and `dismiss` →
    `close` (a rejected row's close button), whose default now reads
    "Close …".

- [#311](https://github.com/CSCfi/ui/pull/311) [`ffe2644`](https://github.com/CSCfi/ui/commit/ffe2644d8307b9043dc30d2496ba10a6f5dcf551) Thanks [@razorfever](https://github.com/razorfever)! - `c-toast` is internal: `c-toasts` renders one for each `addToast()` message,
  so it has no docs page, element type or React component of its own any more
  (ADR-0075). What it offered moves to `c-toasts`:

  - A toast's parts are forwarded as `toast-root`, `toast-item`, `toast-badge`,
    `toast-content`, `toast-close`, `toast-custom` and `toast-progress`, so
    `c-toasts::part(toast-root)` styles every toast. The close button's part is
    `close` (it was `dismiss`).
  - `c-toasts` fires `close` once a toast has left, carrying its message.
  - `addToast()` returns the message's `id`, the one `removeToast()` takes,
    and generates one when the message has none.

  A message's `title` is renamed `heading` (`CToastMessage.heading`). A plain
  JavaScript message that still sets `title` shows no heading.

- [#311](https://github.com/CSCfi/ui/pull/311) [`ce1432d`](https://github.com/CSCfi/ui/commit/ce1432d78528336c041103b3915422a548a38df9) Thanks [@razorfever](https://github.com/razorfever)! - Tokens that nothing should depend on are removed:

  - the `ring` semantic role (`--c-ring` and the `ring-*` colour utility); no
    component painted it;
  - the Stencil-era `--c-text-dark`, `--c-text-light`, `--c-text-body`,
    `--c-text-system` and `--c-transparent`. Use the semantic roles, such as
    `--c-on-surface` and `--c-on-surface-muted`, which follow dark mode.
    `c-pagination` and `c-navigation-button`, which still used
    `--c-text-system`, now use `on-surface-muted`, so their text reads in dark
    mode too.

  `c-icon`'s `--c-icon-color` hook is private (`--_c-icon-color`), as every
  per-component custom property is (ADR-0006): recolour an icon with its `color`
  or through `::part(root)`.

- [#311](https://github.com/CSCfi/ui/pull/311) [`4898c0d`](https://github.com/CSCfi/ui/commit/4898c0db37dcf4848ff906c95897fde81b90db4a) Thanks [@razorfever](https://github.com/razorfever)! - Type changes:

  - `CPlacement` is split into `CMenuPosition`, `CPopoverPosition` and
    `CTooltipPosition`, each owned by its component; the unions are the same.
  - The package-level types take the `C` prefix every other exported type has:
    `CFamily`, `CThemeSeeds`, `CThemeMode`, `CAppDefaults`, `CDefaultableTag`,
    `CChartAnatomy` and `CChartSlots`.
  - `c-accordion`'s value type is exported as `CAccordionValue`.
  - Numbers that took `number | string` are `number`: `distance` on `c-menu`,
    `c-popover` and `c-tooltip`, `c-tooltip`'s `delay` and `c-steps`' `value`.
    Attributes still work (`value="3"` reads as `3`).
  - `c-progress-circle`'s `width` is renamed `thickness`.

- [#311](https://github.com/CSCfi/ui/pull/311) [`8bab4d4`](https://github.com/CSCfi/ui/commit/8bab4d4d1d2358cb8a91e0e3821694800ccd8f55) Thanks [@razorfever](https://github.com/razorfever)! - Every value control reports through one set of events with native `<input>`
  timing (ADR-0075). `changeValue` and its `change-value` twin are gone from
  `c-accordion`, `c-autocomplete`, `c-checkbox`, `c-modal`, `c-otp-input`,
  `c-pagination`, `c-radio-group`, `c-select`, `c-slider`, `c-switch`, `c-tabs`
  and `c-text-field`, and with them the React wrapper's `onChangeValue`.

  - `input` (no detail) and `update:value` (the value) fire on every value
    change, `change` (the value) on every commit: Enter or leaving the field for
    typed text, each pick or toggle, each arrow-key step, the release that ends a
    drag. A commit with nothing changed since the last one fires nothing.
  - `change` now carries the value on `c-text-field`, `c-checkbox`, `c-switch`
    and `c-autocomplete`, and no longer bubbles out of the component.
  - `c-number-field`'s `change` fires on commit instead of on every keystroke,
    and `c-slider`'s once on release instead of on every move. Listen for
    `update:value` (or `onUpdateValue` in React) to follow every change.
  - `c-otp-input`'s value is the digits entered so far everywhere — the `value`
    property, `update:value` and `change` — and `''` when empty; the `value`
    property used to read `null` until the code was complete. A set `value` of
    `''` now clears the digits, and `completion` is typed `string`.

  Vue templates bind `v-model`, `@input` reading the element's `value`, or
  `@change`; they cannot hear `update:value`.

  Fixed: `c-modal` sent its value events twice for every dismissal, and also for
  a `value` set to `false` by the page. `c-tabs` sent them twice for Enter on a
  tab, and now sends nothing when the current tab is activated again.

- [#311](https://github.com/CSCfi/ui/pull/311) [`d9d7177`](https://github.com/CSCfi/ui/commit/d9d717737cc041903ce31a272d9f74e212ed6ce2) Thanks [@razorfever](https://github.com/razorfever)! - Value controls announce only what the user does (ADR-0075):

  - `<c-option selected>` sets the initial value of `c-select` and
    `c-autocomplete` once, only while the value is empty, and without a value
    event. `c-select` used to emit on every change to its options and override
    a bound value. With a bound value, initialise the model instead.
  - `reset()` is removed from `c-select` and `c-autocomplete`: it announced a
    value set from code. Set `value` to `null` (`[]` with `multiple`).
  - `c-checkbox` and `c-switch` hold one state: `value` is it, and `checked` is
    its boolean view. Setting `checked` sets `value` to `true-value` or
    `false-value`, setting `value` updates `checked`, and a bound `value` wins
    over a `checked` attribute. `value` has no built-in default any more.
  - The `''` a plain Vue `v-model` writes for an empty model no longer checks a
    `c-checkbox` or `c-switch`.

### Minor Changes

- [#311](https://github.com/CSCfi/ui/pull/311) [`3cd86e3`](https://github.com/CSCfi/ui/commit/3cd86e37d513eab05c28a334308634c9c64c172f) Thanks [@razorfever](https://github.com/razorfever)! - `aria-labelledby`, `aria-describedby`, `aria-controls` and the other ARIA
  attributes that point at elements by id now work on the components. They did
  nothing before: each component now hands the elements the ids name to its
  control (a field's input, a button, a dialog, a tablist, a landmark). `c-modal`
  and `c-popover` can be named by `aria-labelledby` pointing at a title in their
  content. Without a `label`, `c-button-group` and `c-tags` become a named group
  when `aria-label` or `aria-labelledby` is set.

- [#311](https://github.com/CSCfi/ui/pull/311) [`17d17a7`](https://github.com/CSCfi/ui/commit/17d17a7bf1925174f5d4acd4b4dfd45639784e2f) Thanks [@razorfever](https://github.com/razorfever)! - `c-card-title` and `c-login-card-title` are headings, so cards appear in the
  page's heading outline; they were plain text to assistive technology. The new
  `heading-level` (1 to 6, default 2) sets the level that fits where the cards
  sit, such as 3 inside a section headed by an `h2`. Their look is unchanged.

- [#311](https://github.com/CSCfi/ui/pull/311) [`0dcdad8`](https://github.com/CSCfi/ui/commit/0dcdad80e16e642c91b421d39dfd4ec116da12cb) Thanks [@razorfever](https://github.com/razorfever)! - `c-data-table` accessibility fixes:

  - A row's checkbox and expander are named after the row ("Select Aurora",
    "Details of Aurora", from its value in the first visible column) instead of
    one "Select row" and "Toggle row expansion" for every row. `texts.selectRow`
    and `texts.expandRow` also take a function of that value; a string still
    names every row alike.
  - The select-all banner's message is announced, the first one included.
  - The table is `aria-busy` while `loading`.

- [#311](https://github.com/CSCfi/ui/pull/311) [`20d0836`](https://github.com/CSCfi/ui/commit/20d0836bc6e0c72c8d9c9c48fded9696d9af55eb) Thanks [@razorfever](https://github.com/razorfever)! - `focus()` on a form control now focuses it. The element renders no box of
  its own, so calling `focus()` on a field, `c-checkbox`, `c-switch`,
  `c-slider`, `c-radio-group`, `c-button-group`, `c-otp-input` or
  `c-file-upload` did nothing; each now focuses its input or combobox, its
  checked radio or selected button, its first digit box or its drop zone. After
  a failed submit, an app can move focus to the first invalid field, and a
  screen reader reads its error message.

- [#311](https://github.com/CSCfi/ui/pull/311) [`161b9eb`](https://github.com/CSCfi/ui/commit/161b9eb2d24b1b99ce4f25dc55ee8d67711bee63) Thanks [@razorfever](https://github.com/razorfever)! - `c-otp-input` tells assistive technology about its state: `required` marks
  every digit box `aria-required` and `invalid` every box `aria-invalid`, and
  each box is described by the hint or error message. The message is styleable
  as `::part(message)`.

- [#311](https://github.com/CSCfi/ui/pull/311) [`35e64b0`](https://github.com/CSCfi/ui/commit/35e64b00118507f7ae6c7e1b9d0cf0e517d10f1c) Thanks [@razorfever](https://github.com/razorfever)! - The React `CCardTitle` and `CLoginCardTitle` take `headingLevel`.

- [#311](https://github.com/CSCfi/ui/pull/311) [`527b77a`](https://github.com/CSCfi/ui/commit/527b77a28071bffa6769acc5d8641a3966d69b3d) Thanks [@razorfever](https://github.com/razorfever)! - Toasts can be swiped away (ADR-0073). Drag a toast left or right with a mouse,
  finger or pen and let go past a third of its width, or flick it, to dismiss it
  as its dismiss button does; a shorter drag springs back, and a vertical drag
  still scrolls the page. Only toasts with a dismiss button can be swiped, so
  custom and indeterminate toasts are unchanged. Pressing a toast now pauses its
  timer the way hovering does, so touch users can hold a toast up while they read
  it. When a toast arrives or leaves, the others in `c-toasts` glide to their new
  places instead of jumping. Under reduced motion the toast still follows the
  pointer, but a dismissed toast fades where it was let go and the stack moves in
  one step.

- [#311](https://github.com/CSCfi/ui/pull/311) [`ee79afb`](https://github.com/CSCfi/ui/commit/ee79afbfec25bcfd5afc6e9e1039de7b546a7a3f) Thanks [@razorfever](https://github.com/razorfever)! - The manifest, the IDE data and the element docs list a `value` attribute on
  `c-select`, `c-autocomplete`, `c-accordion` and `c-button-group`, typed with
  its string and number form (`value="fi"`). The attribute always worked, as it
  did in 3.x, but went undocumented because the property also takes objects and
  arrays.

### Patch Changes

- [#311](https://github.com/CSCfi/ui/pull/311) [`9026190`](https://github.com/CSCfi/ui/commit/902619062d39587e77d7369e588594d201d772ba) Thanks [@razorfever](https://github.com/razorfever)! - `c-accordion` sets up items added after it mounts: an item the `value` names
  opens, and `outlined` reaches it. In a `multiple` accordion a single `value`
  counts as the first expanded item instead of being dropped at the first toggle.

- [#311](https://github.com/CSCfi/ui/pull/311) [`c0421b9`](https://github.com/CSCfi/ui/commit/c0421b9ba4dbd13c1f35b93f5ad0d1b4027825da) Thanks [@razorfever](https://github.com/razorfever)! - A `c-alert` without a `type` no longer shows an icon. Only the four status
  types (`error`, `info`, `success`, `warning`) have one; the neutral alert keeps
  its brand-primary colours and accent edge.

- [#311](https://github.com/CSCfi/ui/pull/311) [`63b6bae`](https://github.com/CSCfi/ui/commit/63b6bae50f37af0a930a67282d1c264e7188cc52) Thanks [@razorfever](https://github.com/razorfever)! - Each `c-breadcrumb-item` is a list item of its breadcrumb's list (and of the
  fold panel's list), so assistive technology hears the crumbs as a list with
  their count; the list item used to sit inside the crumb, out of the list's
  reach.

- [#311](https://github.com/CSCfi/ui/pull/311) [`195b86b`](https://github.com/CSCfi/ui/commit/195b86ba9e18d7586515258e29034ced61c56781) Thanks [@razorfever](https://github.com/razorfever)! - `<c-button type="submit">` submits the form around it again, and
  `type="reset"` resets it, as they did in 3.x; in 4.x alphas neither did
  anything, since the native button inside the component belongs to no form.

- [#311](https://github.com/CSCfi/ui/pull/311) [`0f68a7f`](https://github.com/CSCfi/ui/commit/0f68a7ff23e31fbab9aa49aad90a2090859220db) Thanks [@razorfever](https://github.com/razorfever)! - `c-card` fixes for `fullscreen` cards:

  - `c-card-title` keeps its text and `actions` clear of the fullscreen toggle,
    which used to cover the last 32px of the actions.
  - `exitFullscreen()` and the toggle end only the card's own fullscreen; they
    used to end whatever element was fullscreen.

- [#311](https://github.com/CSCfi/ui/pull/311) [`fcca2f7`](https://github.com/CSCfi/ui/commit/fcca2f7a34169c20e03b631a7fe7c964101529da) Thanks [@razorfever](https://github.com/razorfever)! - `c-card-content` and `c-login-card-content` no longer nest a second
  `<article>` inside the card's, and the `c-card-actions` and
  `c-login-card-actions` rows are no longer announced as lists of actions they
  did not contain as list items.

- [#311](https://github.com/CSCfi/ui/pull/311) [`ebbbc0c`](https://github.com/CSCfi/ui/commit/ebbbc0c4e1fb515a2abc1397e6b3ca2f131401c2) Thanks [@razorfever](https://github.com/razorfever)! - A click or Space on an indeterminate `c-checkbox` now clears `indeterminate`
  and toggles the checkbox, as on a native checkbox. Before, the bar stayed and
  screen readers kept announcing "mixed" until the page cleared the property,
  even though the checkbox had changed. `indeterminate` reads `false` by the
  time `change` fires. A binding writes it only when its value changes, so when a
  click leaves the options partly checked, set the element's `indeterminate` in
  your `change` handler.

- [#311](https://github.com/CSCfi/ui/pull/311) [`0885ed5`](https://github.com/CSCfi/ui/commit/0885ed53e2186716930294f203472d5b3cbc9560) Thanks [@razorfever](https://github.com/razorfever)! - An `aria-label` (and any other ARIA attribute) on `c-checkbox`, `c-switch`,
  `c-radio` or `c-progress-bar` reaches the native control inside: it used to
  land on a wrapper or be dropped, leaving the control unnamed. Every other
  attribute stays where it was.

- [#311](https://github.com/CSCfi/ui/pull/311) [`cb16cd4`](https://github.com/CSCfi/ui/commit/cb16cd4a93425e2f025da3f9e519d1b243755b7e) Thanks [@razorfever](https://github.com/razorfever)! - `c-csc-logo` is an image named "CSC"; it was named by its file title,
  "CSC_logo_no_tagline". An `aria-label` on the element names it instead.

- [#311](https://github.com/CSCfi/ui/pull/311) [`3a54c7e`](https://github.com/CSCfi/ui/commit/3a54c7e3e8bdc30797782e9d12ac4fddda3211be) Thanks [@razorfever](https://github.com/razorfever)! - A component's methods and read-only properties (`startUploads()`,
  `unmaskedValue`, `badInput`, …) keep working after its element leaves the page
  and comes back, as under Vue's `<KeepAlive>` or in a reordered list. They
  went on reaching the first, unmounted instance (a stale value, a method that
  did nothing), and Vue logged an "already exists" warning for each.

- [#311](https://github.com/CSCfi/ui/pull/311) [`1083659`](https://github.com/CSCfi/ui/commit/108365905e90cfc83d55bbdaca3ff7c858f8d806) Thanks [@razorfever](https://github.com/razorfever)! - An `aria-label` on a field without a visible `label` names its input.
  `c-text-field`, `c-number-field`, `c-select`, `c-autocomplete`,
  `c-tree-select` and `c-color-picker` without one (a search field, say) had an
  unnamed input, and the date and time pickers read "Choose date" / "Choose
  time". The element's other ARIA attributes (such as `aria-description`) reach
  the input too.

- [#311](https://github.com/CSCfi/ui/pull/311) [`23e6be6`](https://github.com/CSCfi/ui/commit/23e6be6d33c9a783a69fd6e6519ad2d0341b1858) Thanks [@razorfever](https://github.com/razorfever)! - `c-text-field` and `c-number-field` name their input from `label`, as the
  other fields do. The visible label's `for` cannot reach an input in another
  shadow root, so assistive technology announced these fields without a name.

- [#311](https://github.com/CSCfi/ui/pull/311) [`2e2b4a4`](https://github.com/CSCfi/ui/commit/2e2b4a4e83bf0e7f9ff5d97088dedcb8e7845a16) Thanks [@razorfever](https://github.com/razorfever)! - A field with a visible `label` is named by it even when the element also has
  an `aria-label`, so its accessible name always matches the text on screen (a
  voice-control user can say the label). The `aria-label` names only a field
  without a `label`.

- [#311](https://github.com/CSCfi/ui/pull/311) [`b3cdd75`](https://github.com/CSCfi/ui/commit/b3cdd75103919f2651dea38b65825338b4e740b0) Thanks [@razorfever](https://github.com/razorfever)! - Screen readers read a control's hint and error message with it. The form
  fields, `c-checkbox`, `c-radio-group` and `c-file-upload` showed the text
  below the control but never linked it, so it was announced only to someone
  reading the page line by line; the control is now described by it
  (`aria-describedby`). The fields also gain a `message` part for that text,
  which `::part(message)` styles.

- [#311](https://github.com/CSCfi/ui/pull/311) [`7ef0950`](https://github.com/CSCfi/ui/commit/7ef09509787f302a5786ff49fcfb2c9f7b2cc7b5) Thanks [@razorfever](https://github.com/razorfever)! - ARIA attributes set on a component now reach its inner element under their
  own names. Before, an attribute whose DOM property is not spelled like its
  name arrived mangled: `aria-haspopup` on `c-icon-button` (and on the date,
  time and colour pickers' buttons) became a meaningless `ariahaspopup`, and
  `aria-label` on `c-icon` never named the icon. A `c-icon` with an
  `aria-label` is now an image with that name, and `c-link` forwards ARIA
  attributes and `rel`, `download`, `hreflang`, `ping`, `referrerpolicy` and
  `type` to its link.

- [#311](https://github.com/CSCfi/ui/pull/311) [`d6253fe`](https://github.com/CSCfi/ui/commit/d6253febb5dea5f64a865d952559bb8fc9059523) Thanks [@razorfever](https://github.com/razorfever)! - ARIA attributes that hold element ids (`aria-controls`, `aria-labelledby`,
  `aria-describedby`, `aria-owns`, `aria-activedescendant`, `aria-details`,
  `aria-errormessage`, `aria-flowto`) stay on the component you set them on.
  Copied onto the element inside it, they pointed at nothing, since an id inside
  a component cannot reach your page's elements.

- [#311](https://github.com/CSCfi/ui/pull/311) [`b73ba04`](https://github.com/CSCfi/ui/commit/b73ba048f38129b171a0f8bb83afd6ac2bdaeb0d) Thanks [@razorfever](https://github.com/razorfever)! - `data-*` attributes set on a component stay on the component: they are no
  longer copied onto the element inside it, so a selector such as
  `[data-test="save"]` (in Playwright, which looks inside shadow roots too)
  matches the component alone.

- [#311](https://github.com/CSCfi/ui/pull/311) [`5eaa4c8`](https://github.com/CSCfi/ui/commit/5eaa4c880ef431be047ab1b8389f7895b152ab22) Thanks [@razorfever](https://github.com/razorfever)! - A disabled `c-icon-button` dims its icon in dark mode as a disabled `c-button`
  does; it used the bright hint-text colour, so it looked enabled there.

- [#311](https://github.com/CSCfi/ui/pull/311) [`09a6aa2`](https://github.com/CSCfi/ui/commit/09a6aa28f7fc944a818d5a1ed79e0f295fed5581) Thanks [@razorfever](https://github.com/razorfever)! - A `loading` `c-icon-button` is announced as busy and unavailable
  (`aria-busy`, `aria-disabled`), and keeps its slotted content in place, hidden
  visually: visually hidden text that names the button no longer disappears
  while it loads.

- [#311](https://github.com/CSCfi/ui/pull/311) [`529ea29`](https://github.com/CSCfi/ui/commit/529ea29065a1562cf5fee80e071ee5576676872e) Thanks [@razorfever](https://github.com/razorfever)! - `c-list-item` accessibility fixes:

  - Enter and Space press a `ripple` item, firing `click` as a mouse click does;
    they used to play the ripple only.
  - A link item (`href`) shows the focus ring on its link.
  - `active` is announced as the current item (`aria-current`).
  - A `disabled` link item stops being a link, so Tab no longer reaches it; the
    item no longer carries `aria-disabled`.

- [#311](https://github.com/CSCfi/ui/pull/311) [`1badac5`](https://github.com/CSCfi/ui/commit/1badac566811e626859992e6ad0316f2ef3a5dc6) Thanks [@razorfever](https://github.com/razorfever)! - `c-login-button` without an `href` is a native button, which Enter and Space
  press; it used to be a focusable link with no `href` that Enter did not
  activate. With an `href` it is a link, as before.

- [#311](https://github.com/CSCfi/ui/pull/311) [`a4a4ba4`](https://github.com/CSCfi/ui/commit/a4a4ba4364f86c562ebba2640decd692f0af8fe2) Thanks [@razorfever](https://github.com/razorfever)! - `c-login-card` shows an image whose `src` contains parentheses, quotes or
  spaces, as a data URI often does; such an image used to be dropped.

- [#311](https://github.com/CSCfi/ui/pull/311) [`acb5fd3`](https://github.com/CSCfi/ui/commit/acb5fd3e7fcebe542868de0075bc8a99cda8a7bc) Thanks [@razorfever](https://github.com/razorfever)! - `input` now fires once per value change. A native `input` from inside a
  component no longer reaches the page beside the component's own: a text or
  number field sent two per keystroke, and the date, time and colour pickers
  sent one per keystroke although their value changes only when the typed text
  is committed. Inputs of your own slotted into a component reach the page as
  before.

- [#311](https://github.com/CSCfi/ui/pull/311) [`d839916`](https://github.com/CSCfi/ui/commit/d8399164c24096d923057d35029a0c7c83c9219a) Thanks [@razorfever](https://github.com/razorfever)! - `c-otp-input` fixes:

  - `hide-details` hides the hint and the error message.
  - Clearing a box in the middle ends the value there; the digits after it no
    longer move up into its place in the value.
  - Only digits are taken: a typed space, and a pasted `1e5`, `0x1F`, `-12` or
    `1.5`, are no longer accepted. Spaces and line breaks around a pasted code
    are skipped.
  - Changing `length` after the field mounts lays out the new number of boxes.
  - The field no longer adds or removes an `error` class on the element, which
    removed a class of that name you had set yourself.

- [#311](https://github.com/CSCfi/ui/pull/311) [`19e3eda`](https://github.com/CSCfi/ui/commit/19e3eda99944274dedaac806619b99cabce3891e) Thanks [@razorfever](https://github.com/razorfever)! - `c-page`'s `scroll-indicator` shows above a pinned `c-toolbar` inside
  `c-main`; the toolbar used to cover it.

- [#311](https://github.com/CSCfi/ui/pull/311) [`626f3f5`](https://github.com/CSCfi/ui/commit/626f3f5dc0a01168dd10ff8c5365132862c21b8c) Thanks [@razorfever](https://github.com/razorfever)! - `c-page`'s scroll indicator measures without waiting for a scroll: at a
  restored scroll position, when it is switched on, and when the viewport or the
  page's content changes size.

- [#311](https://github.com/CSCfi/ui/pull/311) [`4e1f86f`](https://github.com/CSCfi/ui/commit/4e1f86f945ebfa914801281af94419da929055e3) Thanks [@razorfever](https://github.com/razorfever)! - `c-pagination`'s page buttons are named by `texts.page` ("page 2 of 4"); the
  name sat on an inner element that assistive technology ignores, so they were
  read as bare numbers. The page-size button's name includes the current size
  ("Items per page: 25").

- [#311](https://github.com/CSCfi/ui/pull/311) [`2697ce6`](https://github.com/CSCfi/ui/commit/2697ce6f3f841f1c43da4b0c9d302d102a649b13) Thanks [@razorfever](https://github.com/razorfever)! - `c-pagination` ends the last page's `endTo` at the last item instead of a full
  page further, and no longer puts the element's classes (or the 3.x
  `c-pagination`, `c-pagination--small` and `c-pagination--simple` classes it
  added itself) on its inner `<nav>`. An `aria-label` on the element still names
  the navigation.

- [#311](https://github.com/CSCfi/ui/pull/311) [`e867133`](https://github.com/CSCfi/ui/commit/e8671334330638728ad08073bd2231be883954db) Thanks [@razorfever](https://github.com/razorfever)! - An `indeterminate` `c-progress-bar` shows no percentage tooltip; it showed
  "0 %".

- [#311](https://github.com/CSCfi/ui/pull/311) [`7096dee`](https://github.com/CSCfi/ui/commit/7096dee851173d33319e03c1a636524230c9cff6) Thanks [@razorfever](https://github.com/razorfever)! - In Firefox, the dash between the start and end of a `range` `c-date-picker` or
  `c-time-picker` now sits evenly between the two values. The start was as wide
  as its character count, which left a wider gap before the dash than after it.

- [#311](https://github.com/CSCfi/ui/pull/311) [`80ca8a3`](https://github.com/CSCfi/ui/commit/80ca8a3e9df0b90ec16aca572c2444941cf1b4e7) Thanks [@razorfever](https://github.com/razorfever)! - `@cscfi/csc-ui-react` components now set object, array and function props on
  the element as properties. Before, `columns`, `data`, `items`, `texts`, render
  functions and the like reached the element as `[object Object]` attributes,
  so a `CDataTable`, `CSelect` with `items` or any `texts` override did not
  work in React.

- [#311](https://github.com/CSCfi/ui/pull/311) [`6726e8f`](https://github.com/CSCfi/ui/commit/6726e8f7a584f1126803426b8436814487557c29) Thanks [@razorfever](https://github.com/razorfever)! - In Safari, a `c-badge` on a `c-tab` is no longer cut off, the floating label
  of `c-text-field`, `c-select` and the other fields keeps room for tall glyphs,
  and `c-breadcrumb` no longer cuts the focus rings of its crumbs. They relied
  on CSS `overflow-clip-margin`, which Safari does not support.

- [#311](https://github.com/CSCfi/ui/pull/311) [`04cd574`](https://github.com/CSCfi/ui/commit/04cd5740565e7ba4b204a949f6611e82d9c79d12) Thanks [@razorfever](https://github.com/razorfever)! - `c-side-navigation` follows the WAI-ARIA disclosure navigation pattern:

  - It is a `<nav>` landmark (named by an `aria-label` on the element) instead of
    a `menubar` with no arrow-key support. Items and sub-items are links when
    they have an `href` and buttons when not; a parent is a disclosure button
    that controls its sub-items. A sub-item with an `href` is a real link (it
    used to navigate by script).
  - `c-side-navigation-title` is a heading (level 2).
  - The open mobile drawer is a modal dialog: focus moves into it, the page
    behind it is inert and stops scrolling, Escape closes it, and closing
    returns focus to the navigation button.
  - `c-navigation-button` reports the mobile drawer as expanded or collapsed.

- [#311](https://github.com/CSCfi/ui/pull/311) [`75ab6d1`](https://github.com/CSCfi/ui/commit/75ab6d1d1535a6af4910a51eb915a1cba5d0aff0) Thanks [@razorfever](https://github.com/razorfever)! - `c-side-navigation` fixes:

  - Sub-items added after the navigation mounts go under their item, which
    becomes an expandable parent.
  - A `c-navigation-button` no longer toggles a desktop (non-`mobile`)
    navigation or fires `change:open` from it.
  - Enter on an item with an `href` fires `select` once, not twice, and a nested
    item with an `href` follows its link.

- [#311](https://github.com/CSCfi/ui/pull/311) [`80f1a92`](https://github.com/CSCfi/ui/commit/80f1a92b6e9d786c8630e1e12ecf6aeb2684dbcd) Thanks [@razorfever](https://github.com/razorfever)! - `c-side-navigation`: activating an item or sub-item no longer sets its
  `active`. Mark the current page's item `active` from your router or the URL:
  a navigation the router cancels no longer leaves the clicked item highlighted.
  A parent still expands and collapses itself.

- [#311](https://github.com/CSCfi/ui/pull/311) [`8feb2a4`](https://github.com/CSCfi/ui/commit/8feb2a4713a27812577672769612f6febe03baeb) Thanks [@razorfever](https://github.com/razorfever)! - `c-slider`'s value bubble now stays centred over the handle in Firefox. As the
  slider moved, the bubble drifted up to 10px off the handle towards either end,
  and the handle sat 12px inside the track's end tick marks. The slider's handle
  now runs the same track in every browser.

- [#311](https://github.com/CSCfi/ui/pull/311) [`31248b7`](https://github.com/CSCfi/ui/commit/31248b74dc26f0ee6af29193179f14f7981f04a2) Thanks [@razorfever](https://github.com/razorfever)! - `c-slider` fixes:

  - The tick marks, their numbers and the filled marks start at `min`; they
    used to assume a range starting at 0.
  - A value outside `min`..`max`, such as the built-in 50 on a slider with
    `max="8"`, is shown at the end of the range instead of past it.
  - The value bubble and the mark numbers follow the page's `lang` (they were
    always Finnish) and show as many decimals as `step` has (they were always
    rounded to whole numbers).

- [#311](https://github.com/CSCfi/ui/pull/311) [`30bc5c6`](https://github.com/CSCfi/ui/commit/30bc5c6c04b946a3549bc2e2893ed455e1cd5112) Thanks [@razorfever](https://github.com/razorfever)! - `c-steps` keeps its connecting lines in step with its `c-step` elements: a step
  added after the indicator mounts gets its line, a removed step takes its line
  with it, and setting `value` after adding a step no longer throws.

- [#311](https://github.com/CSCfi/ui/pull/311) [`8a11364`](https://github.com/CSCfi/ui/commit/8a113649243165b781ed266e5a3bd74b0dcb4031) Thanks [@razorfever](https://github.com/razorfever)! - `c-steps` is no longer a Tab stop (it has nothing to operate), and its
  screen-reader summary is a polite status region, so a step change is
  announced.

- [#311](https://github.com/CSCfi/ui/pull/311) [`a524b0b`](https://github.com/CSCfi/ui/commit/a524b0bcbf7ef9dda58c598f09a859ccf1643924) Thanks [@razorfever](https://github.com/razorfever)! - `c-steps`' screen-reader summary stays within the steps: a `value` of 0 no
  longer reads "step 0" and "-1 steps marked as completed", an empty step label
  leaves no stray full stop, and the label's surrounding whitespace is dropped.

- [#311](https://github.com/CSCfi/ui/pull/311) [`74e64bf`](https://github.com/CSCfi/ui/commit/74e64bf394eb3570f2a296b504aa1e103971a290) Thanks [@razorfever](https://github.com/razorfever)! - In Safari, an open `c-menu-item` submenu no longer drifts away from its row
  when the page scrolls. Submenus are now positioned by script in every browser,
  as they already were where CSS anchor positioning is missing.

- [#311](https://github.com/CSCfi/ui/pull/311) [`046975a`](https://github.com/CSCfi/ui/commit/046975abcf8064b235da5824703b474b97d4951c) Thanks [@razorfever](https://github.com/razorfever)! - Both packages declare their supported browsers as a `browserslist` query:
  the current and previous Chrome, Edge, Firefox and Safari (iOS included),
  plus Firefox ESR. Getting started states the same list.

- [#311](https://github.com/CSCfi/ui/pull/311) [`6fd1fbf`](https://github.com/CSCfi/ui/commit/6fd1fbf65ecd7005280ad3142a3874f1f7d84e78) Thanks [@razorfever](https://github.com/razorfever)! - A `loading` `c-switch` ignores toggles and is announced as busy and
  unavailable (`aria-busy`, `aria-disabled`), as a loading `c-button` is; it used
  to keep toggling under its spinner.

- [#311](https://github.com/CSCfi/ui/pull/311) [`aca759f`](https://github.com/CSCfi/ui/commit/aca759f98906284da86135250f2f0245cc8baa95) Thanks [@razorfever](https://github.com/razorfever)! - `c-tabs` follows the WAI-ARIA tabs pattern:

  - The row of tabs is the `tablist`; the scroll arrows and the panels are no
    longer inside it. An `aria-label` on `c-tabs` names it, and the vertical
    layout marks it `aria-orientation="vertical"`.
  - With `c-tab-buttons`, its buttons are the tabs (`aria-selected`), not toggle
    buttons.
  - The arrow keys act on key press and skip disabled tabs, Up and Down work in
    the vertical layout, and Home and End go to the first and last tab. Moving
    focus still selects nothing until Enter or Space.
  - A disabled tab is announced as disabled instead of being hidden.
  - With no tab matching `value`, the first enabled tab is the Tab stop.
  - Moving focus to a tab out of view no longer waits for the row's scroll
    animation (it never moved under reduced motion), and the tab set no longer
    pulls focus back to the active tab when it re-measures.

- [#311](https://github.com/CSCfi/ui/pull/311) [`9f39856`](https://github.com/CSCfi/ui/commit/9f398565b81bdb9f17c796d807f307345277f379) Thanks [@razorfever](https://github.com/razorfever)! - A `c-modal`, or any other `position: fixed` content, inside a `c-tab-item`
  covers the viewport again: the tab set used to position and clip it inside the
  panel. The panels now slide only while switching and sit without a transform
  otherwise.

- [#311](https://github.com/CSCfi/ui/pull/311) [`58280e0`](https://github.com/CSCfi/ui/commit/58280e051477e0511f4e281cdc7be1fe5619ce09) Thanks [@razorfever](https://github.com/razorfever)! - `c-tabs` tab-row fixes:

  - A vertical swipe that starts on an overflowing tab row scrolls the page; the
    row used to cancel every touch move.
  - `disable-animation` also stops the row's own scroll from animating.
  - Focus in a panel, such as a field you are typing in, stays there when the tab
    set re-measures; it used to jump to the active tab after any key press inside
    the tab set.
  - A resize that lands while the active-tab underline moves is no longer
    dropped, so a row that becomes too narrow then gets its overflow arrows.

- [#311](https://github.com/CSCfi/ui/pull/311) [`0d93fad`](https://github.com/CSCfi/ui/commit/0d93fadd1bf1db9ba1f0a5aba7d89c412c52995e) Thanks [@razorfever](https://github.com/razorfever)! - A plain `c-tag` (neither `closeable` nor `flat`) works as a toggle button from
  the keyboard: Enter and Space fire `click` as a mouse click does, and `active`
  is announced as its pressed state (`aria-pressed`).

- [#311](https://github.com/CSCfi/ui/pull/311) [`cdc4b12`](https://github.com/CSCfi/ui/commit/cdc4b12a7d3d2beab87d306d01fcb2cce2fdb6d7) Thanks [@razorfever](https://github.com/razorfever)! - `c-tags` gives tags added after it mounts the group's `size`, and the close
  button of a `flat closeable` `c-tag` responds to the mouse again.

- [#311](https://github.com/CSCfi/ui/pull/311) [`f3d9a62`](https://github.com/CSCfi/ui/commit/f3d9a620d0a4bec858d2264fbd99907fbb30a7ea) Thanks [@razorfever](https://github.com/razorfever)! - Text now meets WCAG AA contrast (4.5:1) in both theme modes:

  - Light mode: hints, placeholders, resting field labels and other secondary
    text (`on-surface-muted`, `on-surface-faint`) darken from `tertiary-500` to
    `tertiary-600`. Chart axis labels (`chart-axis`) follow.
  - Dark mode: `error` moves to `error-300`, so error messages read on raised
    surfaces. A danger button's hover (`error-hover`) moves to `error-200` to
    stay distinct.
  - An expanded `c-accordion-item` heading uses `on-primary-subtle`, the ink
    paired with its tinted background.
  - Disabled `c-button` and `c-icon-button` text uses `on-surface-disabled`, as
    disabled options and days already do. It would otherwise have darkened with
    the hint text and read as enabled.

- [#311](https://github.com/CSCfi/ui/pull/311) [`a9745b7`](https://github.com/CSCfi/ui/commit/a9745b7ce77927efa65af8da548626a92c1ee980) Thanks [@razorfever](https://github.com/razorfever)! - `autocorrect="off"` on `c-text-field` turns autocorrection off, as on a native
  input and as in 3.x. It used to turn it on, because the prop took only a
  boolean. The attribute now takes `on` and `off`, and the property also takes
  `true` and `false`.

- [#311](https://github.com/CSCfi/ui/pull/311) [`7641396`](https://github.com/CSCfi/ui/commit/76413966a6814e33c3f302d0585cda6992871143) Thanks [@razorfever](https://github.com/razorfever)! - `c-text-field` follows a `type` changed after it mounts: the input takes the
  new type, and a `password` or `date` field gets its toggle button. The type was
  read once, when the field mounted.

## 4.0.0-alpha.32

### Minor Changes

- [#309](https://github.com/CSCfi/ui/pull/309) [`fceba25`](https://github.com/CSCfi/ui/commit/fceba2537cc62554ab2333951a41ac6057ef0a8e) Thanks [@razorfever](https://github.com/razorfever)! - Add c-color-picker: a typeable colour field that reads any CSS colour, with a
  keyboard-operable panel of a colour area, hue and alpha sliders, per-channel
  inputs and swatches (ADR-0069, ADR-0070).

  - `format` sets the notation the value is written in — `hex` (default), `rgb`
    or `oklch` — whatever notation a colour is typed or picked in; the panel's
    HEX | RGB | OKLCH switch only changes the channel inputs. `alpha` opts into
    transparency.
  - `swatches` offers predefined colours, named for assistive technology;
    `swatches-only` limits the choice to them in a readonly, select-like field.
  - A drag on the area or a slider updates `v-model` as it moves and fires
    `change` once, on release.
  - When the panel opens on a colour, it shows that original colour beside the
    new one; a click on the original restores it.

- [#309](https://github.com/CSCfi/ui/pull/309) [`bd3c227`](https://github.com/CSCfi/ui/commit/bd3c227546fc74e4fd6a7fe169fb9bc7c4c81bbe) Thanks [@razorfever](https://github.com/razorfever)! - Add c-file-upload: a field the user adds files to by dropping them on it or
  choosing them from the file dialog, with each file's size and upload progress
  in a list under the drop zone (ADR-0071).

  - The value is a list of file entries — name, size, type, the browser `File`
    and a status — bound with `v-model`. Files already on the server can be
    listed as entries without a `File`.
  - Set `upload` to a function that sends one file; the field calls it for each
    added file, three at a time, shows its progress, and offers cancel and retry.
    Without one, the field only holds the files. A `manual` field holds them
    until `startUploads()` is called, for a form that uploads on its own button.
  - `accept`, `max-size` and `max-files` limit what the field takes, and a file
    already in the list is never added twice; a refused file is listed with its
    reason until the list next changes, and reported by the `reject` event.
  - `compact` shows the drop zone as a row at the shared control height, to line
    up with the fields beside it.

- [#309](https://github.com/CSCfi/ui/pull/309) [`2d7d2ef`](https://github.com/CSCfi/ui/commit/2d7d2ef410bcea0d4fda15c17bbfca449dd4045b) Thanks [@razorfever](https://github.com/razorfever)! - Components inherit the page's typography (ADR-0072). Every component used to
  reset its font to the operating system's and its line height to 1.5, so text
  slotted into `c-main`, cards and other components ignored the app's font, and
  nested parts such as `c-select`'s option list could not be reached from the
  page at all. Components now take the page's font family, line height and font
  features, as native elements do, and no longer declare Tailwind theme
  variables (`--font-sans`, `--spacing`, …) that made an app's own Tailwind
  utilities read csc-ui's values inside components. The `--c-font-family` token
  is removed: set your font on `body`, or `font-family` on a `c-*` element to
  give one component another typeface. A page that sets no font now shows
  components in the browser default.

### Patch Changes

- [#309](https://github.com/CSCfi/ui/pull/309) [`758789e`](https://github.com/CSCfi/ui/commit/758789e0e462f52c5b0d72664569574ee9e3335b) Thanks [@razorfever](https://github.com/razorfever)! - Typing into a closed `c-autocomplete` or `c-tree-select` field now opens the
  panel with every typed character in its search input. Before, the first
  character could be lost (typing `finland` searched for `inland`), and fast
  typing could drop more. After such an open the highlight lands on the first
  match, as it does when typing into the open panel.

## 4.0.0-alpha.31

### Patch Changes

- [#307](https://github.com/CSCfi/ui/pull/307) [`2852e02`](https://github.com/CSCfi/ui/commit/2852e02a72cdd135333f1d57d6c2146d7726d191) Thanks [@razorfever](https://github.com/razorfever)! - c-date-picker and c-time-picker now ring the panel's focused day or row after
  Alt+↓ and the arrow keys, also when the field was clicked first and in Firefox,
  where no ring showed. A selected day rings in its own ink, inside the fill,
  instead of a primary ring lost against it.

- [#307](https://github.com/CSCfi/ui/pull/307) [`ea71a5e`](https://github.com/CSCfi/ui/commit/ea71a5e83bcee05c91433bf497e76ad9701ee48c) Thanks [@razorfever](https://github.com/razorfever)! - c-time-picker: a pick in an empty field on the hour now rests the filled-in
  minute (00) at the top of its column, as it does at any other minute; the
  column used to keep wherever it had been scrolled.

## 4.0.0-alpha.30

### Minor Changes

- [#305](https://github.com/CSCfi/ui/pull/305) [`45179c7`](https://github.com/CSCfi/ui/commit/45179c754956d0ba15e592ea05c57cad38f9048f) Thanks [@razorfever](https://github.com/razorfever)! - Add `c-breadcrumb` and its crumbs, `c-breadcrumb-item`: a navigation aid naming
  where the current page sits in a site's hierarchy (ADR-0067).

  - A crumb with an `href` is a link (an optional `target` sets where it opens);
    the last crumb is always the current page, plain text announced as the
    current page. An icon goes in a crumb's `icon` slot; an icon-only crumb is
    named by its `aria-label`.
  - The breadcrumb is one line. When it runs out of room, the middle crumbs fold
    behind a "…" button whose panel lists them as links (Tab or the arrow keys
    move through them), and past that the current and first crumbs' labels
    shorten with an ellipsis. A single-page app routes by intercepting a crumb's
    click, folded crumbs included.
  - Parts: `root`, `list`, `separator`, `fold-button`, `panel`, `panel-list` on
    the breadcrumb; `root`, `separator`, `content`, `label` on a crumb, with the
    `current` and `folded` custom states. Texts are overridable through `texts`.

### Patch Changes

- [#305](https://github.com/CSCfi/ui/pull/305) [`5672043`](https://github.com/CSCfi/ui/commit/567204394ddd1a20617c6abe2412431608a0c6c2) Thanks [@razorfever](https://github.com/razorfever)! - Keyboard focus now shows a ring where it never painted: c-time-picker's
  columns, end switch and Now and Done buttons; c-date-picker's arrows, month
  and year buttons and lists and Today and Done buttons; the close button of a
  fullscreen panel (also in c-select, c-autocomplete and c-tree-select); and
  c-link. The time picker's selected end tab rings in its own ink, inside the
  fill.

## 4.0.0-alpha.29

### Minor Changes

- [#303](https://github.com/CSCfi/ui/pull/303) [`72aca2d`](https://github.com/CSCfi/ui/commit/72aca2d450a9ce6b93c6a1b6f4267ab49a48d2f2) Thanks [@razorfever](https://github.com/razorfever)! - c-date-picker, c-time-picker: on a narrow viewport the fullscreen panel now
  ends in a Done button. Picks only select there, and nothing is emitted until
  Done commits them and closes the panel; the close button and Escape discard
  them. The Today and Now buttons select the same way. The anchored panel is
  unchanged.

- [#303](https://github.com/CSCfi/ui/pull/303) [`f5b416f`](https://github.com/CSCfi/ui/commit/f5b416f3ee40392d22d7d41bc4efa78c72c4b62a) Thanks [@razorfever](https://github.com/razorfever)! - c-number-field opens the numeric keyboard on phones, also in fields that take
  negative numbers, and gains step buttons: up and down chevrons that move the
  number by the new `step` prop (`1` by default) and repeat while held. The
  arrow keys step too, and Page Up / Page Down move ten steps. Stepping snaps to
  the step grid and stays within `min` and `max`. The buttons' accessible labels
  can be translated with the new `texts` prop.

- [#303](https://github.com/CSCfi/ui/pull/303) [`219a91e`](https://github.com/CSCfi/ui/commit/219a91e79d155b8f8b476720ee92ed6b8cd88517) Thanks [@razorfever](https://github.com/razorfever)! - Add `show-today` to c-date-picker and `show-now` to c-time-picker: an opt-in
  button under the panel that picks today (the current month under
  `type="month"`) or commits the current time.

### Patch Changes

- [#303](https://github.com/CSCfi/ui/pull/303) [`8561284`](https://github.com/CSCfi/ui/commit/856128481a567503104da5f137fe31310fe54c8c) Thanks [@razorfever](https://github.com/razorfever)! - c-date-picker, c-time-picker: the calendar and clock buttons are bigger in a
  default-size field, a 24px icon on a 40px button, so they are easier to tap.
  A small field keeps the 28px button.

- [#303](https://github.com/CSCfi/ui/pull/303) [`79f8220`](https://github.com/CSCfi/ui/commit/79f82207e410b01c42b3c838d13e77ca24297297) Thanks [@razorfever](https://github.com/razorfever)! - c-time-picker: in the fullscreen panel, a column that fits (the hours in a
  tall window, AM/PM, a coarse minute step) now rests its selected row in the
  middle too, so the selections line up.

- [#303](https://github.com/CSCfi/ui/pull/303) [`3a47459`](https://github.com/CSCfi/ui/commit/3a47459890edb2eec678b06207064477c1bd259f) Thanks [@razorfever](https://github.com/razorfever)! - c-time-picker: a 12-hour hour column now lists 1 to 11 and then 12, instead
  of starting with 12.

## 4.0.0-alpha.28

### Minor Changes

- [#301](https://github.com/CSCfi/ui/pull/301) [`fcbc33f`](https://github.com/CSCfi/ui/commit/fcbc33f42f1deec17b69b65811898663075df5d9) Thanks [@razorfever](https://github.com/razorfever)! - Add `type="month"` to c-date-picker for picking a year and a month
  (`'YYYY-MM'`), with ranges, `min`/`max` and a format derived from `format`.

- [#301](https://github.com/CSCfi/ui/pull/301) [`cfb76c1`](https://github.com/CSCfi/ui/commit/cfb76c1a56c5c39f7c7cb70c0ce4934b3e4705ec) Thanks [@razorfever](https://github.com/razorfever)! - Add c-time-picker: a typeable time field with hour and minute columns, 12- and
  24-hour formats, a minute step, min and max, and time ranges that may span
  midnight. The value is an ISO `HH:mm` string whatever the displayed format.

### Patch Changes

- [#301](https://github.com/CSCfi/ui/pull/301) [`8424a7d`](https://github.com/CSCfi/ui/commit/8424a7d30a4f375818dc253386215a70aa95fcc8) Thanks [@razorfever](https://github.com/razorfever)! - Fix a click in c-date-picker's range end input moving the caret to the start
  input.

- [#301](https://github.com/CSCfi/ui/pull/301) [`9e5b02d`](https://github.com/CSCfi/ui/commit/9e5b02dfc54171b0f42c78cc128c08b695d0c02b) Thanks [@razorfever](https://github.com/razorfever)! - Fix disabled rows in c-time-picker and disabled days in c-date-picker looking
  almost like enabled ones in light mode. They now use a new
  `on-surface-disabled` token.

- [#301](https://github.com/CSCfi/ui/pull/301) [`a9d54fb`](https://github.com/CSCfi/ui/commit/a9d54fb473ce2098305eed17f58b5953e87759e1) Thanks [@razorfever](https://github.com/razorfever)! - c-time-picker keeps the selected row at the top of its column (the middle on
  narrow viewports) on open and after every pick, including the last rows of a
  column.

## 4.0.0-alpha.27

### Minor Changes

- [#299](https://github.com/CSCfi/ui/pull/299) [`de58feb`](https://github.com/CSCfi/ui/commit/de58feb102f4688eef2a1d4a4c7af7dc3737afc8) Thanks [@razorfever](https://github.com/razorfever)! - Add `c-date-picker`: a typeable date field with a calendar panel. It takes a
  single date or, with `range`, a start and an end, and its value is an ISO
  `YYYY-MM-DD` string. The display `format`, the first day of the week, week
  numbers and the texts are configurable, and dates can be disabled with `min` /
  `max`, a `disabled-dates` list or an `is-date-disabled` predicate. On a narrow
  viewport the calendar opens as a fullscreen panel.

- [#299](https://github.com/CSCfi/ui/pull/299) [`e07c07a`](https://github.com/CSCfi/ui/commit/e07c07a4c94aa538239a30a79c2f8ac5f5f8f3fe) Thanks [@razorfever](https://github.com/razorfever)! - Add `c-number-field`: a number input that shows thousands separators as the
  user types (`1 234 567,89`) while its value stays a plain number. The
  separators follow the page language unless set, `decimals` allows fraction
  digits (with optional padding), and `min` / `max` report an out-of-range
  number through the `out-of-range` custom state instead of changing it.

- [#299](https://github.com/CSCfi/ui/pull/299) [`05366e1`](https://github.com/CSCfi/ui/commit/05366e1fac0c59bd78fde46e7e893ac40d66d7fe) Thanks [@razorfever](https://github.com/razorfever)! - Add input masks to `c-text-field`. A `mask` such as `+358 ## ### ####` makes
  the typed text follow a pattern (`#` a digit, `A` a letter, `*` either), with
  the separators filled in automatically, and a faint guide in the field shows
  what is still to be typed (`+358 __ ___ ____`). A mask can end in optional
  parts for formats of varying length, like `+358 #####[#######]` for 5–12
  digits. The value is the text as shown; the read-only `unmaskedValue` holds
  only the typed characters, and `maskComplete` and the `incomplete` custom
  state tell whether the required part is filled.

### Patch Changes

- [#299](https://github.com/CSCfi/ui/pull/299) [`91a7cbe`](https://github.com/CSCfi/ui/commit/91a7cbe89eb322cb8c9131a9ef9c3749baf1334f) Thanks [@razorfever](https://github.com/razorfever)! - `c-date-picker` now shapes typed dates to its `format` as they are typed: the
  separators appear on their own, and letters and other stray characters are
  ignored.

## 4.0.0-alpha.26

### Minor Changes

- [#297](https://github.com/CSCfi/ui/pull/297) [`30dc497`](https://github.com/CSCfi/ui/commit/30dc49704d0732518a947015d678f5436c0a2915) Thanks [@villeerikssoncsc](https://github.com/villeerikssoncsc)! - Honour the OS reduced-motion preference in every component, and make the
  accordion frame the default c-accordion look.

  - With `prefers-reduced-motion: reduce`, every component transition is
    instant. The dropdown, autocomplete and tree-select panels open in place,
    the loader message no longer rises, ripples are skipped and the tab strip
    arrows scroll instantly. Spinners, indeterminate progress and the toast
    timer keep moving because the motion carries meaning.
  - Collapsed c-accordion items now stack flush into one hairline frame with
    rounded ends. An expanded item lifts out of it with a primary outline, a
    faint primary wash, an inset accent bar and 8px of space around it. The
    header is transparent, and the content sits in an inset card. Consumers who
    wrote this look as a `::part()` override can remove it.
  - `outlined` now outlines expanded items only, thickening their outline to
    2px. It used to draw a ring inside every item, which reads as a double
    border in the frame.
  - Fix c-accordion ignoring its initial `value` when its items are authored in
    HTML.

## 4.0.0-alpha.25

### Patch Changes

- [#295](https://github.com/CSCfi/ui/pull/295) [`7feb3ac`](https://github.com/CSCfi/ui/commit/7feb3ac6aca3db7b55450233ab660434fe350ce9) Thanks [@razorfever](https://github.com/razorfever)! - Fix popovers, menus, tooltips and field lists running off the edge of the
  screen in browsers without CSS anchor positioning (Firefox 140 ESR) when they
  don't fit beside their trigger, for example a wide popover on a phone. They now
  stay inside the viewport and pick the same placement as in other browsers.

## 4.0.0-alpha.24

### Patch Changes

- [#293](https://github.com/CSCfi/ui/pull/293) [`561a03c`](https://github.com/CSCfi/ui/commit/561a03c44acbe4b1b90ed20ff84affb15414206e) Thanks [@razorfever](https://github.com/razorfever)! - Fix the floating label disappearing in Firefox 140 ESR once a field is focused
  or filled. The label lifted onto the field border in `c-text-field`,
  `c-select`, `c-autocomplete` and `c-tree-select` (and any bare `c-input`)
  painted nothing there; it now shows in every browser, with the same look and
  the same ellipsis for a long label.

- [#293](https://github.com/CSCfi/ui/pull/293) [`e3e2502`](https://github.com/CSCfi/ui/commit/e3e2502e8051aa789dc945e1b49113aa3bd5dcf0) Thanks [@razorfever](https://github.com/razorfever)! - Fix overlays opening in the wrong place in browsers without CSS anchor
  positioning, such as Firefox 140 ESR. Menus and submenus, tooltips, popovers
  and the `c-select`, `c-autocomplete` and `c-tree-select` panels now open against
  their trigger there too, flip like they do elsewhere when there is no room, and
  follow the trigger on scroll. `@oddbird/css-anchor-positioning` is no longer a
  dependency; `@floating-ui/dom` takes its place and loads only in those browsers.

- [#293](https://github.com/CSCfi/ui/pull/293) [`d3b0186`](https://github.com/CSCfi/ui/commit/d3b018615e1e02a7e4210862a860a244b54fba02) Thanks [@razorfever](https://github.com/razorfever)! - Fix sticky toolbars and side navigation vanishing in Firefox 140 ESR while a
  `c-select` list, a `c-modal` or a fullscreen field panel is open on a scrolled
  page. The shared page scroll lock shifted the body up by the scroll offset,
  and Firefox left sticky content at its in-page position, far above the
  viewport. The locked body now scrolls itself to the offset instead, so sticky
  content stays pinned in every browser and nothing visibly moves.

- [#293](https://github.com/CSCfi/ui/pull/293) [`d66a85b`](https://github.com/CSCfi/ui/commit/d66a85bf1e07def34496d9667a93a6d0b3a644a8) Thanks [@razorfever](https://github.com/razorfever)! - Fix the closed mobile `c-side-navigation` drawer showing as a strip at the
  right edge of the screen on a page with `scrollbar-gutter: stable`. The drawer
  was only slid off-screen, which left it in the reserved gutter; it is now also
  hidden once closed, which takes its links out of the tab order too. The
  slide-in and slide-out animations are unchanged.

## 4.0.0-alpha.23

### Patch Changes

- [#291](https://github.com/CSCfi/ui/pull/291) [`5f28bbe`](https://github.com/CSCfi/ui/commit/5f28bbea7743f968a20522787ad775de55232d7d) Thanks [@razorfever](https://github.com/razorfever)! - `c-main`: a page that fits the viewport no longer scrolls. The desktop drawer,
  sized to its pinned height, used to add the banner's and a `static` toolbar's
  height to the dashboard layout, so a short page could scroll by that much and
  hide the toolbar (also inside a bounded shell). The drawer now adds nothing to
  the layout and still fills the viewport once pinned. Content that paints below
  `c-main`'s bottom edge is clipped instead of extending the document, and the
  dashboard grid is laid out inside `::part(root)` rather than on it.

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
