---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Typing into a closed `c-autocomplete` or `c-tree-select` field now opens the
panel with every typed character in its search input. Before, the first
character could be lost (typing `finland` searched for `inland`), and fast
typing could drop more. After such an open the highlight lands on the first
match, as it does when typing into the open panel.
