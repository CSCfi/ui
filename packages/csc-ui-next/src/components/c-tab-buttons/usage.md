Tab buttons present a `c-tabs` tab list as a segmented control instead of
the underlined tab row. Author it only inside `<c-tabs>`, with plain
`<c-button>` children whose `value`s match the `c-tab-item` panels; `c-tabs`
owns the active value and pushes it down.

This component carries no form semantics — no `label`, `required`, or
`mandatory` — and the selection cannot be toggled off: a tab strip always
has an active tab. For a standalone segmented control that holds a form
value, use `c-button-group` (which this component wraps internally).
