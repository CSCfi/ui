---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Add c-color-picker: a typeable colour field that reads any CSS colour, with a
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
