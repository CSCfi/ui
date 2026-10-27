---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-card-content` and `c-login-card-content` no longer nest a second
`<article>` inside the card's, and the `c-card-actions` and
`c-login-card-actions` rows are no longer announced as lists of actions they
did not contain as list items.
