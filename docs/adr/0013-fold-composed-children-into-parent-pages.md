---
status: accepted
---

# Composed children are folded into their parent's docs page, not given their own

Of the 72 `csc-ui-next` components, 26 are **composed children** — elements a consumer only ever authors inside a specific parent (`c-tag` inside `c-tags`, `c-card-title` inside `c-card`, `c-option` inside `c-select`). Giving each its own top-level nav entry and standalone page fragments a single mental unit ("a tabs component") across four pages and clutters the sidebar with elements nobody reaches directly. Instead, a parent page absorbs its children: their examples render under the parent, and their API tables appear below, **grouped by component**. The sidebar drops from 72 to 45 entries (16 parents + 29 standalone leaves).

This extends the ADR-0012 pipeline; the manifest remains the single contract between library and docs.

## How the relationship is declared

The parent SFC's component-level docblock gains a `@subcomponents` tag listing its children by tag name:

```
/**
 * @subcomponents c-tab, c-tab-items, c-tab-item
 */
```

The analyzer parses it, validates each named tag resolves to a real component (a missing/misspelled tag fails the build), and emits `csc.subcomponents: string[]` on the parent's manifest declaration. The docs site reads only that field. The relationship is a genuine property of the components — where a child is legal to author — so it lives in the library beside the code, not in docs-side config.

Naming heuristics were rejected as the source: they break on `c-option`→`c-select`, `c-radio`→`c-radio-group`, `c-sub-navigation-item`→`c-side-navigation`, and `c-dropdown` (which no consumer authors at all).

## Consequences for the docs site

- **Nav**: composed children are removed entirely — not nested or indented. They are reachable only through their parent page.
- **Routing**: a child's old route (`/components/c-tag`) redirects to its group on the parent page (`/components/c-tags#c-tag`) rather than 404ing, so existing deep links survive.
- **Examples**: the family's examples all render on the parent page. Child example directories for folded children are consolidated into the parent's and removed.
- **API layout**: a three-column page — components nav (left), content (center), and a sticky "On this page" rail (right) listing each component and its API sub-sections. Below the examples, one labeled group per component (parent first, then children in declared order), each with Properties / Events / Slots / Methods / CSS parts / CSS custom properties, all expanded (searchable, printable) rather than behind tabs.

## Shared and internal-only children

- A child used by more than one parent is documented under **every** declaring parent, so each page stays self-contained. Only `c-option` is shared today (`c-select` and `c-autocomplete` both declare it); its API table is generated, so the duplication is cheap.
- **Internal-only** elements — instantiated by a parent's own implementation and never authored by a consumer (`c-dropdown`) — are documented nowhere: no nav entry, no page, no examples. This is distinct from a composed child, which the consumer does author.
- Judgment calls, recorded so the taxonomy is reproducible: `c-login-button` folds into `c-login-buttons` and `c-toast` folds into `c-toasts` (toasts are created imperatively via `addToast`), rather than either staying standalone.

## Considered alternatives

- **Keep a page per element, nest children in the nav** — maximal discoverability and deep-linkable per element, but it keeps the 72-entry sidebar the restructure exists to shrink and still scatters one component across several pages. Rejected.
- **Grouping map in the docs package** — a hand-authored parent→children config, no library or analyzer change. Fastest to iterate, but it is a second source of truth the manifest doesn't know about (ADR-0012 deliberately avoided docs-side bespoke data), and a new component silently missing from it would be mis-placed with no build-time signal. Rejected.
- **Shared child under one primary parent only** — documents `c-option` once (under `c-select`) with `c-autocomplete` linking to it. No duplication, but the autocomplete reader must leave the page to learn an element autocomplete itself uses. Rejected in favor of self-contained pages.
- **Tabbed API groups** (a tab strip switching which component's tables show) — a shorter page, but hides content behind clicks and defeats ctrl-F across the family. Rejected in favor of stacked groups with the right-side rail for navigation.
