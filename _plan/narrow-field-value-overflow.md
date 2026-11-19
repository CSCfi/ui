# A long value never widens a field past its container

## Context

A long selection in `c-tree-select` overflows the screen on narrow
viewports. The cause, measured against `dist` in a 360px viewport:

- **The cause.** The value block is nowrap text, so the field's minimum
  width is the whole value. `min-w-0` and `overflow-hidden` inside the shadow
  root don't change that minimum.
- **Where it goes wrong.** When the field has a fixed width (a plain block),
  it truncates as designed. But a page layout that sizes the field from its
  content (a flex row, a grid `1fr`/`auto` column, `align-items: start`, an
  inline-block) grows it to 624px, past the screen.
- **Why c-select is fine.** `c-select`'s single value is a readonly `<input>`,
  and an input's minimum width can shrink, so it stays inside.

The same bug, found while measuring: in `multiple` mode, one long chip in
`c-select` or `c-autocomplete` grows the field to 524px in the same layouts.
`c-select`'s content row also lacks the `min-w-0` that `c-autocomplete` has.
So even in a fixed-width field the chip pushes the clear/chevron controls
8px past the field edge, the same bug c35aedc3 fixed in `c-tree-select`.

You chose two separate fixes. Both use one technique, which I checked by
overriding styles on the live page:

- **The technique.** The box holding the value text becomes a one-column
  `minmax(0, 1fr)` grid. A grid's `fr` column is zero wide while the browser
  measures the box's smallest width, but takes the full text width when it
  measures the preferred width.
- **Effect in the page layout.** The field can shrink to its container, yet
  it keeps the width it has today wherever it already fit (54px empty, 139px
  short value).
- **Effect on the text.** The label ellipsises, the code stays whole, the
  value stays centred, and the clear button stays inside. All of this held in
  every layout down to a 200px flex row.

First step when executing: copy this plan to
`_plan/narrow-field-value-overflow.md`.

## Commit 1 — `Fix(c-tree-select): A long selection never widens the field past its container`

`packages/csc-ui/src/components/c-tree-select/CTreeSelect.vue`:
- **The change.** In the `fieldText` slot of the `treeSelect` tv config,
  change `flex min-w-0 flex-1 flex-col justify-center overflow-hidden py-2`
  to `grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] content-center overflow-hidden py-2`.
- **The comment above it.** Keep the centring rationale and reword
  `justify-center` as `content-center`. Add why it is a grid and not a flex
  column: its minimum width is zero, so a page that sizes the field from its
  content never stretches it past the screen.

`CTreeSelect.spec.ts`, in `describe('closed field with a selection')`:
- **The setup.** A new `it` uses `mount('c-tree-select', …)` directly with the
  `LONG` items, `value: 'long'` and `clearable`, without the fixed width that
  `mountTree` sets.
- **The layouts.** For each layout (flex row; grid `1fr`; flex column with
  `align-items: flex-start`), move `m.stage` into a 240px container, as
  `mountInForm` does with its fieldset (`src/test/harness.ts:315`), then
  `settled()`.
- **The assertions.** The slot box (`slotBox`) stays within the container,
  the clear button (`postButton`) stays inside the slot, and the label
  ellipsises. Reuse the describe's existing helpers.
- **Fails before the fix:** the slot is about 600px wide. Run the spec first
  to see that.

`.changeset/tree-select-long-value.md`: a patch for `@cscfi/csc-ui` and
`@cscfi/csc-ui-react`, with one user-facing sentence.

## Commit 2 — `Fix(c-select, c-autocomplete): A long tag never widens the field past its container`

`c-select/CSelect.vue` and `c-autocomplete/CAutocomplete.vue`:
- **Tag markup.** The tag label gets an inner text span:
  `<span :class="ui.tagLabel()" aria-hidden="true"><span :class="ui.tagText()">{{ opt.label }}</span></span>`.
  A grid's text needs its own element to carry the ellipsis.
- **Tag styles.** `tagLabel` becomes `grid min-w-0 grid-cols-[minmax(0,1fr)]`,
  and the new `tagText` slot is `truncate`. Extend the existing "A long option
  label ellipsises inside its tag…" comment with why it is a grid.
- **c-select only.** Its `content` slot, `flex w-full items-center`, gets
  `min-w-0`, as in `c-autocomplete`. Add a short comment that a long tag would
  otherwise push the clear/chevron controls out of the field.

Specs, in each component's `describe('closed field controls')`:
- **c-select, fixed width.** A field 320px wide, `multiple` with a long tag
  and `clearable`, keeps its clear button inside the slot. This fails before
  the fix: the button sits 8px out.
- **Both components, content-sized layouts.** The same three layouts as
  commit 1, each in a 240px container. The slot stays within the container
  and the long tag's text ellipsises. This fails before the fix: the slot is
  524px wide.

`.changeset/select-long-tag.md`: a patch for both packages.

## Verification

- **Each fix's spec, before and after.** Write the spec, run it on the
  unfixed code to see it fail, then apply the fix and see it pass. Run one
  spec file per run (the devcontainer's Chromium runs out of memory
  otherwise):
  `cd packages/csc-ui && pnpm vitest run --project browser src/components/c-tree-select/CTreeSelect.spec.ts`,
  then the same for CSelect and CAutocomplete.
- **Visual baselines.** The existing baselines (`field-selected`, the open
  `multiple` panels) must still pass. The 1% tolerance can hide a small
  change, so regenerate them and pixel-diff the new PNGs against HEAD with
  pngjs. Restore the HEAD PNGs if they are identical, and commit only real
  changes.
- **Repo checks.** `pnpm lint`, `pnpm format:check` and the CI `type-check`
  script.
- **The real build.** Rebuild with `pnpm ui build`, then rerun the headless
  probe used for diagnosis (six layouts in a 360px viewport, and a 200px flex
  row). In every case the document's `scrollWidth` should be 360.
- **Firefox, optionally.** Run the three specs locally with
  `TEST_BROWSERS=firefox` (scratch Playwright install). CI covers Firefox and
  WebKit anyway (ADR-0077).
- **Committing.** Commit 1, then commit 2, each with its own changeset and
  ending with the `Co-Authored-By` line. Push nothing.
