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
The **value-selection** surface behind `c-select`: a `role="listbox"` of options that has a current value and emits `update:value` / `change`. A menu, by contrast, is a list of `role="menuitem"` commands. Keep the two distinct — "the dropdown's select event" is a category error; menus emit `select`, dropdowns emit `update:value`. (`c-autocomplete` is also value-selection but does **not** sit on `c-dropdown` — it renders its own popover panel; see **Autocomplete**.)
_Avoid_: Menu (a menu is the command-list component; a dropdown is the value picker)

**Autocomplete** (`c-autocomplete`):
A **filterable value-selection** component: like `c-select` it holds a persistent selected value and emits `update:value` / `change` over `role="listbox"`/`role="option"` rows, but its options can be narrowed with a text query. Its distinguishing trait is a dedicated **search input** living *inside* the open panel (above the options), separate from the readonly value field. It is built on the popover + CSS-anchor pattern (the same visuals as `c-menu`'s panel), **not** on `c-dropdown`, and reuses only those popover visuals — never `c-menu-item` or the menu role/event contract.
_Avoid_: Combobox (reserve for the ARIA role, not the component name), typeahead, suggest, filter menu

**Search input**:
The text `<input role="combobox">` rendered inside `c-autocomplete`'s open panel that filters the options. Distinct from the **value field** (the readonly `c-input` trigger that displays the current selection). DOM focus stays in the search input while the panel is open; option highlighting is virtual (`aria-activedescendant`), never real DOM focus.
_Avoid_: Query field, filter box (use _search input_)

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

### Theming & dark mode (`csc-ui-next`)

**Palette token**:
A raw brand-ramp custom property — one hue at one fixed step, e.g. `--c-primary-600`, `--c-white`. Mode-independent: its value is a brand constant that does **not** change between light and dark. Components must **not** author directly against palette tokens for any colour that flips between modes; those go through a **semantic token**. (Source of truth is the style-dictionary palette, being duplicated into `csc-ui-next`'s own token pipeline — see ADR.)
_Avoid_: Colour token, theme token (a palette token is the mode-independent ramp value; a semantic token is the mode-dependent role)

**Semantic token**:
A role-named custom property whose value **resolves to a different palette token in light vs dark mode** — e.g. `--c-surface`, `--c-on-surface`, `--c-primary`. The CSS variable carries the `--c-` namespace prefix (like palette tokens, to avoid clobbering consumer custom properties); the Tailwind utility drops it (`bg-surface`, `text-on-surface`, `bg-primary`). This is the layer dark mode switches; components author against the semantic utilities so a mode change re-themes them with no per-component dark variants. Defined at the document `:root` (so it inherits across shadow boundaries) and mapped into Tailwind via `@theme inline` (`--color-surface: var(--c-surface)`) so the utility resolves inside shadow roots. The role set keeps the existing CSC brand/status names (`primary`, `secondary`, `accent`, `success`, `info`, `warning`, `error`, `link`) — now mode-aware — and **adds** neutral roles (the **surface ladder**, `on-*` foregrounds, `border`, `ring`). **Direct palette-step utilities (`bg-primary-600`, `text-white`) are forbidden in component SFCs** (CI-guarded); every component colour flows through a semantic token, so a stray palette-step utility is a build failure rather than a latent dark-mode bug.
_Avoid_: Role token, alias token, palette token (a semantic token points *at* a palette token; it is not itself a ramp value)

**Surface ladder**:
The three mode-aware neutral background roles ordered by elevation: `surface` (page background), `surface-raised` (cards/panels), `surface-overlay` (floating layers — popovers, menus, modals, toasts). In light mode they are all near-white and depth reads from shadow; in dark mode each step is progressively lighter so elevation reads **without** relying on shadows. Each pairs with an **`on-` token** for its foreground.
_Avoid_: Layer, z-level, elevation token (the ladder *is* the elevation model; don't introduce a parallel term)

**`on-` token** (foreground role):
A semantic token naming the **content colour that sits on** a given surface or fill — `on-surface` (text/icons on `surface`), `on-primary` (label on a `primary` fill), etc. Its light/dark values flip to preserve contrast (e.g. `on-primary` is white on the light-mode `primary` fill but dark on the lighter dark-mode `primary` fill). The reason a single mode-independent text colour is insufficient and the semantic layer is required.
_Avoid_: Foreground, contrast colour, text token (use `on-<role>`)

**Theme mode**:
The light-or-dark state that selects which palette tokens the **semantic tokens** resolve to. Controlled by the consumer at the document root and read by the whole component tree through token inheritance; an explicit consumer choice wins over the user's OS preference, which is the fallback when no explicit choice is set. _Light_ is the default/unset state.
_Avoid_: Theme (a "theme" implies a full named palette swap; a mode is specifically the light/dark axis), colour scheme, skin

**Family**:
One of the eight chromatic brand/status ramps a consumer may re-brand — `primary`, `secondary`, `accent`, `success`, `info`, `warning`, `error`, `link`. A family spans the full step ramp (`50`–`950`) whose steps are **palette tokens**. The neutral ladders (`tertiary`, `slate`) and `white`/`black` are not families (they are hand-tuned, not consumer-overridable). See **Seed** and ADR-0011.
_Avoid_: Colour, type (the consumer-facing word for these was "type" — prefer _family_), palette (one step of a family is a palette token; the family is the whole ramp)

**Seed**:
The single step-`500` colour value that anchors a **family**'s generated ramp. Step 500 reproduces the seed exactly; steps `50`–`950` are derived from it perceptually (OKLCH). Consumers supply one seed per family they override (via `applyTheme` / `themeToCss`) and the whole ramp — and every **semantic token** that resolves to it, in both modes — regenerates. See ADR-0011.
_Avoid_: Base colour, brand colour (ambiguous — a "brand colour" could mean any step; the seed is specifically step 500)

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
