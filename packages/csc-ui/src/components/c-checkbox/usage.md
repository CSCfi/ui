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
checkbox box and `mark` is the check glyph inside it; the host exposes the
`checked` and `indeterminate` custom states, so the box is stylable per
state:

```css
c-checkbox:state(checked)::part(indicator) {
  background: var(--my-green);
  border-color: var(--my-green);
}

c-checkbox:not(:state(checked))::part(indicator) {
  border-color: gray;
}

/* The mark draws with currentColor — recolour it via `color`. */
c-checkbox:state(checked)::part(mark) {
  color: black;
}
```

For app-wide recolouring prefer the design tokens (`--c-primary` seed) over
per-component rules.
