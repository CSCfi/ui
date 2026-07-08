# 20. Documentation flavor system: global persisted selection, checked-in variants

Date: 2026-07-08

## Status

Accepted

## Context

The docs-next site showed every example as a Vue SFC only, while the library's
consumers also use React, Angular, and framework-free TypeScript. The examples
loader already supported sibling override files (`basic.react.tsx`) rendered
as extra tabs, but only one such file existed, each tab was per-block local
state, and nothing persisted.

Three shapes had to be settled: what the set of flavors is, how ~150–200
examples × 3 extra flavors get authored and stay correct, and how the reader's
choice behaves across the site.

## Decision

**Flavor** is the canonical term (glossary: CONTEXT.md) for the reader's
consumption dialect: `vue | react | angular | typescript`. "Framework" is
wrong for TypeScript; "consumer" means the person.

- **One documentation-wide selection.** Clicking any example tab switches the
  whole site; a header switcher (`FlavorSwitcher.vue`) shows and sets the same
  state on pages without examples. State lives in `useFlavor()` — the
  `useTheme` singleton-ref pattern — persisted to localStorage
  (`csc-docs-flavor`). Prerendered HTML always shows the Vue default; the
  stored choice is adopted post-hydration (`app:mounted`), trading a brief
  default flash for zero hydration mismatch (no pre-paint script: the active
  tab is Vue state, not a root attribute).
- **Vue stays the canon (ADR-0012); variants are checked-in files**, named
  `<name>.<flavor>.<ext>` beside the canon SFC, generated in bulk by agents
  and committed for review. React variants teach `@cscfi/csc-ui-next-react`
  (ADR-0019); Angular variants are standalone components with
  `CUSTOM_ELEMENTS_SCHEMA`; TypeScript variants are single imperative modules
  typed by the generated `HTMLElementTagNameMap`.
- **A parity check script fails CI** when a canon example lacks any variant,
  so coverage gaps and staleness-by-omission are build failures, not silent
  documentation rot.
- **Fallback:** a block missing the selected flavor's variant shows the Vue
  canon without touching the global selection. The live demo is always the
  compiled Vue canon — variants differ in source shown, not behavior.

Alternatives rejected:

- **Build-time source-to-source transformer from the Vue canon** — no drift
  and no files in the repo, but v-model, slots, and event wiring do not map
  mechanically to three targets; it is a compiler project. The file layout
  keeps the door open (a transformer would simply write the same siblings).
- **Per-block local tabs** — readers compare examples in one dialect; a
  per-block choice forces re-clicking on every block and cannot inform the
  getting-started page.
- **A route per flavor for getting started** — four pages to keep consistent;
  instead one `/getting-started` page swaps its code blocks by flavor.

## Consequences

- Adding an example means adding four files; the parity check enforces it.
  Editing a canon SFC requires regenerating/updating its three variants —
  the check catches missing files, not stale content, so variant review
  remains a human/agent responsibility.
- The flavor id set is load-bearing: file naming, tab keys, localStorage
  values, and highlight-payload keys all use it. Adding a flavor is one
  entry in `FLAVORS` plus a variant-generation wave.
- The old `vanilla`/"JavaScript" and `html` override labels are retired;
  files with unknown flavor parts are ignored with a dev warning.
