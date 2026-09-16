---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Side navigation sub-items paint their hover, indicator bar and focus ring as
translucent washes of the `on-nav-active` ink of the pill they sit in, and the
active fill with the new `nav-sub-active` semantic role: the white pill light
mode always had, an 18% `on-nav-active` wash in dark mode (ADR-0052). They
still carried page roles — `surface-raised`, the primary tint — which in dark
mode made the selected sub-item a grey slab at 2:1 inside the teal drawer and
its hover states near-invisible.
