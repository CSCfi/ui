# 59. Input masks conform typed text and the value carries the masked text

Date: 2026-09-29

## Status

Accepted

Extends ADR-0057 (the date picker's typing, not its parsing or commit).

## Context

Consumers want typed text shaped as it is typed — phone numbers, postal
codes, account numbers, dates. Of the `c-input` family only `c-text-field` and
`c-date-picker` hold typeable text (`c-select`, `c-autocomplete` and
`c-tree-select` have readonly value fields). The library had no masking; the
date picker's `format` only displayed and parsed on commit.

## Decision

- `c-text-field` takes a `mask` pattern string: `#` a digit, `A` a letter,
  `*` either, `\` escapes, anything else a literal. One fixed-length pattern —
  no arrays, custom tokens or functions — so it works as an attribute.
- A mask may end in **optional sections** in brackets (`+358 #####[#######]`
  is 5–12 digits, `#####[-####]` a ZIP code). Each token inside is optional
  on its own, so a section may stop part-way; the field is **complete** once
  the required tokens are filled. Sections are trailing only and unnested:
  any other bracket use makes the mask invalid, and an invalid mask is
  ignored with a `console.warn` — the library's first runtime warning, since
  a broken mask has no sensible fallback.
  Applies only to single-line `text`, `tel` and `search` fields (the other
  types expose no caret).
- The value is the **masked text as shown**. A read-only `unmaskedValue`
  gives the token characters alone. No new event: handlers read it off the
  host.
- Literals are inserted **lazily**, when the next token character arrives;
  a typed literal is consumed as that literal, so formatted paste works.
- A **mask guide** shows the rest of the mask — `_` per unfilled token,
  literals as themselves — as faint, `aria-hidden` text stacked behind the
  input in one grid cell, drawing only the required remainder. It shows where a placeholder would (once the
  floating label is out of the way), and a consumer `placeholder` replaces
  it. Lazy literals stay: the guide shows the prefix without it entering the
  text or the value.
- Incomplete text is kept as typed and reported as a fact — `maskComplete`
  and `:state(incomplete)` — never as an error, like **bad input**.
- A programmatic `value` is shown conformed but never emitted; the model
  keeps what the consumer set until an edit.
- `c-date-picker` masks typing from its `format`, always on: day and month
  take one or two digits and close early on a typed separator or a first
  digit no two-digit value starts with; a typed `. / - space` shows as the
  format's separator. Pastes are left unmasked for the lenient commit —
  masking text in another field order can scramble it into a real, wrong date.
- One engine, our own, in `src/shared/inputMask.ts`.

## Alternatives considered

- **The value carries the unmasked characters**: the value then differs from
  what the user sees, and literals that carry meaning are lost.
- **Eager literals** (a separator appears as soon as the slot before it
  fills): Backspace must learn to skip literals, and values can end in a
  dangling separator.
- **A guide as real text in the input** (`___ ___` typed into the field,
  or the prefix inserted on focus): screen readers read the underscores, the
  display and the value disagree while empty, and it fights the floating
  label. The overlay guide keeps the hint visual only.
- **Repeat counts (`#{5,12}`)**: no separators inside the run.
- **An optional-token character** (a `9` for an optional digit): verbose for
  long runs, and it takes another character away from literals.
- **Optional parts anywhere**: `[#]##` makes the fill ambiguous — greedy
  filling leaves required tokens empty, and redistributing needs
  backtracking.
- **All-or-nothing sections**: a variable-length run would need a chain of
  one-token sections; a consumer who needs all-or-nothing checks the length
  of `unmaskedValue`.
- **Maska / imask**: neither models the date-part rules; imask is heavy and
  brings a competing value/unmask model; either would still need wrapping for
  our caret and v-model hazards.
- **A `change:unmasked` event**: redundant with reading `unmaskedValue` in
  the existing value events, and more API for the React wrapper.

## Consequences

- A masked field's model and display can differ after a programmatic set
  that does not fit the mask; `usage.md` tells consumers to pass masked
  values.
- `c-date-picker`'s bad input can no longer contain letters when typed, only
  when pasted.
