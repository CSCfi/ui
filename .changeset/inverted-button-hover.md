---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

An inverted filled `c-button` or `c-icon-button` stays light under the pointer.
Its hover was see-through, so on the dark backdrop an inverted button sits on,
its label nearly vanished; the hovered white now takes a little of the
variant's colour instead.
