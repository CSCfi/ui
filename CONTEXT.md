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

### Menu

**Menu** (`c-menu`):
A **command menu** — a transient panel of actions/navigation choices revealed from a trigger (the WAI-ARIA menu-button pattern). Items are authored declaratively as slotted markup. Activating a leaf item fires a one-off `select` event and closes the menu; the menu holds **no persistent selected value**. This is **not** the same as `c-dropdown` (below) — different role, different events.
_Avoid_: Dropdown (that is a distinct value-selection component), popup, context menu, listbox

**Dropdown** (`c-dropdown`):
The **value-selection** surface behind `c-select` / `c-autocomplete`: a `role="listbox"` of options that has a current value and emits `update:value` / `change`. A menu, by contrast, is a list of `role="menuitem"` commands. Keep the two distinct — "the dropdown's select event" is a category error; menus emit `select`, dropdowns emit `update:value`.
_Avoid_: Menu (a menu is the command-list component; a dropdown is the value picker)

**Trigger**:
The consumer-supplied element (typically a `c-button`) projected into a `c-menu`'s `trigger` slot that toggles the menu open/closed. The menu mirrors `aria-haspopup` / `aria-expanded` onto it but does not own it.
_Avoid_: Activator, anchor (the *anchor* is the internal positioning reference, a separate concept), toggle button

**Submenu**:
A nested second-level (or deeper) menu owned by a `c-menu-item`, authored via that item's `submenu` slot and revealed beside its parent. Opening a submenu does not select anything; it expands.
_Avoid_: Nested dropdown, flyout, child menu

**Separator** (`c-divider`):
A general-purpose `role="separator"` line dividing groups of content. Used to partition menu sections but not menu-specific. A **menu label** (`c-menu-label`) is the complementary heading for a group of items; a separator is the line between groups.
_Avoid_: Spacer (`c-spacer` is a flex-grow layout filler, not a visible rule), rule, hr

### Styling (`csc-ui-next`)

**Part**:
A named, publicly overridable region of a migrated component's shadow DOM (e.g. `root`, `content`, `description`). The curated public set per component — not every internal node; purely internal regions (loader, spinner, ripple) are styled via the component's own `tailwind-variants` slots but are **not** parts and carry no `part=` attribute. Identified by a flat, logical name (not BEM) that is used both as a key in the `override` prop and as the element's `part="<name>"` attribute, so the prop and CSS `::part()` share one vocabulary.
_Avoid_: Slot (a slot is a content-projection hole, a part is a stylable element), element, node, section

**Root element**:
The single styled element a migrated component renders directly inside its shadow root, carrying all visual Tailwind utilities. The host (`<c-button>`) itself is layout-only (one shared `:host` display rule); visual styling lives on the root element, which is the `root` part.
_Avoid_: Host (the host is the custom element; the root element is its first child), container, wrapper

**`override` prop**:
The per-component prop accepting an object keyed by **part** name, whose values are Tailwind class strings. Values **merge** with the component's default classes with **consumer-wins** conflict resolution (via `tailwind-variants`, which bundles `tailwind-merge`) — they augment, not replace, the defaults. Keyed only by public **parts** (not internal slots). Each component's base classes, variants, and compound variants are authored as a `tailwind-variants` config whose `slots` are the component's parts plus its internal regions.
_Avoid_: classes, classNames, ui, parts, styles

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
