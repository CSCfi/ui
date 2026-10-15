# 70. c-color-picker is the typed-field picker with an HSV panel

Date: 2026-10-08

## Status

Accepted

Extends ADR-0058 and ADR-0062 (the typed field and dialog panel), ADR-0066
(Done in the fullscreen panel) and ADR-0043 (peek).

## Context

The todo asks for an accessible, keyboard-operable colour picker that can
also be limited to predefined swatches. The date and time pickers already
share a typed-field shell (`useTypedField`, `TypedField.vue`) and an
anchored panel with a fullscreen layout. A colour has three coordinates, and
pointer drags over a colour area produce dozens of values a second.

## Decision

- **Field.** The typed-field shell, as in ADR-0058: an editable input that
  never opens the panel on click or focus. Its trailing **colour button** —
  40px with a 24px chip, 28px in a small field — is painted with the current
  colour and opens the panel, as does Alt+↓. Under alpha the chip has a
  checkerboard; with no colour it shows an empty look. It carries a
  load-bearing hairline (ADR-0042) so white reads on white.
- **Panel.** A `role="dialog"` that takes real focus and cycles Tab: the
  **colour area** (saturation × brightness at the current hue), a hue
  slider, an alpha slider under `alpha`, the **colour comparison**, the
  **notation switch** and its **channel editor**, and the swatch grid. A narrow viewport opens the
  fullscreen panel, whose picks wait in a pending value for Done
  (ADR-0066). The anchored panel is about 280px wide whatever the field's
  width.
- **Colour area.** One Tab stop over two visually hidden native
  `<input type="range">`s, React Aria's ColorArea pattern: Left/Right move
  saturation, Up/Down brightness, Shift or PageUp/PageDown take steps of
  ten, and each range has an `aria-valuetext`. Hue and alpha are native
  ranges of their own. The panel keeps its own HSV position, so the hue
  survives a grey; a step that does not change the bytes moves the thumb
  and emits nothing.
- **Commit.** The anchored panel commits live, as the time picker does
  (ADR-0062): a click, a key step, a channel entry or a swatch pick emits
  `change`, `update:value` and `input`, and the panel stays open. A pointer
  drag on the area or a slider emits `update:value` and `input` on each
  move and `change` once, on release, as a native range does.
- **Colour comparison.** When the panel opens on a colour, a strip under
  the sliders shows that original colour on the left beside the colour the
  panel holds on the right, the halves touching so a small shift shows. It is
  taken before the panel shows, so the panel is measured with the strip in
  it, and both halves match until something changes. The original half is a
  native button ("Restore original colour"): in the anchored panel it
  commits the original like any pick, in the fullscreen panel it becomes the
  pending value. The live-commit panel needs this way back, since Escape
  keeps its picks. The new half is decorative; the area, sliders and channels
  already expose the colour. An empty or bad-input field has no original,
  and swatch-only has no comparison.
- **Channel editor.** Native labelled inputs — one hex box; R, G, B; or L,
  C, H — with A under `alpha`. Up/Down nudge a channel and commit; typed
  text commits on Enter or blur, clamped to the channel's range, and text
  that is no number reverts. The notation switch is a row of native
  `aria-pressed` toggles and opens on `format`.
- **Swatches.** `swatches` takes `{ value, name? }` objects or strings, as a
  property only. They show as a grid under the free picker: one Tab stop, a
  `role="listbox"` with real focus on the swatch, arrows moving in two
  dimensions without committing, and Enter, Space or a click picking. A
  swatch's accessible name is its `name`, else its spelled value.
- **Swatch-only.** Under `swatches-only` the field is readonly and opens the
  panel on a click, Enter or Alt+↓, like `c-select`. It shows the swatch's
  chip and name, and the panel holds only the grid. A pick commits and
  closes in every layout, so its fullscreen panel has no Done.

## Alternatives considered

- **An inline surface only**, or an `inline` prop: no form-row field, or two
  layouts to specify.
- **One `role="slider"` area**: `aria-valuenow` holds a single axis.
- **Two Tab stops for the area**: an extra stop, and Up/Down dead on the
  first.
- **Nesting `c-slider` or `c-number-field`**: `c-slider`'s value text,
  Finnish tooltip and primary thumb do not fit a colour track, and a nested
  custom element breaks the dialog's native Tab trap.
- **Every value event on each drag move** (`c-slider`): a consumer saving on
  `change` saves dozens of times a second.
- **Commit on release only**: `v-model` cannot preview the colour live.
- **One text box per notation**: no per-channel nudging, and a second field.
- **Selection following focus in the grid**: arrowing to a swatch commits
  every swatch on the way.
- **A typed field under swatch-only**: nearly every input would be bad
  input, and the allowed colours stay invisible until the panel opens.
- **Done under swatch-only**: a select's pick commits and closes.
- **A leading chip as the opener, or a chip plus a palette button**: the
  sibling pickers' opener is trailing, and two colour-ish controls crowd one
  field.
- **An eyedropper**: Chromium-only today; left for a later opt-in prop.
- **A display-only comparison**: no way back to the original once live picks
  have committed.
- **Escape reverting to the original**: breaks the live commit the time
  picker set (ADR-0062).
- **A comparison box beside the sliders, or captioned halves**: narrower
  sliders and small patches, or two more texts and a row of height.

## Consequences

- One component has two field models, typed and select-like.
- The heading row's X discards in the picker's fullscreen panel and only
  closes under swatch-only, as in `c-select`: a recorded divergence.
- `useTypedField` runs without a mask and gains a move/settle pair for
  drags; the emit helpers gain an input-only and a change-only variant.
- `c-slider` still emits every value event on each move.
- The original colour is one more Tab stop in the panel.
