---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

c-option-value is the option's label region again (ADR-0045). In c-select and
c-autocomplete a slotted option's label — the closed field's text, its tag in
`multiple` mode, what the autocomplete filter matches — is its `name`, else
the text of its `c-option-value`, else the option's whole text, so an option
can carry a description or an icon beside its label. c-autocomplete marks the
runs of each label that equal the typed query with `<mark>` again, inside the
`c-option-value` of a slotted option or in an `items` entry's label; an option
without the wrapper renders exactly as authored. The marks are the new `match`
part (`c-autocomplete::part(match)`), and the query is matched literally, so
`c++` or `(` no longer throw as they did in 3.x.
