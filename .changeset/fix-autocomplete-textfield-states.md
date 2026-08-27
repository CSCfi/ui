---
'@cscfi/csc-ui': patch
'@cscfi/csc-ui-react': patch
---

Fix(c-autocomplete): anchor the items panel to the bottom of the field instead of the hint/error message area, and hide the list scrollbar.
Fix(c-text-field): the border no longer stays primary on a filled-but-blurred field, and `0` in a `type="number"` field counts as a value (floating label lifts).
Fix(c-select): the dropdown list opens flush under the field when `hide-details` is not set; list text uses the surface text token (was black in dark mode); new `menu`, `list` and `item` CSS parts, plus any `part` attribute inside a slotted `<c-option>` is exported through `c-select::part(<name>)`.
Feat(c-button-group): the default size is 44px tall (36px buttons in a 4px frame), level with a c-text-field.
Fix(c-status): the default (untyped) pill is neutral (`surface-muted` / `on-surface-muted`) instead of primary-tinted.
Fix(c-modal): the `root` part carries the same `rounded-csc-xl` corners as c-card.
Fix(c-card): the `root` part no longer clips overflow.
Fix(c-checkbox): the message area is reserved like c-input's so a validation error appearing at runtime causes no layout shift; `message` part is now that area.
Feat(c-login-button): new `image` slot (and `image-wrap` part) for custom logo markup instead of `src`.
Feat(c-select, c-text-field, c-autocomplete): `size="small"` renders a 36px field (new shared `CFieldSize` type; `c-input` gains the same `size` prop).
Docs: example demos render on the card surface by default; canvas-level components (c-card, c-main, navigation chrome, login card) opt into the c-main canvas via `<docs>surface: canvas</docs>` in the canon example.
