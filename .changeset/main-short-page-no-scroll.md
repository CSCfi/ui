---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-main`: a page that fits the viewport no longer scrolls. The desktop drawer,
sized to its pinned height, used to add the banner's and a `static` toolbar's
height to the dashboard layout, so a short page could scroll by that much and
hide the toolbar (also inside a bounded shell). The drawer now adds nothing to
the layout and still fills the viewport once pinned. Content that paints below
`c-main`'s bottom edge is clipped instead of extending the document, and the
dashboard grid is laid out inside `::part(root)` rather than on it.
