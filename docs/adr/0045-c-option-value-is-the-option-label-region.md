---
status: accepted
---

# `c-option-value` is the option's label region

A slotted `<c-option>`'s label — what `c-select` and `c-autocomplete` show in
the closed field and in a tag, and what the autocomplete filter matches — is
its `name`, else the text of its first `<c-option-value>`, else its whole
text. `c-autocomplete` marks the runs of a label equal to the query with
`<mark part="match">`: inside the `c-option-value` of a slotted option, or in
an `items` entry's label. Slotted markup without the wrapper is never
rewritten.

## Context

`c-option-value` came from 3.x (Stencil, 2023) as a wrapper the consumer put
around an option's label text: `c-dropdown`'s autocomplete mode found it with
`querySelector('c-option-value')` and rewrote its `innerHTML` with the query
wrapped in `<mark>`, and marked `items`-mode names the same way. The 4.x port
kept the element, its registration, tag-map and React wrapper entries, the
`@subcomponents` declaration on `c-autocomplete` and a docs example promising
"match highlighting" — but not its consumer: ADR-0009 rebuilt
`c-autocomplete` on the Popover API and left the dropdown's query marking
behind, and ADR-0029 then deleted that machinery from `c-dropdown` as dead.
Nothing replaced it. The label both fields used was `name ?? textContent` of
the *whole* option, so wrapping text in `c-option-value` changed nothing and
content placed beside it still reached the tag; the element's docblock and
the escape-hatch CSS comments still described the 3.x contract.

The 3.x implementation also built an unescaped `new RegExp(query, 'gi')`, so
a query such as `c++` or `(` threw.

## Decisions

- **Restore the role rather than remove the element.** It is 3.x-authored
  public API that consumers migrate with; a documented subcomponent that does
  nothing is worse than either alternative.
- **One option-label chain in both fields**, `src/shared/optionLabel.ts`:
  `name` (property, else attribute — the option may not be upgraded when its
  parent reads it during mount) → the first `c-option-value`'s text → the
  option's own text, trimmed; callers keep the raw value as the last resort.
  An empty `name` counts as absent. The chain feeds the closed field, the
  tags, the filter's `option.label`, the `return-object` payloads and the
  dropdown's live status text, so the same option markup means the same thing
  in `c-select` and `c-autocomplete`; both declare `c-option-value` as a
  subcomponent.
- **Match marking lives on `c-autocomplete`** (only it has a query) and is
  vocabulary of its own: CONTEXT.md already uses *highlighting* for the
  virtual active row, so this is *marking*, and the part is **`match`** —
  `mark` is the row indicator's check glyph (ADR-0044).
- **The wrapper is the opt-in.** A slotted option with a `c-option-value`
  renders, while a query is typed, a clone whose wrapper content is rebuilt
  from DOM nodes (text runs and `<mark part="match">` runs — no string
  escaping); the consumer's element is never written to, and the wrapper's
  content is treated as plain text. An `items` entry's label is marked in the
  template. A slotted option *without* the wrapper renders its `outerHTML`
  verbatim: consumer markup is not rewritten by guesswork.
- **Literal, escaped, case-insensitive, every occurrence**
  (`src/shared/splitMatches.ts`): the query is regex-escaped and matched with
  the `i` flag on the original string (a lowercased `indexOf` drifts when case
  mapping changes a string's length); occurrences resolve left to right
  without overlap. Marking is independent of how the option passed the
  filter — a fuzzy `filter`, `external` mode, or a `name` that differs from
  the wrapper text can leave a row unmarked. 3.x behaviour, minus the throw.
- **Marks draw as an underline in the primary token**, `color: inherit`,
  transparent background, via the escape-hatch `[part='match']` rule (the
  slotted-row mark is `v-html`-injected, so no utility reaches it). A text
  decoration rather than 3.x's `box-shadow`: it survives the label region's
  `overflow: hidden` and forced-colors mode, and the UA `mark` default (black
  on yellow) is unreadable in dark mode.
- **The rows are derived, not rewritten in place**: a `renderedOptions`
  computed over `filteredOptions` and the query, so the query-independent
  option normalisation stays cacheable and a `pointermove` re-render does not
  clone every row.

## Considered alternatives

- Removing the element, its registration, tag-map / React entries and docs
  example, with a migration note. Rejected: it deletes a 3.x authoring
  contract to save a trivial helper, and the label narrowing it enables is
  useful in its own right.
- Marking every slotted option's text whether or not it has the wrapper.
  Rejected: it would rewrite arbitrary consumer markup, and it removes the
  only reason for the wrapper to exist.
- Marking through `c-dropdown` for `c-select` too. Rejected: `c-select` has
  no query; the marking follows the query, not the list.

## Consequences

- `c-autocomplete` gains the `match` part; the `CAutocompleteOption.label` a
  custom `filter` receives follows the new chain.
- A slotted option whose label was previously "its whole text" narrows to the
  wrapper's text when it contains a `c-option-value` — the change consumers
  asked the wrapper for; without the wrapper nothing changes.
- The option observers also watch `characterData`, so a `{{ text }}` change
  inside a wrapper re-derives the label.
- ADR-0009's consequence about `c-dropdown`'s unused autocomplete mode is
  amended: the query marking is back, on `c-autocomplete` itself.
