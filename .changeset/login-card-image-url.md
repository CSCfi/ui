---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-login-card` shows an image whose `src` contains parentheses, quotes or
spaces, as a data URI often does; such an image used to be dropped.
