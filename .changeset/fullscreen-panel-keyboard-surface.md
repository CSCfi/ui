---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix the fullscreen panel of `c-autocomplete`, `c-tree-select` and `c-select`
uncovering the page while the on-screen keyboard is open: the panel keeps
covering the whole screen, and only its content — the heading row, the search
input and the options — shrinks to the space the keyboard leaves.
