---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix(c-select): the picked option's row ends in a check mark, as in
c-autocomplete — for slotted options and `items` alike. The mark follows the
value, not the keyboard highlight.

Fix(c-select): a value set from code (an initial `v-model`, say) now marks its
option like a click does, and opening the list with the mouse highlights the
picked option, so the arrow keys continue from it instead of the first row.
