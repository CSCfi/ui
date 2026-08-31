---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix `hide-details` being silently overridden on `c-select` and
`c-autocomplete`: the dropdown restored its own stale snapshot of the
setting onto the field when it closed — which also ran on an initial
`v-model` value arriving at mount — permanently re-showing the message
area. The dropdown now captures the field's state when it opens and puts
exactly that back on close.
