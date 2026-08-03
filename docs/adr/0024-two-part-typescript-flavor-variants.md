# 24. TypeScript flavor variants are two-part: HTML fragment plus optional script

Date: 2026-08-03

## Status

Accepted

Amends ADR-0020 (variant format of the `typescript` flavor only).

## Context

ADR-0020 defined TypeScript flavor variants as single imperative `.ts` modules
that build the example's DOM with `document.createElement`. In practice these
read as the most complex tab on every page: the markup structure — the thing a
design-system example exists to show — is invisible under element-construction
and wiring code (the `c-list` basic variant spent ~45 lines rebuilding what its
Vue canon's template showed in 15).

## Decision

A `typescript` flavor **example variant** is two checked-in files:

- `<name>.typescript.html` — required. The example's markup as a plain HTML
  fragment: no document skeleton (an example drops into an existing page; a
  fragment cannot pretend to run standalone when custom-element registration
  and bare imports need the consumer's bundler anyway), and no
  `<script src>` linkage line (the docs UI labels the panes; readers should
  never have to delete boilerplate after pasting). A `<style>` element is
  allowed when the example's CSS is irreducible markup content — `::part()`
  customization rules and demo-shell sizing cannot be inlined or moved to the
  script (style injection is not one of the script's jobs).
- `<name>.typescript.ts` — optional. Genuine TypeScript that wires the markup
  via `querySelector`. Omitted when the example is markup-only; its absence is
  itself documentation that no script is needed.

The docs site shows both under the one TypeScript tab as stacked panes with
`Template` / `Script` chips naming each part's role (not filenames — the
fragment-plus-module pair doesn't prescribe where the code lives in the
consumer's project).

Authoring style: the script never creates elements (all structure, including
repeated items, is literal markup; exception: components whose API is
inherently dynamic, e.g. pushing toasts). Attribute-expressible values and
initial state live in the markup; the script only assigns rich-typed
properties, wires listeners, and updates cross-element state. Select by tag,
ids only for disambiguation; non-null assertions are acceptable. The generated
`HTMLElementTagNameMap` keeps this style fully typed with zero annotations on
the DOM queries. No meta-commentary comments in the samples (e.g. notes about
where the typing comes from) — the code must speak for itself.

Rollout is a single wave: parity mapping flips from `typescript → ts` to
`typescript → html (+ optional ts)` and all variants are regenerated in one
PR — no transitional dual-format support, so readers never see mixed
TypeScript tabs.

Alternatives rejected:

- **Single `.html` file with inline `<script type="module">`** — one pane, but
  the script can no longer be real TypeScript (annotations don't run in a
  browser script tag), forcing a valid-JS-subset dialect.
- **Keeping `.ts` modules with an `innerHTML` template literal** — markup as a
  string inside JS; the original complaint with extra steps.
- **Renaming the flavor to "HTML"/"Vanilla"** — the audience (framework-free
  TypeScript consumer) is unchanged, and the flavor id is load-bearing
  (file naming, tab keys, localStorage, highlight payloads); ADR-0020
  deliberately retired those labels.

## Consequences

- The example-parity check becomes asymmetric for this flavor: `.html`
  required, `.ts` optional — matching reality (React/Angular variants are
  inherently single-file).
- The example loader and `ExampleBlock` must support multi-pane variants
  (an array of labeled sources) for this flavor.
- The `// @ts-nocheck` header convention and its display-time stripping
  disappear for this flavor's files.
