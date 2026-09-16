---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Dashboard layout scrolls the document (ADR-0051):

- `c-toolbar` is pinned with CSS sticky instead of `position: fixed`, drops its
  spacer, and gains a `static` prop that keeps it in the page flow so it scrolls
  away with the content. The `class="relative"` host-class switch is removed;
  use `static`.
- `c-main` grows with its content instead of clamping to the viewport, and pins
  the desktop `c-side-navigation` beneath the toolbar (or to the top edge when
  the toolbar is static) with an inner scrollbar. No consumer markup needed.
- New `banner` slot on `c-main`: a full-width strip above the toolbar that
  scrolls away with the page; the toolbar pins to the top edge once it is gone.
- `c-page` is no longer a scroll container: no fixed height, no own scrolling.
  `scroll-indicator` tracks the document. Code that read or set c-page's scroll
  offset must target the window; smooth scrolling is the document's
  (`html { scroll-behavior: smooth }`).
- The toolbar height is the shared `--spacing-toolbar` theme value (60px)
  instead of a literal.
