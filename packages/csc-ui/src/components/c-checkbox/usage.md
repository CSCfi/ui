A form control for a single on/off choice: a native checkbox with a label,
an optional hint, and validation messaging.

Bind the state with a plain `v-model` (or the `checked` prop); `true-value` /
`false-value` map the checked state onto custom values. Set `indeterminate`
for the mixed "some but not all" state of a parent checkbox.

```html
<c-checkbox v-model="accepted" label="I accept the terms" />
```

Set `hint` for a persistent helper line below the control; while `valid` is
`false`, `error-message` replaces it. `hide-details` removes the message area
entirely.

## When to use

- A single independent yes/no choice (consent, feature toggle in a form).
- A list where several options can be selected at once.

## When not to use

- Choosing exactly one of several options — use `c-radio-group`.
- Switching a setting that takes effect immediately — use `c-switch`.

## Customization

Restyle via CSS parts from your own stylesheet. The `indicator` part is the
checkbox box and `mark` is the check glyph inside it. The indicator's border,
its checked fill and its keyboard focus ring all draw with `currentColor`, so
one `color` recolours the three together; the host exposes the `checked` and
`indeterminate` custom states, so the box is also stylable per state:

```css
/* Border, checked fill and focus ring follow `color`. */
c-checkbox::part(indicator) {
  color: var(--my-green);
}

/* The mark draws with currentColor too — recolour it via `color`. */
c-checkbox:state(checked)::part(mark) {
  color: black;
}

/* Finer control still works per property and per state (the focus ring
   keeps following `color`, not these). */
c-checkbox:not(:state(checked))::part(indicator) {
  border-color: gray;
}
```

For app-wide recolouring prefer the design tokens (`--c-primary` seed) over
per-component rules.
