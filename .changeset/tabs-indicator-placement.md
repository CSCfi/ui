---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

The `c-tabs` underline sits under the selected tab again. In 4.0.0-rc.1 it
was shifted by the tab set's distance from the edge of the page. It also no
longer stays under the previous tab when a tab is picked just after the tab
set appears or resizes, or on an overflowing row with `disable-animation`.
