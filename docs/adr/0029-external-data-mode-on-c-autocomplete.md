# 29. c-autocomplete async data via an external mode, not a component-owned fetcher

Date: 2026-08-19

## Status

Accepted

Amends ADR-0009 (deletes the c-dropdown autocomplete machinery its
consequences kept in reserve).

## Context

The 4.0 c-autocomplete owns filtering: it narrows `items` against the query
typed into the search input and never exposes that query. The Stencil-era
(3.x) component was the exact inverse — it filtered nothing and shipped a
`query` prop, a `changeQuery` event and `minimum-query-length(-message)`
props, which is how consumers drove server-backed option lists. That
workflow was deliberately cut in the 4.0 design and is needed back:
consumers must be able to fetch options from an API as the user types.
Within 4.x the library already has one externally-driven data contract:
c-data-table's `external` prop ("the server owns sorting, pagination and
filtering: the table renders `data` verbatim and only emits the state-change
events").

## Decision

Async option data is supported by extending c-autocomplete with the same
external contract rather than teaching the component to fetch:

- An `external` boolean prop turns internal filtering off; `items` render
  verbatim and `filter` is ignored.
- A `change:query` event (all-lowercase per ADR-0017, so no kebab twin per
  ADR-0021) carries the query string. It emits in **both** modes, on every
  keystroke and — unconditionally — with an empty string when the panel
  opens (the query always resets on open), which is what triggers loading
  the default list without any mount-time hook.
- The component ships **no debounce and no minimum query length**: pacing
  and gating requests is the consumer's code, demonstrated in the docs
  example. This keeps the component dumb and avoids double-debouncing
  consumers who already pace their requests.
- The closed field's label no longer depends on the current option list
  alone: it resolves from the options, then a label remembered at commit
  time, then the value object's `name` (`return-object`), then the raw
  scalar — so a fetch that no longer contains the selection cannot blank
  the field.
- While `loading`, the panel suppresses the no-results row, keeps the
  current options rendered during a refresh, and shows a loading row only
  when it has nothing to display.

Alternatives rejected: a Vuetify-style `no-filter` prop (foreign vocabulary;
the library already says *external*), and an `itemsSource: (query) =>
Promise<items>` function prop (functions cannot be set as attributes, which
is hostile to the no-build TypeScript and Angular flavors, and would pull
fetch lifecycle, debounce and race handling into the component).

## Consequences

- One vocabulary for consumer-owned data across the library: `external` +
  `change:*` events, on c-data-table and c-autocomplete alike.
- ADR-0009 kept c-dropdown's `type="autocomplete"` machinery (query
  highlight, empty / minimum-query messages) "for any future dialog-style
  autocomplete". That future is now foreclosed by this contract; the dead
  machinery is deleted from c-dropdown.
- Internal-mode consumers also receive `change:query` (including the empty
  string on every panel open); it is informational there.
- Consumers must handle request pacing and stale-response ordering
  themselves; the docs example carries the canonical debounce + request-id
  idiom.
