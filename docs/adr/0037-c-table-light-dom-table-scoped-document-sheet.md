---
status: accepted
---

# c-table keeps the consumer's table in the light DOM, styled by a scoped document sheet

`c-table` renders a `<slot>` and leaves the consumer-authored `<table>` where
the consumer wrote it. Its table styling is injected once per document as a
`<style data-csc-ui-c-table>` in `<head>`, with every selector scoped
`c-table > table.c-table …`. This supersedes the previous model — physically
moving the `<table>` into the component's shadow root on mount — which was
documented only in a template comment.

## Context

`c-table` wraps a table the *consumer* authors; the component renders none of
the cells itself. Its styling needs to reach nested `thead`/`tr`/`th`/`td`
descendants, which a shadow sheet cannot do for slotted content (`::slotted`
matches only the top-level assigned node). The original implementation solved
this by moving the light-DOM `<table>` into the shadow root, where shadow
descendant selectors apply.

The move had structural costs, discovered through a bug report ("a `c-tag`
inside `c-table` cannot be styled, though the same styling works with
`c-data-table`"):

- **Page CSS was severed at mount.** Document selectors do not descend into
  shadow trees and `::part()` pierces exactly one boundary, so after the move
  a rule like `c-tag.status::part(root)` matched for the first paint and then
  silently stopped. `c-table` exported no parts, so there was no sanctioned
  way back in. `c-data-table` never had the problem because its cell content
  is created by consumer render functions — styling travels with the vnode as
  props/inline style.
- **The consumer's framework still owned the moved node in its vdom** while
  the node lived in a foreign tree — a hazard for dynamic row patching.
- **Responsive mobile labels were built by `innerHTML` serialization** of the
  `<th>` markup, so nested elements were duplicated as re-parsed copies.
- A `<table>` slotted after mount was never adopted (one-shot `onMounted`
  query, no slot to observe).

## Decisions

- **The table stays in the light DOM.** `c-table` renders a native `<slot>`;
  it stamps `.c-table` on the slotted table (and toggles `.c-table--mobile`)
  but never re-parents it. Adoption is idempotent and re-runs on `slotchange`,
  so late-added or replaced tables work.
- **Table styling ships as a document-level sheet** (`table.css`, injected by
  `injectTableStyles.ts`): a real `<style>` appended to `document.head`,
  SSR-guarded, injected at most once per document (module flag plus a
  data-attribute probe against a second library copy), from the component's
  `setup` — not at module top level, so consumers who never use `c-table` get
  nothing. A `document.adoptedStyleSheets` entry was rejected because
  constructed sheets sort after every linked/embedded page sheet, so consumer
  CSS could never win cascade ties against the defaults.
- **Scoping is `c-table > table.c-table …`, unlayered.** The child combinator
  plus the stamped class keeps the rules off every other table, including
  tables nested inside cells (a nested `c-table` is matched through its own
  host). The sheet deliberately does not use `@layer`: layered styles lose to
  all unlayered author styles, so any consumer reset (`td { padding: 0 }`)
  would strip the defaults. At specificity (0,1,3) the defaults beat generic
  resets while a consumer override that names the scope
  (`c-table table.c-table td`) still wins.
- **Mobile labels clone nodes instead of serializing HTML.** The label span
  copies the header's child nodes via `cloneNode(true)`; cloned custom
  elements upgrade live in the document and remain styleable. Header lookup
  is tightened to `:scope > thead th` so a nested table's headers are never
  picked up.
- **`:host { display: block }` stays in the shadow sheet** rather than moving
  to the document sheet as `c-table { … }` — a `:host` rule loses to any
  consumer document rule on the host, preserving the pre-existing override
  semantics.

## Considered alternatives

- **Keep the move; document prop/inline styling as the only option** — zero
  code risk, but the footgun stays for every consumer who reaches for a page
  stylesheet, and the vdom foreign-tree hazard remains. Rejected.
- **Keep the move; bridge with `exportparts`** — requires stamping
  `exportparts` onto arbitrary consumer content, cannot distinguish two tags
  in different cells, and helps only `::part()`, not class rules. Rejected.
- **`::slotted()`** — cannot reach descendants of the slotted table, which is
  the entire styling surface. Rejected (this is why the move existed).
- **CSS-only mobile labels (`attr()` / `::before`)** — drops rich header
  markup (icons, components) from the labels; a parity break. Rejected.
- **A generic `documentStyles` convention in `defineElement`** — more
  machinery than one component justifies; can be generalized if a second
  component needs a document sheet. Deferred.

## Consequences

- ADR-0005's library-wide shadow-DOM decision **stands**: `c-table` keeps its
  shadow root and this is not `shadowRoot: false`. The exception is narrow —
  *consumer-authored slotted content* cannot be styled from a shadow sheet,
  so this one component's content styles live in the document, scoped by host
  tag and authored purely in semantic tokens (tokens are document-global
  already).
- This is the library's first document-level component sheet and sets the
  precedent constraints: host-tag scoping on every selector, semantic tokens
  only, injected once, from component setup.
- **Inbound bleed is now real by design**: consumer resets and preflights
  reach the table (the shadow boundary previously blocked them). The (0,1,3)
  scope shields the defaults from generic resets; apps with aggressively
  specific table resets may see visual diffs.
- Page CSS and `::part()` on components nested in cells reach table content —
  the bug that prompted this ADR.
- The manifest now records `c-table`'s default slot and its `usage.md`
  description (previously empty — the component had no slot and no usage
  prose).
