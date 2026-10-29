---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Text now meets WCAG AA contrast (4.5:1) in both theme modes:

- Light mode: hints, placeholders, resting field labels and other secondary
  text (`on-surface-muted`, `on-surface-faint`) darken from `tertiary-500` to
  `tertiary-600`. Chart axis labels (`chart-axis`) follow.
- Dark mode: `error` moves to `error-300`, so error messages read on raised
  surfaces. A danger button's hover (`error-hover`) moves to `error-200` to
  stay distinct.
- An expanded `c-accordion-item` heading uses `on-primary-subtle`, the ink
  paired with its tinted background.
- Disabled `c-button` and `c-icon-button` text uses `on-surface-disabled`, as
  disabled options and days already do. It would otherwise have darkened with
  the hint text and read as enabled.
