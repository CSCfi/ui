A slider for picking a number from a range by dragging a thumb along a track,
with a label, a value bubble and optional tick marks.

Set the range with `min`, `max` and `step` (0, 100 and 1 by default) and bind
the value:

```vue
<c-slider v-model="volume" label="Volume" unit="%" />
```

## When to use

- Picking a value in a bounded range where the position on the track helps
  the user judge it: a volume, a percentage, a small count with tick marks.
- For an exact number, or a range too wide to drag through precisely, use
  `c-number-field`.

## Value

The value is a number between `min` and `max`. While the thumb is dragged,
`update:value` and `input` fire on every move; `change` fires once, on the
release that ends the drag, and on each key press that moves the thumb. Save
or fetch on `change` rather than on every move:

```vue
<c-slider
  :value="cores"
  label="CPU cores"
  max="8"
  @change="cores = $event.detail"
/>
```

Setting `value` moves the thumb and fires nothing. Set one: the built-in
default is `50` whatever `min` and `max` are, held within them, so a slider
with `max="8"` and no value starts at 8.

`name` is passed to the inner range input, but the component is not
form-associated, so the value does not submit with a `<form>`.

## Value bubble and unit

While the slider is hovered, pressed or focused, a bubble above the thumb shows
the value followed by `unit`, written with as many decimals as `step` has and
the separators of the page's `lang` (`2,5` for `fi`, `2.5` for `en`). The unit
is appended as written, so include a space where one belongs (`unit=" GB"`).
Set `disable-tooltip` to turn the bubble off.

## Tick marks

`ticks` draws marks along the track, dividing it into `segments` equal parts
(ten by default) from `min` to `max`, and `labels` writes a number under each
mark, formatted like the bubble's. The marks are
independent of `step`: for a mark on every value, match `segments` to the
range.

```html
<c-slider label="Cores" max="8" segments="8" value="2" labels ticks></c-slider>
```

## Accessibility

The control is a native `<input type="range">`, so it is announced as a slider
and works from the keyboard: the arrow keys move it one `step`, Home and End
jump to `min` and `max`. The value is announced with its `unit`.

Name it with `label`, which renders a visible label for the range input.
Without a visible label, set `aria-label` on the `c-slider` element; it names
the range input instead. The bubble, the marks and their numbers are hidden
from assistive technology.

## Customization

Restyle via CSS parts: `::part(root)` wraps the label, the range input and the
track; `::part(label)` is the label; `::part(ticks)` is the visible track under
the thumb, carrying the fill and the tick marks. The thumb and the fill paint
the primary role, and a `disabled` slider greys them out; re-theme through the
tokens.
