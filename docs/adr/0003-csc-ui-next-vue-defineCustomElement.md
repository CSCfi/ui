# Replace Stencil with Vue SFCs compiled to custom elements

The `@cscfi/csc-ui` Stencil library will be replaced by a new package, working name `@cscfi/csc-ui-next`, where each component is a Vue 3 SFC compiled to a native custom element via Vue's `defineCustomElement()`. _Partially amended by [ADR-0004](./0004-tailwind-variants-styling-and-classes-prop.md): the `--c-button-*` override-variable contract is dropped and the Tailwind authoring approach is refined._

Existing tag names (`c-button`, `c-text-field`, …) are preserved so non-Vue consumers see no DOM-level break, but the public API contract is modernized — Vue-native `value` prop and `update:value` event for v-model, plus standard DOM `input`/`change` — which is a deliberate break from Stencil's `changeValue` convention. We chose rewrite over the wrapper approach (which we use for React today) because Stencil is being retired entirely; wrapping a doomed core would only have to be unwrapped again.

## Decisions worth recording

- **Tag-name parity.** `<c-button>` etc. keep their names. The implementation backend changes; the DOM contract for tag identity does not.
- **Shadow DOM preserved.** Style isolation, `::part`, and CSS-custom-property theming continue unchanged. Vue's `defineCustomElement()` defaults to shadow DOM, matching the existing contract.
- **Tailwind v4 utility classes in templates, not via `@apply`.** A small Vite plugin at lib build time inlines the generated utility CSS into each component's shadow scope, since shadow DOM is invisible to document stylesheets. Theme tokens stay on `:root` as CSS custom properties and inherit across the shadow boundary. _(Refined by ADR-0004: utilities are authored through `tailwind-variants` configs rather than directly in templates.)_
- **SFC file convention: `<template>` first, then `<script setup>`, then `<style>`.** Template-first reads better when scanning component files.
- **Public API modernization (breaking).** Form components expose `value` (not `modelValue`) and emit `update:value` for Vue v-model — consumer writes `<c-text-field v-model:value="x" />`. Standard DOM `input` and `change` are emitted alongside. The Stencil-era `changeValue` event is dropped.
- **No separate Vue wrapper needed.** Vue 3 native v-model handles the bridge directly to a custom element with `value`/`update:value`. `@cscfi/csc-ui-vue` (the `v-control` directive) and `@cscfi/csc-ui-vue2` are slated for removal once `csc-ui-next` covers the full component set.
- **Coexistence via build flag.** `csc-ui-documentation` accepts `CSC_UI_IMPL=stencil|next` (default `stencil` during the migration). Both packages expose `defineCustomElements()`. When `next`, the docs calls Next's first (registers what's been migrated), then Stencil's (registers the rest). Tags are non-overlapping by construction — `csc-ui-next` only registers what it has implemented.
- **Eager registration in `csc-ui-next`.** One ESM bundle, all migrated components registered on `defineCustomElements()`. Per-component lazy loading is overkill at v0 scale and can be revisited.

## Consequences

- **Once `next` becomes the default, the next release is a major version.** Vue consumers must drop `v-control` and switch to `v-model:value`; React/Angular/vanilla consumers using `changeValue` directly must switch to `update:value` or `change`. The `CSC_UI_IMPL` flag protects internal docs during the transition; external consumers see the break when they upgrade.
- **React wrapper (`@cscfi/csc-ui-react`) loses Stencil-driven auto-generation.** A new strategy (likely codegen from a `csc-ui-next` manifest, or type-only declarations relying on React 19's native custom-element support) will be designed in a separate pass — not part of v0.
- **Angular wrapper (`@cscfi/csc-ui-angular`) currently has no per-component code** (it ships only a control directive). Real per-component wrappers will be built in a separate pass — also not part of v0.
- **`csc-ui-vue` and `csc-ui-vue2` removed** as part of the migration cleanup.
- **`::part()` overrides continue to work** because Shadow DOM is kept; CSS-custom-property theming is unchanged. Slot names and part names are preserved per component.
- **v0 is intentionally small**: 7 components (`c-button`, `c-icon`, `c-checkbox`, `c-card` plus `-actions`/`-content`/`-title`, `c-accordion` plus `-item`, `c-text-field`) to validate the build pipeline (especially Tailwind-in-shadow tooling and `defineCustomElement` slot/event behaviour) before scaling to all 73.
