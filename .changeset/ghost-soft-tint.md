---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Redesign the ghost variant per the "soft tint" ghost design: instead of the
solid `primary-subtle` slab (which read as a third solid style and barely
separated from dark surfaces), ghost buttons now rest on an 8% `primary`
wash that deepens to 15% on hover and 22% while pressed, with the `primary`
text color carrying the accent. Applies to `c-button` and `c-icon-button`
`ghost` variants; the `c-accordion-item` header adopts the same treatment
(soft-tint fill ladder, `primary` text and chevron, hairline border removed)
so accordions match ghost buttons. The `text` and `outlined` variants of both
buttons adopt the same 15% `primary` hover wash, replacing the old
`primary-subtle-hover` / `primary-subtle` hover fills, so all three quiet
variants share one hover treatment. Focus keeps the offset outline ring.
