---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

Names that now follow the library's glossary:

- `c-alert`: `dismissible` → `closeable`, the `dismiss` event → `close`
  (`onClose` in React) and the `dismiss` part → `close`, as on every other
  closeable component. `type` drops `'default'`: leave it unset for the
  neutral look, as on `c-status`. `CAlertIconType` is no longer exported.
- `c-accordion-item`: the `header` slot → `heading`, like the `heading` prop.
  A leftover `slot="header"` renders nothing.
- `c-loader`: `contentdelay` (seconds) → `content-delay` (milliseconds):
  `contentdelay="1"` becomes `content-delay="1000"`.
- `c-data-table`: the `selectAllItems` text → `selectAllRows`.
