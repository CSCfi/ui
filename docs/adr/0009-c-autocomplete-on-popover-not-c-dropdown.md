# c-autocomplete builds on the popover + anchor pattern, not c-dropdown

`c-select` (migrated) renders its options through `c-dropdown`, a `<dialog>`
that opens modally and *moves the field into the dialog* — there the field
itself is the search box. The new `c-autocomplete` instead keeps a readonly
value field in place and shows a popover panel below it containing a dedicated
search input above the options (per the design reference). We build it on the
Popover API + CSS anchor positioning (the same mechanism as `c-menu`,
ADR-0008) rather than reusing `c-dropdown`, because `c-dropdown`'s
field-moves-into-the-dialog structure cannot produce a separate in-panel search
input without a rewrite.

## Consequences

- Keyboard/a11y is reimplemented as an **editable combobox** (DOM focus stays
  in the search input; options are highlighted virtually via
  `aria-activedescendant`, not real focus as `c-dropdown` uses). This is the
  correct pattern when a persistent text input is present.
- `c-dropdown`'s existing `type="autocomplete"` mode (query highlight, empty /
  minimum-query messages) goes unused by this component; it remains for any
  future dialog-style autocomplete. *(Amended by ADR-0029 (2026-08-19): async
  data is now `c-autocomplete`'s external mode, foreclosing that future — the
  unused machinery is deleted from `c-dropdown`.)*
- Some positioning/empty-state logic is duplicated rather than shared. Accepted
  as the cost of matching the reference UX and the ADR-0008 popover direction.
