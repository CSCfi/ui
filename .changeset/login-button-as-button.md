---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-login-button` without an `href` is a native button, which Enter and Space
press; it used to be a focusable link with no `href` that Enter did not
activate. With an `href` it is a link, as before.
