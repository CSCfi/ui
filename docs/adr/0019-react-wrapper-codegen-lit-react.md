# 19. React wrapper generated from the Manifest onto @lit/react

Date: 2026-07-08

## Status

Accepted

## Context

The docs-next site is gaining a documentation-wide flavor selection (Vue |
React | Angular | TypeScript) with every example available in each flavor.
That forced the question of what API the React examples teach: `csc-ui-next`
ships Vue-authored custom elements only, and the published
`@cscfi/csc-ui-react` package wraps the old Stencil library, not this one.

Raw custom elements are workable in React but not idiomatic: React 18 sets
unknown props as attributes (so object/array props and custom events need
`ref` + `addEventListener` plumbing), and nothing is typed. Angular and plain
TypeScript consume the elements natively without such friction — Angular via
`CUSTOM_ELEMENTS_SCHEMA`, TypeScript via the generated
`HTMLElementTagNameMap` augmentation — so React is the only framework that
needs a real adapter.

Per the glossary, a wrapper package consumes the canonical custom elements;
it does not re-implement them.

## Decision

A new workspace package `packages/csc-ui-next-react`, published as
`@cscfi/csc-ui-next-react` (the `csc-ui-react` name stays with the Stencil
wrapper until Stencil is retired; renaming then is a major-version decision).

The package is **generated, not hand-written**: `scripts/generate.mjs` reads
`csc-ui-next`'s `custom-elements.json` (the Manifest) and emits one
`@lit/react` `createComponent` call per consumer-authorable component —
internal-only elements (`c-dropdown`) are excluded, mirroring the docs'
`INTERNAL_ONLY` set. The generated `src/components.ts` is committed for
reviewability and regenerated on every build, so it cannot ship stale.

Typing anchors on the library's generated tag-name map rather than
re-declaring anything here:

- **Props** come from the element interfaces (`CSwitchElement` …) via
  `createComponent`'s element-type inference.
- **Events** are typed as `EventName<C*ElementEventMap['<event>']>`, so event
  `detail` types stay correct even when they reference types the library does
  not export (they are resolved inside the exported event-map interfaces).

Importing the package calls `defineCustomElements()` on the client (guarded
for SSR, where the bare tags render and upgrade on hydration). `@lit/react`
is a runtime dependency; `react >= 18` and `@cscfi/csc-ui-next` are peers.

Alternatives rejected:

- **Hand-written wrappers** — ~70 components to keep in sync with the
  Manifest by hand; the drift class the analyzer pipeline exists to prevent.
- **React-19-only guidance (no package)** — React 19 sets properties and
  custom-event handlers natively, but provides no prop/event typing, and
  React 18 consumers get nothing. Revisit shrinking the wrapper when React 18
  support is dropped.
- **Subpath export of `@cscfi/csc-ui-next` (`/react`)** — forces React dev
  dependencies and release coupling into the core package.

## Consequences

- The wrapper's public API is derived: a component/prop/event missing from
  the Manifest is missing from React. The analyzer's `--strict` gate is now
  load-bearing for a second package.
- `c-text-field.autocorrect` is now an **optional `boolean`** mirroring the
  platform `HTMLElement.autocorrect` (it was originally `'on' | 'off'`); it
  maps to the input's `autocorrect="on"`/`"off"` attribute and stays unset by
  default so the browser's per-input-type default (off for email/password/url)
  is preserved. Because `boolean | undefined` is still not assignable to the
  DOM lib's non-optional `HTMLElement.autocorrect: boolean`, the generator
  keeps a one-entry collision table that substitutes the lib member so the
  element type satisfies `@lit/react`'s `extends HTMLElement` constraint. The
  visible effect is that React consumers set autocorrect through React's own
  camelCase `autoCorrect` string attribute rather than the boolean prop, which
  is idiomatic React; Vue, Angular, and TypeScript consumers use the clean
  boolean. A future prop that shadows an HTMLElement member incompatibly fails
  the build loudly — add it to the table.
- Components without a typed event map (45 of 72 at time of writing) get no
  `on*` event props in React; their events land as the event maps are added,
  with no wrapper-side work.
- React examples in the docs teach `@cscfi/csc-ui-next-react`, not raw
  elements; the getting-started React flavor documents installing both the
  core package and the wrapper.
