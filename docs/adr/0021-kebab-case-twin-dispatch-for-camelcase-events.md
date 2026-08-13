# 21. Kebab-case twin dispatch for grandfathered camelCase events

Date: 2026-07-09

## Status

Accepted

Amends [ADR-0017](0017-no-update-prefixed-events-on-custom-elements.md)

## Context

ADR-0017 fixed the `update:*` unlistenability by renaming state-change events
to all-lowercase `change:<prop>`, and its consequences require every **new**
event name to be all-lowercase. But it grandfathered the camelCase events
inherited verbatim from the Stencil package (`changeValue`, `itemChange`,
`tabChange`, `tabFocus`, `selectOption`, `dropdownStateChange`,
`contentChange`) as the documented upgrade-compat surface — the migration
guide promises "existing `changeValue` handlers keep working" to
Angular/TypeScript/React consumers.

Those grandfathered names are unlistenable from Vue templates: Vue's
`runtime-dom` hyphenates every `v-on` listener name before calling
`addEventListener` (`parseName` runs `hyphenate()`), so `@item-change` *and*
`@itemChange` both register `item-change` — which a component dispatching
`itemChange` never fires. This surfaced as "side-navigation links do nothing"
in the docs site: every `@item-change` and `@change-value` listener in the
docs (25 of them) was silently dead. It is the same failure ADR-0017 fixed,
on the event set ADR-0017 deliberately left alone.

Renaming — ADR-0017's remedy — is not available here: these exact camelCase
names are the compat promise to consumers upgrading from `@cscfi/csc-ui`, and
the React wrapper and Angular/TypeScript docs bind them verbatim.

## Decision

Every camelCase event also dispatches a **kebab-case twin** — same `detail`,
same `EventInit` — from the two shared dispatch paths:

- `useHostEmit` derives the twin generically (`itemChange` → `item-change`)
  and dispatches it whenever it differs from the declared name;
- `emitModelValue` dispatches `change-value` alongside the legacy
  `changeValue` / `update:value` / `input` triple.

The camelCase name stays canonical: it is what the event map declares, what
the manifest documents, and what Angular/TypeScript/the React wrapper bind.
The CEM generator appends "Also dispatched as `<twin>` — bind that name in
Vue templates." to each affected event's description, so the docs carry the
Vue-facing name without widening the event maps.

ADR-0017's rule stands unchanged for new events: all-lowercase names only
(the twin machinery is a compat bridge for the grandfathered set, not license
for new camelCase names — a new name that is already lowercase gets no twin).

## Alternatives considered

- **Rename to kebab-case, keep camelCase as deprecated alias**: the same
  runtime behavior, but flips the documented name, regenerates the React
  wrapper and all non-Vue examples, and walks back the published upgrade-compat
  contract for no behavioral gain.
- **Docs-side workaround** (manual `addEventListener` in the docs app):
  leaves every downstream Vue consumer broken; untenable for a Vue-first
  library.
- **Do nothing / require `v-model` and `change:*` only**: covers value
  components and state-change events, but action events (`itemChange`,
  `tabChange`, `selectOption`, …) have no such channel and would remain
  Vue-unreachable.

ADR-0017 rejected dual-dispatch for `update:*` because a rename was available
there (the names were new, carrying no compat promise) and the primary name
would have stayed a silent no-op. Neither holds here: rename would break the
compat promise, and the camelCase primary *is* listenable by every non-Vue
consumer — only Vue templates need the twin, and the manifest note points
them to it.

## Consequences

- Vue templates bind the hyphenated names (`@item-change`, `@change-value`,
  `@tab-change`, …); other consumers keep the camelCase names. Docs examples
  already follow this split per flavor and now work as written.
- Each grandfathered camelCase event dispatches twice. Listeners bound to
  both spellings on the same element fire twice — bind one name.
- Event-map keys stay camelCase only for the grandfathered Stencil-era set;
  review continues to reject new camelCase or `update:`-prefixed keys
  (ADR-0017).
