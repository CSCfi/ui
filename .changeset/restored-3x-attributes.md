---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

The attribute names 3.x markup used work again (they had been replaced
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
