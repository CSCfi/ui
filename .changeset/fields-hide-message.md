---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

The form fields have a `hide-message` attribute, named after the `message`
part it removes: the hint and error message under the field, and the room
they keep. It replaces `hide-details`, which is deprecated and keeps working
until 5.0; `hide-message` wins when both are set. This covers `c-text-field`,
`c-number-field`, `c-select`, `c-autocomplete`, `c-tree-select`,
`c-date-picker`, `c-time-picker`, `c-color-picker`, `c-file-upload`,
`c-checkbox`, `c-radio-group` and `c-otp-input`. `applyDefaults()` takes
`hideMessage` as well, and an element's own setting under either name beats
an app default under either name. `c-pagination` and `c-progress-bar` keep
`hide-details`, which hides their `details` part.
