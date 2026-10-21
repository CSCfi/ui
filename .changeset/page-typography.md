---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Components inherit the page's typography (ADR-0072). Every component used to
reset its font to the operating system's and its line height to 1.5, so text
slotted into `c-main`, cards and other components ignored the app's font, and
nested parts such as `c-select`'s option list could not be reached from the
page at all. Components now take the page's font family, line height and font
features, as native elements do, and no longer declare Tailwind theme
variables (`--font-sans`, `--spacing`, …) that made an app's own Tailwind
utilities read csc-ui's values inside components. The `--c-font-family` token
is removed: set your font on `body`, or `font-family` on a `c-*` element to
give one component another typeface. A page that sets no font now shows
components in the browser default.
