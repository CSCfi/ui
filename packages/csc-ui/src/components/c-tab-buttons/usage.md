Tab buttons present a `c-tabs` tab list as a segmented control instead of
the underlined tab row. Author it only inside `<c-tabs>`, with plain
`<c-button>` children whose `value`s match the `c-tab-item` panels; `c-tabs`
owns the active value and pushes it down.

This component carries no form semantics — no `label`, `required`, or
`mandatory` — and the selection cannot be toggled off: a tab strip always
has an active tab. The sliding indicator that glides to the active tab is
this component's own affordance. For a standalone segmented control that
holds a form value, use `c-button-group` (which this component wraps
internally); there, active buttons paint their own fill and nothing slides.

A tab strip is always one row. When it is wider than its box it scrolls
sideways — by touch, by a mouse drag, by the wheel, or with the edge arrows
that appear while it overflows — and the tab `c-tabs` makes active is
scrolled into view. The scrollbar is hidden; the half-visible tab at the
edge and the arrows are the cue. This is the same rule as the underlined
tab row of `c-tabs`.
