---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

Fixes and clean-ups that change the API:

- `target` defaults to `''` on `c-button` and `c-list-item`, as on a native
  `<a>`: an `href` opens in the same tab. Add `target="_blank"` where you
  relied on a new tab. Space on a `c-button` link now clicks it like Enter,
  instead of opening a new window.
- `c-slider`'s `value`, `min`, `max`, `step` and `segments` are numbers, and
  its events carry numbers; `unit` defaults to no unit (add `unit="%"`).
- `hidden` now hides any `c-*` element, as it hides any element.
- `c-table`'s `updateMobileLabels()` is documented and typed.
- `c-progress-bar`'s `label` names the progress bar for assistive technology.
- `c-navigation-button` has an accessible name, "Menu" by default, set with
  `texts.label` (also as an app default).
- `c-tabs`' overflow arrows are named, and `c-sub-navigation-item` no longer
  reads ", Current page" after the current item (`aria-current` says it).
- `c-color-picker` no longer lists the unused `separator` part.
