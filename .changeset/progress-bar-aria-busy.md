---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix `c-progress-bar`'s inverted `aria-busy`: the host now reports
`aria-busy="true"` only while the bar is indeterminate, instead of the
opposite. A determinate bar's value updates are no longer marked as content
assistive technology should defer.
