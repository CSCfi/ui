A colour field that takes any typed CSS colour, or opens a panel for picking one: a colour area, hue and alpha sliders, per-channel inputs and swatches — or swatches alone under `swatches-only`.

## Value

The value is a CSS colour string in the field's notation — `'#1f6feb'` by
default — or `null` when the field is empty. Bind it with `v-model`, or listen
for `change`:

```vue
<c-color-picker v-model="color" label="Colour" />
```

## Notation

`format` sets the notation the value is written in, and every emission with
it: `hex` (the default) gives `#1f6feb`, `rgb` gives `rgb(31 111 235)` and
`oklch` gives `oklch(0.5686 0.202 259.7)`. Whichever notation a colour arrives
in — typed, picked or set from outside — the field shows it, and the value
carries it, in this one. The notation is an app default, so an app can set it
once with `applyDefaults({ 'c-color-picker': { format: 'oklch' } })`.

Every colour the picker holds is an 8-bit sRGB colour — what `#rrggbb` can
write — and each notation spells it at the fewest decimals that read back to
the same colour. Switching `format` therefore never moves the colour, and an
`oklch()` typed with four decimals can come back with fewer.

The HEX | RGB | OKLCH switch inside the panel only chooses which channel
inputs show. It never changes the value or its notation.

## Typing

The field is typeable first: clicking into it or focusing it never opens the
panel. Text is read when the user presses Enter or leaves the input, never per
keystroke, and any CSS colour reads: `#fff`, `1f6feb` without its `#`, `red`,
`hsl(210 80% 50%)`, `rgba(31, 111, 235, 0.5)`, `color(display-p3 1 0 0)`.
The field then shows the colour in its notation.

A colour outside sRGB — `oklch(0.7 0.3 150)`, `rgb(300 0 0)` — is brought into
it as it is read, keeping its lightness and hue and lowering its chroma, the
way a browser paints it on an ordinary screen. It is not an error.

Text that names no colour — `blurple`, `var(--brand)` — is **bad input**: the
text stays as the user typed it, the value becomes `null`, and the host
exposes the `bad-input` custom state and a read-only `badInput` property. The
component never shows an error of its own; deciding whether bad input is an
error, and saying so, is the consumer's validation:

```vue
<c-color-picker
  v-model="color"
  :error-message="error"
  :valid="!error"
  label="Colour"
  @change:text="error = $event.target.badInput ? 'Enter a colour' : ''"
/>
```

Every commit of typed text fires `change:text` with the text as typed.

## Alpha

Colours are opaque unless `alpha` is set. With it the panel gains an alpha
slider and an A channel, and the value carries alpha whenever it is below 1:
`#1f6feb80`, `rgb(31 111 235 / 0.5)`. An opaque colour is written the same
with or without `alpha`. Without it, alpha in typed text is dropped.

## The panel

The colour button at the field's trailing edge — painted with the current
colour — or Alt+ArrowDown in the input opens the panel. It is a dialog: focus
moves onto the colour area, and Tab cycles through the area, the sliders, the
original colour, the notation switch, the channel inputs and the swatches until
the panel closes. Focus returns to the input when it does.

| Key                    | In the colour area                                             |
| ---------------------- | -------------------------------------------------------------- |
| ArrowLeft / ArrowRight | Less / more saturation                                         |
| ArrowUp / ArrowDown    | More / less brightness                                         |
| Shift + arrow          | Ten steps                                                      |
| PageUp / PageDown      | Ten steps of brightness                                        |
| Home / End             | No / full saturation                                           |
| Enter                  | Close                                                          |
| Escape                 | Close; what was picked stays (the original colour restores it) |

A channel input commits on Enter or when it is left, clamped to its range;
text that is no number reverts. ArrowUp and ArrowDown nudge the channel by one
step, Shift by ten, and each nudge commits.

Every pick commits at once and the panel stays open, so a colour can be
tuned in several moves (on a narrow viewport picks wait for a Done button
instead; see [Narrow viewports](#narrow-viewports)). An empty field's panel
opens on the first swatch, or on white, without committing anything.

## Comparing with the original

When the panel opens on a colour, a strip under the sliders shows that
original colour on the left beside the colour being picked on the right, so
every change can be judged against where it started. Clicking the original —
or Enter or Space on it — restores it: in the anchored panel it commits like
any pick, and in the fullscreen panel it becomes the colour Done commits. An
empty field's panel has no comparison, and neither has a swatch-only panel.

## Drag events

A drag on the colour area or a slider updates the value as it moves: every
move fires `update:value` and `input`, so `v-model` follows the pointer, and
`change` fires once, when the pointer is released. Save on `change` to avoid
work on every move. A click, a key press, a channel entry and a swatch pick
fire all three at once.

## Swatches

`swatches` offers predefined colours under the picker. Each is a CSS colour,
or a `{ value, name }` object whose name is what assistive technology reads —
otherwise it reads the colour's spelling. Bind the array as a property:

```vue
<c-color-picker
  v-model="color"
  :swatches="[
    { value: '#1f6feb', name: 'Ocean' },
    { value: '#e5534b', name: 'Coral' },
  ]"
  label="Tag colour"
/>
```

The swatches are one Tab stop: the arrow keys move between them without
picking, and Enter, Space or a click picks. A swatch that names no colour is
skipped with a console warning.

## Swatches only

`swatches-only` limits the choice to the swatches. The field becomes readonly
and shows the picked swatch's colour and name; a click, Enter or Alt+ArrowDown
opens a panel of the swatches alone, and a pick commits and closes it, as in
`c-select`. Name every swatch in this mode — the name is what the field shows,
and a console warning says so when one is missing. A value set from outside
that matches no swatch is shown spelled in its notation.

## Texts

The panel's labels are English unless `texts` replaces them. Set them app-wide
with `applyDefaults({ 'c-color-picker': { texts } })`.

## Narrow viewports

On a viewport narrower than 760px the panel opens as a **fullscreen panel**: a
heading row with the field's `label` and a close button above the picker. The
panel ends in a Done button, and there picks wait in the panel instead of
committing: nothing is emitted until Done commits the colour and closes the
panel. The close button and Escape close the panel without a change, and so
does the window growing past 760px while it is open. Under `swatches-only`
there is no Done button: a pick commits and closes, as everywhere else.

## Related

`c-select` lists named choices of any kind; reach for it when the options are
not colours. The browser's own `<input type="color">` has no notation, alpha,
swatches or keyboard-operable panel.
