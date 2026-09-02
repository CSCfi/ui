A single radio option inside a `c-radio-group`: a native radio input whose
default slot is its clickable, announced label.

Author one `c-radio` per option, with a unique `value` and the option's
label content in the default slot. Selection state belongs to the group —
a radio has no checked prop; set the group's `value` (or `v-model`)
instead.

```html
<c-radio value="paid">Paid</c-radio>
```

Set `disabled` to exclude a single option while the rest of the group stays
operable.

## Events

Selecting a radio fires a `change` event carrying its `value`. The event
bubbles (composed) so it can be heard on the radio, on the surrounding
`c-radio-group`, or further up — with the radio as the event target.

## Standalone

Outside a group a radio still renders and operates — it can be selected but
never unselected, like a native radio without siblings. Grouping behavior
(exclusivity, arrow-key navigation, form value) requires the parent
`c-radio-group`.

## Customization

Restyle via CSS parts from your own stylesheet. The `indicator` part is the
radio ring; the selection dot is its `::after` pseudo-element and the keyboard
focus ring its `::before`. Ring, dot and focus ring all draw with
`currentColor`, so `color` recolours the whole indicator, focus ring included.
The host exposes the `checked` and `disabled` custom states (both also cover
group-driven selection and disabling):

```css
c-radio:state(checked)::part(indicator) {
  color: var(--my-green);
}
```

For app-wide recolouring prefer the design tokens (`--c-primary` seed) over
per-component rules.
