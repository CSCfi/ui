---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

Type changes:

- `CPlacement` is split into `CMenuPosition`, `CPopoverPosition` and
  `CTooltipPosition`, each owned by its component; the unions are the same.
- The package-level types take the `C` prefix every other exported type has:
  `CFamily`, `CThemeSeeds`, `CThemeMode`, `CAppDefaults`, `CDefaultableTag`,
  `CChartAnatomy` and `CChartSlots`.
- `c-accordion`'s value type is exported as `CAccordionValue`.
- Numbers that took `number | string` are `number`: `distance` on `c-menu`,
  `c-popover` and `c-tooltip`, `c-tooltip`'s `delay` and `c-steps`' `value`.
  Attributes still work (`value="3"` reads as `3`).
- `c-progress-circle`'s `width` is renamed `thickness`.
