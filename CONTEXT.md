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

**Upgrade** (consumer):
A consumer swapping their app's dependency from `@cscfi/csc-ui` to `@cscfi/csc-ui-next`. Distinct from **migration**, which is the maintainers porting a component Stencil→Vue. "Migration guide" is the searchable page title, but its body describes an _upgrade_. An upgrade is all-at-once: the two packages register the same tags, so they cannot coexist in one app.
_Avoid_: using _migrate_ for the consumer's action (reserve _migrate_ for the internal port)

**Wrapper package**:
A framework-specific adapter that exposes csc-ui custom elements idiomatically — `@cscfi/csc-ui-react`, `@cscfi/csc-ui-angular` (Stencil era), and `@cscfi/csc-ui-next-react` (generated from the **manifest** onto `@lit/react`, ADR-0019; React is the only framework that needs one for `csc-ui-next` — Angular and TypeScript consume the elements natively). Wrappers consume the canonical custom elements; they do **not** re-implement them. `@cscfi/csc-ui-vue` and `@cscfi/csc-ui-vue2` are special-case wrappers (just the `v-control` directive) being retired with the rewrite.
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

### Overlays (`csc-ui-next`)

**Top layer**:
The browser-managed paint layer above every author stacking context — nothing an author z-indexes can paint above it, and while a *modal dialog* occupies it the rest of the document is inert. In this library only **transient** popovers live there: the menu family and autocomplete panels (ADR-0008). Modals deliberately do **not** (ADR-0014) — a top-layer modal would paint over and inert the toasts.
_Avoid_: Overlay (an overlay is any floating surface; the top layer is a specific browser mechanism), portal

**Stacking band**:
A library-owned paint-order range that overlay surfaces are assigned to: page content sits below the **modal stack**'s band, toasts sit in a band above it, and the **top layer** sits above everything. Bands are internal — consumers do not interleave with them. Distinct from the **surface ladder**, which is the *colour* elevation model: a modal paints `surface-overlay` regardless of which band it occupies.
_Avoid_: z-index scale (the band is the concept; a z-index is its implementation), layer

**Modal stack**:
The ordered set of currently open `c-modal`s. Only the topmost — the **active modal** — is interactive; it owns the **backdrop** and receives Escape. Everything below it (page and lower modals alike) is inert. Toasts are exempt: they stay above and interactive regardless of the stack.
_Avoid_: dialog stack, open modals (use _modal stack_ when the ordering/activeness matters)

**Active modal**:
The topmost member of the **modal stack** — the only modal the user can interact with at any moment. Opening a new modal makes it the active one; closing it re-activates the one beneath.
_Avoid_: current modal, focused modal (focus is a consequence, not the definition)

**Backdrop**:
The single dimming overlay rendered directly beneath the **active modal**, painting the `scrim` colour role. There is exactly one visible backdrop no matter how deep the modal stack is. The `scrim` token is the colour it paints with, not the element.
_Avoid_: Scrim (that is the colour token), dimmer, overlay, `::backdrop` (the retired native pseudo-element)

**Dismissable**:
A modal property governing *both* light-dismiss gestures — backdrop click **and** Escape. A non-dismissable modal responds to either with a nudge animation instead of closing; it can only be closed by an explicit action inside it.
_Avoid_: persistent (the inverse framing; canonical axis is _dismissable_), closable

### Styling (`csc-ui-next`)

**Part**:
A named, publicly overridable region of a migrated component's shadow DOM (e.g. `root`, `content`, `description`). The curated public set per component — not every internal node; purely internal regions (loader, spinner, ripple) are styled via the component's own `tailwind-variants` slots but are **not** parts and carry no `part=` attribute. Identified by a flat, logical name (not BEM) stamped as the element's `part="<name>"` attribute; `::part()` against these names is the **sole** consumer customization API (ADR-0006), so a component's part set is its customization contract.
_Avoid_: Slot (a slot is a content-projection hole, a part is a stylable element), element, node, section

**Root element**:
The single styled element a migrated component renders directly inside its shadow root, carrying all visual Tailwind utilities. The host (`<c-button>`) itself is layout-only (one shared `:host` display rule); visual styling lives on the root element, which is the `root` part.
_Avoid_: Host (the host is the custom element; the root element is its first child), container, wrapper

**`override` prop** (retired):
A removed customization prop (ADR-0006). Historical only — consumer restyling goes through `::part()`; do not reintroduce per-component class props.
_Avoid_: using this term for anything current

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

**Tailwind theme export**:
The consumer-facing `@theme` mapping the library publishes (`@cscfi/csc-ui-next/css/tailwind-theme.css`) so a consumer's own Tailwind build gains utilities for the **semantic tokens**. Semantic roles **only**, by design — **palette tokens** are excluded because a palette-step utility cannot be mode-aware (ADR-0018). It is a mapping, not a stylesheet: it must be paired with the token definitions (`tokens.css`) to resolve.
_Avoid_: Tailwind preset/config (Tailwind-v3 vocabulary), theme file (ambiguous with **theme mode** and `applyTheme`)

### Data table (`csc-ui-next`)

**Column**:
A consumer-authored definition in `c-data-table`'s `columns` prop (a `CDataTableColumn`): key/accessor, header content, renderers, and behavioral flags. The old Stencil API called these "headers" (`CDataTableHeader`) — in the new vocabulary the column is the definition; the **header** is only the rendered top cell.
_Avoid_: Header (that is the rendered cell at the top of a column, not the definition), field

**Pinned column**:
A column stuck to the left or right edge of the scroll viewport during horizontal scroll (the TanStack sense). A pinned column is never autohidden. **This is not the old Stencil meaning** — old `pinned` meant "exempt from autohide", which is now the column's expansion policy `'never'`. The selection and expander utility columns are always pinned left.
_Avoid_: Frozen, fixed, sticky column (sticky is reserved for the header/footer rows), the old autohide-exemption sense

**Expansion row**:
The extra full-width row revealed beneath a data row, holding (in order) the auto-rendered cells of columns currently in the expansion row, then the consumer's custom expanded content. During horizontal scroll its content stays sticky at the width of the visible table area.
_Avoid_: Detail row, child row, expandable (a row is expandable; the revealed thing is the expansion row)

**Expansion policy**:
A column's tri-state answer to "when do this column's cells live in the expansion row": `auto` (moved there only when **autohide** overflows, the default), `never` (always a real column), `always` (never a real column — replaces the old `hidden` flag). One axis, so contradictory flag combinations are unrepresentable.
_Avoid_: hidden/hideable (the old two-boolean shape), visibility (CSS connotation)

**Autohide**:
The opt-in overflow strategy where columns whose policy is `auto` move, rightmost first, into the **expansion row** until the table fits its container. The alternative (default) strategy is horizontal scrolling. A table-level mode, not a per-column property.
_Avoid_: Responsive mode, collapse

### Documentation (`csc-ui-next`)

**Manifest**:
The machine-readable API description of the component library — a `custom-elements.json` in the Custom Elements Manifest (CEM) schema, generated from component source at build time: props/attributes, events, slots, methods, CSS **parts**, CSS custom properties. Consumed by the docs site and IDE integrations; generated, never hand-edited.
_Avoid_: docs.json / components.json (the Stencil-era artifacts), schema, metadata file

**Event map**:
The JSDoc-annotated TypeScript interface each component declares listing every event it dispatches on its host (name → `detail` type). The single source of truth for runtime emission (via the typed emit helper), consumer typings, and the **manifest**'s event section. An event not in the map cannot be dispatched.
_Avoid_: emits (Vue `defineEmits` is not used in this library), event list

**Kebab-case twin**:
The hyphenated duplicate (`item-change`, `change-value`) automatically dispatched alongside every grandfathered camelCase Stencil-era event (ADR-0021), because Vue hyphenates `v-on` listener names and can never hear a camelCase `CustomEvent`. The camelCase name stays canonical (event map, manifest, non-Vue consumers); Vue templates bind the twin. Only the grandfathered set has twins — new event names are all-lowercase per ADR-0017 and get none.
_Avoid_: alias event, duplicate event, Vue event (the twin is a name variant, not a separate event)

**Component-owned type**:
A public TypeScript type that belongs to exactly one component (its prop unions, option shapes, filter predicates). Declared in that component and exported from the package entry for consumers, named `C<Component><Concept>` (`CButtonSize`, `CAlertType`). Two components' types looking alike does **not** make the type shared — coincidentally equal value sets stay component-owned so they can diverge (see **Shared type**).
_Avoid_: local type (it is public, not local), component type (too easily read as "the type of the component")

**Shared type**:
A public TypeScript type whose **value crosses a component boundary** — one component emits or accepts what another produces (e.g. `CSelectItem`, accepted by both `c-select` and `c-autocomplete`). Lives centrally in `src/types.ts`, which holds *only* these. Textual equality is not sharing: two components declaring the same union is heritage, not contract, and each keeps its own **component-owned type**.
_Avoid_: common type, global type, public type (both shared and component-owned types are public; shared is specifically the crosses-a-boundary case)

**Usage doc**:
The hand-written markdown file colocated with a component (`usage.md` beside the SFC) holding consumer-facing prose — purpose, guidelines, accessibility notes. Flows to the docs site at build time; complements, never duplicates, the generated API tables.
_Avoid_: readme (GitHub-facing), description (a description is the one-liner on a single API member)

**Composed child**:
A component the consumer authors only inside a specific parent's markup (`c-tag` inside `c-tags`, `c-card-title` inside `c-card`). Declared by the parent via a `@subcomponents` docblock tag, emitted into the **manifest**, and folded into the parent on the docs site — no top-level nav entry or standalone page of its own; its examples and API tables live under the parent, **grouped by component**. Distinct from an _internal-only element_ (e.g. `c-dropdown`), which the consumer never authors at all and which is documented nowhere.
_Avoid_: sub-component (imprecise — conflates composed children with internal-only elements), nested component

**Standalone component**:
A component the consumer uses on its own — it keeps a top-level nav entry and its own page. The complement of a **composed child**. A standalone can still be a parent that owns composed children.
_Avoid_: top-level component, root component, main component

**Flavor**:
The reader's consumption dialect on the docs site: `vue | react | angular | typescript` (TypeScript = framework-free typed custom-element usage). One documentation-wide selection — clicking any example tab or the header switcher changes every example, and the getting-started code blocks, everywhere; persisted per reader (ADR-0020). Also the naming axis for **example variants** (`basic.react.tsx`).
_Avoid_: Framework (TypeScript is not one), consumer (that is the person/app using the library), language, target

**Example variant**:
A checked-in per-**flavor** sibling of a canon example — `<name>.<flavor>.<ext>` beside `<name>.vue`. The Vue SFC stays the canon (ADR-0012): it alone renders as the live demo; variants differ in the source shown, not behavior. Generated from the canon and kept complete by the docs' example-parity check. A canon missing a variant falls back to showing the Vue tab.
_Avoid_: Override (the variant adds a tab; it replaces nothing), translation, port

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
