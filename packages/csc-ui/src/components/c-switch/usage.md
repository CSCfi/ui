A toggle for a binary setting that takes effect immediately: a native
switch control with a label, an optional hint, and validation messaging.

Bind the state with a plain `v-model`: `value` is `true-value` while the
switch is on and `false-value` while it is off (`true` and `false` unless you
map them onto custom values). `checked` is the same state as a boolean —
setting it sets `value`, and a `checked` attribute sets the initial state when
no `value` is bound.

```html
<c-switch v-model="notifications">Email notifications</c-switch>
```

## When to use

- Turning a setting or mode on/off with immediate effect (no submit step).

## When not to use

- A choice that is collected and submitted with a form — use `c-checkbox`.

## Customization

Restyle via CSS parts from your own stylesheet. The `slider` part is the
toggle track (its `::before` pseudo-element is the handle); the host exposes
the `checked` custom state, so the track is stylable per state:

```css
c-switch:state(checked)::part(slider) {
  background: var(--my-green);
}

c-switch:state(checked)::part(slider)::before {
  background: white;
}
```

For app-wide recolouring prefer the design tokens (`--c-primary` seed) over
per-component rules.
