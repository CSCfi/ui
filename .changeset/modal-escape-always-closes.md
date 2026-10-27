---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

Escape closes every `c-modal` again, as in 3.x and as on a native dialog.
`dismissable` now governs only the backdrop click: a non-dismissable modal
still nudges when the backdrop is clicked, but no longer when Escape is
pressed. Any modal can therefore close itself: a page that sets `value`
one way (`:value="open"`) must also listen for `change` or use `v-model`,
or its state stays open and setting it to `true` again does nothing.
