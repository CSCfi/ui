---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

No boolean prop defaults to `true` any more (ADR-0076), so markup can set
every one of them: an absent attribute means `false`.

- `valid` is renamed `invalid`, with the opposite meaning, on every field,
  `c-checkbox`, `c-radio-group`, `c-otp-input`, `c-message` and
  `c-file-upload`: `:valid="!error"` becomes `:invalid="!!error"`, and a bare
  `invalid` attribute now shows the error, where `valid="false"` showed none.
  A leftover `valid` is ignored.
- `c-loader`'s `visible` is renamed `hide` (its 3.x name), with the opposite
  meaning; its `show()` and `hide()` methods are removed — set `hide`.
