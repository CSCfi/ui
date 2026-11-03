---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

`c-toasts` has a `position` attribute — `bottom`, `bottom-start`,
`bottom-end`, `top`, `top-start` or `top-end`, the words the menus and
popovers use — and a `contained` boolean that keeps the stack inside its
nearest positioned ancestor. They replace `vertical` + `horizontal` and
`absolute`, which are deprecated and keep working until 5.0; the new ones win
when set.

```html
<c-toasts position="top-end"></c-toasts>
```
