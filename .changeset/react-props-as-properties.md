---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`@cscfi/csc-ui-react` components now set object, array and function props on
the element as properties. Before, `columns`, `data`, `items`, `texts`, render
functions and the like reached the element as `[object Object]` attributes,
so a `CDataTable`, `CSelect` with `items` or any `texts` override did not
work in React.
