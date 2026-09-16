---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Side navigation sub-items paint their hover, active, indicator bar and focus
ring as translucent washes of the `on-nav-active` ink of the pill they sit in
(ADR-0052). They still carried page roles — `surface-raised`, the primary
tint — which in dark mode made the selected sub-item a grey slab at 2:1 inside
the teal drawer and its hover states near-invisible.
