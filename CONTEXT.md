# CSC UI

A web-component design-system library, currently implemented in Stencil (`@cscfi/csc-ui`) and being rewritten as Vue SFCs compiled to custom elements (`@cscfi/csc-ui-next`). Framework-specific adapter packages exist for React, Angular, and Vue.

## Language

**Component**:
A reusable custom element with a stable tag name (e.g. `<c-button>`). The tag is the canonical identifier; the implementing package is a backend choice. Consumers depend on the tag, not the package.
_Avoid_: Widget, control, element

**Implementation backend** (also: **impl**):
The package that registers a component's class. Either `stencil` (the existing `@cscfi/csc-ui`) or `next` (the upcoming `@cscfi/csc-ui-next`). Selected at docs build time via `CSC_UI_IMPL`. Transitional concept — disappears once Stencil is removed.
_Avoid_: Renderer, engine, driver

**Migrated component**:
A component that has a Vue version in `csc-ui-next`. Under `CSC_UI_IMPL=next`, migrated components register via Vue; the rest fall back to the Stencil loader.
_Avoid_: Ported, converted, rewritten (use _migrated_ everywhere)

**Wrapper package**:
A framework-specific adapter that exposes csc-ui custom elements idiomatically — `@cscfi/csc-ui-react`, `@cscfi/csc-ui-angular`. Wrappers consume the canonical custom elements; they do **not** re-implement them. `@cscfi/csc-ui-vue` and `@cscfi/csc-ui-vue2` are special-case wrappers (just the `v-control` directive) being retired with the rewrite.
_Avoid_: Binding, integration, shim

**`v-control`**:
Legacy Vue directive bridging Stencil's `changeValue` event to Vue's v-model. Made obsolete by `csc-ui-next`'s native Vue v-model contract. Do not extend; do not depend on for new code.

### Flagged ambiguities

- **"Vue version"** is ambiguous: it can mean (a) the `@cscfi/csc-ui-vue` directive, (b) a component implemented in Vue inside `csc-ui-next`, or (c) the Vue.js framework version. Prefer **"`csc-ui-next` component"** for (b), **"`v-control` directive"** for (a), and **"Vue 3"/"Vue 2"** explicitly for (c).

## Example dialogue

> **Dev:** Should I add a `changeValue` listener for the new dropdown?
>
> **Lead:** No — `c-dropdown` is a migrated component in `csc-ui-next`. It emits `update:value` for v-model and `change` for everyone else. `changeValue` only exists on the Stencil backend.
>
> **Dev:** What about when `CSC_UI_IMPL=stencil`?
>
> **Lead:** Then the Stencil version registers and you'd get `changeValue` instead. The docs handles both — pick the API for the current impl. External examples assume `next`.
