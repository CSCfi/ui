# 76. No boolean prop defaults to true

Date: 2026-10-23

## Status

Accepted. Lands before `4.0.0-rc.1`.

## Context

`valid` defaulted to `true` on fourteen tags, every field included. An HTML
boolean attribute means "absent is false", so markup could never turn it off:
removing the attribute restores the default, and Vue keeps `valid="false"` as
the truthy string `"false"`. `c-input` reads `!props.valid`, so
`<c-text-field valid="false" error-message="…">` in plain HTML or a static
Angular attribute showed no error. Stencil 3.x parsed `"false"` as false, so
upgraded templates broke silently. `c-loader`'s `visible` and
`c-side-navigation-item`'s `focusable` had the same shape.

## Decision

- Every boolean prop defaults to `false` and is named for the non-default
  state: `valid` becomes `invalid` (matching `aria-invalid`), `c-loader`'s
  `visible` becomes `hide` (its 3.x name; its `show()`/`hide()` methods go), and
  `focusable` becomes internal wiring on both side-navigation items.
- The strict analyzer fails any boolean prop whose built-in default is `true`.

## Considered options

- **`hidden` for c-loader.** Rejected: it is the HTML global attribute
  (`boolean | "until-found"` on `HTMLElement`), so the prop would shadow it and
  the React wrapper would need a type-collision entry; 3.x already called it
  `hide`.
- **Keep `valid` and coerce `"false"`** through `coerceBoolean`, as Stencil
  did. No migration, but removing the attribute still could not turn validity
  off, and the pattern would stay in the frozen API.

## Consequences

- Every `:valid="x"` becomes `:invalid="!x"`; the migration guide says so.
