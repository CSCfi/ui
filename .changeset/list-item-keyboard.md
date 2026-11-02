---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-list-item` accessibility fixes:

- Enter and Space press a `ripple` item, firing `click` as a mouse click does;
  they used to play the ripple only.
- A link item (`href`) shows the focus ring on its link.
- `active` is announced as the current item (`aria-current`).
- A `disabled` link item stops being a link, so Tab no longer reaches it; the
  item no longer carries `aria-disabled`.
