---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Pin a theme mode to part of a page. `data-theme="light"` or `"dark"` now works
on any element, not just `<html>`: that element and everything inside it resolve
the semantic tokens in that mode, whatever the rest of the page is doing. Scopes
nest and the nearest one wins, the mode carries into shadow roots and into
top-layer panels, and a single component works too — `<c-button data-theme="dark">`.
A scope re-points colours and paints nothing, so give a container `bg-surface`
and `text-on-surface` to make it draw the mode it pins.

New `observeThemeMode(element, callback)` reports the mode in effect for an
element and follows it — a `data-theme` flip on any ancestor, or the OS
preference changing. `themeMode(element)` now resolves the nearest scope rather
than only the element you hand it, which is what a chart inside a pinned panel
needs.

The mode blocks now also set `color-scheme`, so UA chrome — scrollbars, textarea
resize grabbers, autofill, date pickers — follows the pinned mode instead of the
OS. This also fixes dark mode at the document root, where that chrome rendered
light.

Only `light` and `dark` pin a mode; any other value is now ignored rather than
treated as light. If you set `data-theme` on `<html>` to something else, it
previously rendered light and now follows the OS preference. A hand-written
`:root { --c-<role>: … }` override no longer applies inside a scope — write
`:root, [data-theme]` to cover both. Seed overrides via `applyTheme` are
unaffected.
