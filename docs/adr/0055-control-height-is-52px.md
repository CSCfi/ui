# 55. The control height is one shared 52px value

Date: 2026-09-17

## Status

Accepted

## Context

The row-level controls a form or toolbar lines up did not share a height. The
`default` field box of `c-input` — behind `c-text-field`, `c-select`,
`c-autocomplete` and `c-tree-select` — was 44px, and so was the `default`
`c-button` (with `large` at 52px) and the `c-button-group` frame; `c-tab` was
52px. `c-tree-select` shows a two-line value (the item's **path** above its
code and label, ADR-0047), which needs 52px, so the field grew from 44px to
52px the moment a value was committed, and a tree-select beside a text field
in one row was 8px taller than its neighbour.

Three ways out were weighed: fold the tree-select's path out of the field so it
fits 44px (loses the path where the user reads the value); reserve 52px for the
tree-select alone (a permanently uneven row); or raise every control to 52px.

## Decision

The **control height** is 52px, held in one shared theme spacing value
(`--spacing-control`) that the `default` field box, the `default` button, the
button-group frame and the tab all read — never a per-component literal. The
button scale settles at 28 / 52 / 60: `small` stays 28px, `default` rises to
52px and `large` rises to 60px, the toolbar height, so the two upper steps stay
distinct. The `small` field box stays 36px.

## Consequences

- Every form row and toolbar built on the library is 8px taller per control;
  consumers who aligned their own elements to 44px must re-align.
- A `c-button-group` keeps its frame at the control height, so the buttons
  inside it are now 44px (the old default).
- Every field and button visual baseline is re-authored.
- The tree-select's field no longer changes height on selection; the two-line
  value block is centred in the 52px box.
