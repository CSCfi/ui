---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

The `open` property of `c-menu`, `c-popover` and `c-tooltip` follows the
panel: it reads `true` while the user has the panel open and `false` once they
close it, and setting it to `true` again reopens a panel the user closed. It
used to keep the page's last value, so that second write did nothing.
