---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

`c-button` and `c-icon-button` have an `appearance` prop: `filled` (the
default), `outlined`, `ghost` or `text`. It replaces the `outlined`, `ghost`
and `text` boolean attributes, which are deprecated: they keep working until
5.0, and `appearance` wins when both are set.

```html
<c-button appearance="outlined">Cancel</c-button>
```
