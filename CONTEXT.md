# CSC UI

A web-component design-system library implemented as Vue SFCs compiled to custom elements, published as `@cscfi/csc-ui` (4.x). Version 3.x and earlier were a Stencil implementation under the same name (ADR-0027); "Stencil-era" in this glossary refers to that line. A version-locked React wrapper (`@cscfi/csc-ui-react`) is the only framework adapter — Angular, Vue, and plain TypeScript consume the elements natively.

## Language

**Component**:
A reusable custom element with a stable tag name (e.g. `<c-button>`). The tag is the canonical identifier and survived the 3.x→4.x rewrite unchanged. Consumers depend on the tag, not the package internals.
_Avoid_: Widget, control, element

**Upgrade** (consumer):
A consumer moving their app from `@cscfi/csc-ui` 3.x (Stencil era) to 4.x. "Migration guide" is the searchable page title, but its body describes an _upgrade_. An upgrade is all-at-once: both majors register the same tags, so they cannot coexist in one app.
_Avoid_: using _migrate_ for the consumer's action (historically, _migration_ was the maintainers' internal Stencil→Vue port of a component)

**Wrapper package**:
A framework-specific adapter that exposes csc-ui custom elements idiomatically. Exactly one exists: `@cscfi/csc-ui-react`, generated from the **manifest** onto `@lit/react` (ADR-0019) and version-locked to the core (ADR-0027) — React is the only framework that needs one; Angular and TypeScript consume the elements natively. Wrappers consume the canonical custom elements; they do **not** re-implement them. The Stencil-era `@cscfi/csc-ui-vue` and `@cscfi/csc-ui-vue2` (just the `v-control` directive) are retired and deprecated on npm.
_Avoid_: Binding, integration, shim

**`v-control`** (retired):
Stencil-era Vue directive that bridged the `changeValue` event to Vue's v-model. Obsolete since 4.x's native Vue v-model contract; its wrapper packages are deprecated. Historical only.

**Heading**:
The visible caption naming a component's content region — a popover panel, an accordion item, an alert. Purely visual hierarchy: unlike a **label**, a heading is not wired to any control for assistive technology. Supplied by the consumer as prose; components accept it under the name `heading`, prop and slot alike.
_Avoid_: Title (`title` is the native tooltip attribute — a global on every element, including hosts), caption, header (a header is a region that may *contain* a heading)

### Menu

**Menu** (`c-menu`):
A **command menu** — a transient panel of actions/navigation choices revealed from a trigger (the WAI-ARIA menu-button pattern). Items are authored declaratively as slotted markup. Activating a leaf item fires a one-off `select` event and closes the menu; the menu holds **no persistent selected value**. This is **not** the same as `c-dropdown` (below) — different role, different events.
_Avoid_: Dropdown (that is a distinct value-selection component), popup, context menu, listbox

**Dropdown** (`c-dropdown`):
The **value-selection** surface behind `c-select`: a `role="listbox"` of options that has a current value and emits the value events — the grandfathered `changeValue` with its `change-value` **kebab-case twin**, plus `update:value` (ADR-0017/0021). A menu, by contrast, is a list of `role="menuitem"` commands. Keep the two distinct — "the dropdown's select event" is a category error; menus emit `select`, dropdowns emit the value events. (`c-autocomplete` is also value-selection but does **not** sit on `c-dropdown` — it renders its own popover panel; see **Autocomplete**.)
_Avoid_: Menu (a menu is the command-list component; a dropdown is the value picker)

**Autocomplete** (`c-autocomplete`):
A **filterable value-selection** component: like `c-select` it holds a persistent selected value and emits the value events (`changeValue` + twin, `update:value`, and a bare `change`) over `role="listbox"`/`role="option"` rows, but its options can be narrowed with a text **query** — filtered by the component itself, or by the consumer in **external** mode. Its distinguishing trait is a dedicated **search input** living *inside* the open panel (above the options), separate from the readonly value field. It is built on the popover + CSS-anchor pattern (the same visuals as `c-menu`'s panel), **not** on `c-dropdown`, and reuses only those popover visuals — never `c-menu-item` or the menu role/event contract.
_Avoid_: Combobox (reserve for the ARIA role, not the component name), typeahead, suggest, filter menu

**Search input**:
The text `<input role="combobox">` rendered inside `c-autocomplete`'s open panel that filters the options. Distinct from the **value field** (the readonly `c-input` trigger that displays the current selection). DOM focus stays in the search input while the panel is open; option highlighting is virtual (`aria-activedescendant`), never real DOM focus.
_Avoid_: Query field, filter box (use _search input_)

**Query**:
The transient text currently typed into the **search input** — the narrowing criterion, distinct from the committed selected value. It resets to empty whenever the panel opens, and every change (the open-reset included) is announced via the `change:query` event; in **external** mode that event is the consumer's signal to refresh the options.
_Avoid_: Search term, filter string (one word for this concept — _query_), value (the query is never the selected value)

**External** (mode):
The contract where the consumer owns a component's data operation — filtering, sorting, paging, typically because a server does the work: with the `external` prop set, the component renders the data it is given verbatim and only emits state-change events (`change:query`, `change:sort`, …) for the consumer to act on. Shared vocabulary of `c-data-table` and `c-autocomplete` (ADR-0029).
_Avoid_: Server-side mode (the owner need not be a server), no-filter (foreign Vuetify vocabulary), manual (TanStack's internal word)

**Trigger**:
The consumer-supplied element (typically a `c-button`) that opens an anchored overlay component — `c-menu`, `c-tooltip`, `c-popover`. Supplied by projecting it into the component's `trigger` slot, or by designating an element elsewhere in the document via the `trigger` prop (an ID or an element reference); the two routes are the same concept, not two kinds of trigger, and each component wires its usual opening interaction (click for `c-menu`/`c-popover`, hover/focus for `c-tooltip`) whichever route supplied it. Either way the component mirrors the relevant ARIA attributes (`aria-haspopup` / `aria-expanded` / `aria-description`) onto it but does not own it.
_Avoid_: Activator, anchor (the *anchor* is the internal positioning reference, a separate concept), toggle button, external trigger (*external* is reserved for the consumer-owned data-operation mode)

**Submenu**:
A nested second-level (or deeper) menu owned by a `c-menu-item`, authored via that item's `submenu` slot and revealed beside its parent. Opening a submenu does not select anything; it expands.
_Avoid_: Nested dropdown, flyout, child menu

**Separator** (`c-divider`):
A general-purpose `role="separator"` line dividing groups of content. Used to partition menu sections but not menu-specific. A **menu label** (`c-menu-label`) is the complementary heading for a group of items; a separator is the line between groups. Paints the `divider` semantic token — a translucent ink that reads on every **surface ladder** rung (ADR-0036); the token role deliberately takes the tag's name, not this concept's, and since ADR-0042 it also paints every **load-bearing hairline**.
_Avoid_: Spacer (the Stencil-era `c-spacer` flex-grow filler, removed in 4.x — not a visible rule), rule, hr

### Overlays

**Tooltip** (`c-tooltip`):
A non-interactive text hint shown on hover or keyboard focus of its **trigger**, painting the **inverted surface** (ADR-0032). It never contains focusable content — interactive floating content is a **popover**'s job (ADR-0033). Its content reaches assistive tech as an `aria-description` mirrored onto the trigger, not via `aria-describedby` (ID references cannot cross the shadow boundary, ADR-0033).
_Avoid_: Hint, title (the native attribute), popup

**Popover** (`c-popover`):
The click-opened, **non-modal** interactive surface component anchored to its **trigger** — light-dismissed, never trapping focus (ADR-0033); blocking flows go to `c-modal`, plain hints to `c-tooltip`. Distinct from the lowercase *native popover*, which is the browser mechanism: any element put in the **top layer** via the Popover API (menu panels, autocomplete panels, and tooltips are all native popovers; only `c-popover` is the Popover *component*).
_Avoid_: Flyout, popup, overlay (as a name for this component)

**Popover chain**:
The ordered set of currently open `c-popover`s, each logically nested in the one before it — a popover joins the chain when its **trigger** sits inside an open popover's panel, and replaces the chain otherwise, so siblings never coexist. Escape peels the innermost popover, one per press; light dismiss closes every popover that does not logically contain the pointer event; closing a popover closes its descendants. Containment is logical (the trigger relationship), not DOM ancestry — a popover whose host lives elsewhere still chains under the popover holding its trigger. Distinct from the **modal stack**: chain members below the innermost stay interactive, nothing goes inert.
_Avoid_: Popover stack (reserve _stack_ for the modal stack's inert-lower-layers contract), nested popups

**Top layer**:
The browser-managed paint layer above every author stacking context — nothing an author z-indexes can paint above it, and while a *modal dialog* occupies it the rest of the document is inert. In this library only **transient** surfaces live there, as native popovers: the menu family, autocomplete panels, `c-tooltip`, and `c-popover` (ADR-0008). Modals deliberately do **not** (ADR-0014) — a top-layer modal would paint over and inert the toasts.
_Avoid_: Overlay (an overlay is any floating surface; the top layer is a specific browser mechanism), portal

**Peek**:
The half-visible last row of an overflowing **transient list panel** — a `c-menu` or **submenu** panel, `c-dropdown`'s listbox behind `c-select`, or `c-autocomplete`'s options list. Those panels hide their scrollbar, so the peek is the sole cue that more rows follow: an overflowing panel always ends at a row's midpoint (the `itemsPerPage`-th row where that prop caps the list, otherwise the last row under the panel's ceiling), never on a row boundary. Persistent scroll containers (data table, side navigation, page, card) keep native scrollbars and have no peek; `c-popover` has no scroll container at all.
_Avoid_: Scroll hint, teaser, fade / scroll shadow (a peek is never a gradient), affordance

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

### Progress & loading

**Progress circle** (`c-progress-circle`):
The circular counterpart of `c-progress-bar`, for **determinate** progress only — it always renders a known value and has no indeterminate mode. Unknown-duration waiting is the **spinner**'s job; the boundary is the axis (known value vs pure activity), not the shape.
_Avoid_: Progress circular (Vuetify vocabulary), progress ring, spinner (that is the indeterminate indicator), donut (dataviz vocabulary)

**Spinner** (`c-spinner`):
The circular **indeterminate** activity indicator — motion with no value. The only circular unknown-progress surface (a **progress circle** never spins); also the primitive other components embed for their busy states.
_Avoid_: Loader (that is the overlay component), circular progress, indeterminate progress circle

**Loader** (`c-loader`):
The container-covering overlay (scrim + **spinner** + optional message) that blocks a region while it loads. Not a synonym for the spinner it contains, nor for a progress component.
_Avoid_: Spinner (the primitive inside it), overlay (any floating surface), progress (a loader shows no value)

### Styling

**Part**:
A named, publicly overridable region of a migrated component's shadow DOM (e.g. `root`, `content`, `description`). The curated public set per component — not every internal node; purely internal regions (loader, spinner, ripple) are styled via the component's own `tailwind-variants` slots but are **not** parts and carry no `part=` attribute. Identified by a flat, logical name (not BEM) stamped as the element's `part="<name>"` attribute; `::part()` against these names is the **sole** consumer customization API (ADR-0006), so a component's part set is its customization contract.
_Avoid_: Slot (a slot is a content-projection hole, a part is a stylable element), element, node, section

**Custom state**:
A host-exposed `ElementInternals` state (`checked`, `indeterminate`, `disabled`) a consumer selects with `:state(...)` to write per-state `::part()` rules (ADR-0035). The selector-side counterpart of **parts**: parts name *where* a rule applies, custom states name *when*. Curated public API like the part set, documented per component with `@cssstate` and listed in the **manifest**. Only otherwise-invisible internal state is exposed — consumer-set props (`valid`, a standalone `disabled`… ) are not mirrored.
_Avoid_: Attribute (nothing is stamped on the host), state class (no class exists), reflected prop

**Indicator** (selection controls):
The state-showing visual control of a selection control — the checkbox box, the radio ring with its dot — stamped as the `indicator` part. NOT the circular hover/ripple surface around it (that is purely internal, carries no part). Distinct from the **sliding indicator**, which is tabs-only.
_Avoid_: Box/ring (implementation shapes; indicator is the concept), ripple surface (internal), icon

**Mark** (`c-checkbox`):
The glyph revealed inside an **indicator** when it has something to show — the check or the indeterminate bar — stamped as the `mark` part. Draws with `currentColor`, so one `color` recolours it. The radio's dot is not a mark: it is part of the indicator itself (its `::after`).
_Avoid_: Check(mark) only (it also renders the indeterminate bar), icon (not slottable, not an icon component)

**Focus ring** (selection controls):
The 2px keyboard-focus halo around a selection control's **indicator**, drawn by the indicator's own `::before` with `currentColor`, so it always matches the indicator's colour — including a consumer's `::part(indicator) { color }` (ADR-0039). Circular and 42px-scale like the ripple surface it visually encloses, but it belongs to the indicator, not the surface; hover tint and ripple stay on the internal colour. Not a **part**.
_Avoid_: Outline (the CSS property, not the concept), ring (the semantic token role / the radio indicator's shape), focus outline

**Root element**:
The single styled element a migrated component renders directly inside its shadow root, carrying all visual Tailwind utilities. The host (`<c-button>`) itself is layout-only (one shared `:host` display rule); visual styling lives on the root element, which is the `root` part.
_Avoid_: Host (the host is the custom element; the root element is its first child), container, wrapper

**`override` prop** (retired):
A removed customization prop (ADR-0006). Historical only — consumer restyling goes through `::part()`; do not reintroduce per-component class props.
_Avoid_: using this term for anything current

**Pre-upgrade window**:
The period between HTML paint and a component's custom-element registration, during which the tag is an inert unknown element and only its slotted light DOM can render. Exists in any server-rendered or static page; ends when the consumer's JS registers the tags.
_Avoid_: FOUC (names the symptom, not the period), hydration gap (nothing hydrates — elements upgrade)

**Pre-upgrade placeholder**:
The document-level CSS shipped with the design tokens that hides a component's raw light DOM during the **pre-upgrade window**. Generic for every component tag; a small set of components with a fixed resting geometry (the form-field shells, `c-radio`) additionally reserve it as explicit exceptions.
_Avoid_: Skeleton (implies a painted stand-in; the placeholder paints nothing), loading state (that is a component's own post-upgrade concern)

**Fail-open reveal**:
The safety valve on the **pre-upgrade placeholder**: a component still unregistered after a fixed delay becomes visible again in its raw form, so a page whose JS never arrives degrades to readable unstyled content instead of staying blank. Purely CSS-driven — it must work precisely when JS is what's missing.
_Avoid_: Timeout fallback (vague), graceful degradation (the general principle, not this mechanism)

### Theming & dark mode

**Palette token**:
A raw brand-ramp custom property — one hue at one fixed step, e.g. `--c-primary-600`, `--c-white`. Mode-independent: its value is a brand constant that does **not** change between light and dark. Components must **not** author directly against palette tokens for any colour that flips between modes; those go through a **semantic token**. (Source of truth is the library's own style-dictionary token pipeline.)
_Avoid_: Colour token, theme token (a palette token is the mode-independent ramp value; a semantic token is the mode-dependent role)

**Semantic token**:
A role-named custom property whose value **resolves to a different palette token in light vs dark mode** — e.g. `--c-surface`, `--c-on-surface`, `--c-primary`. The CSS variable carries the `--c-` namespace prefix (like palette tokens, to avoid clobbering consumer custom properties); the Tailwind utility drops it (`bg-surface`, `text-on-surface`, `bg-primary`). This is the layer dark mode switches; components author against the semantic utilities so a mode change re-themes them with no per-component dark variants. Defined at the document `:root` (so it inherits across shadow boundaries) and mapped into Tailwind via `@theme inline` (`--color-surface: var(--c-surface)`) so the utility resolves inside shadow roots. The role set keeps the existing CSC brand/status names (`primary`, `secondary`, `accent`, `success`, `info`, `warning`, `error`, `link`) — now mode-aware — and **adds** neutral roles (the **surface ladder**, `on-*` foregrounds, `border`, `divider`, `ring`). **Direct palette-step utilities (`bg-primary-600`, `text-white`) are forbidden in component SFCs** (CI-guarded); every component colour flows through a semantic token, so a stray palette-step utility is a build failure rather than a latent dark-mode bug.
_Avoid_: Role token, alias token, palette token (a semantic token points *at* a palette token; it is not itself a ramp value)

**Surface ladder**:
The mode-aware neutral background roles ordered by elevation: `surface` (page background), `surface-raised` (cards/panels), `surface-overlay` (floating layers — popovers, menus, modals), and the **inverted surface** (`surface-inverted`, maximum-emphasis transient layers — toasts, tooltips). In light mode the first three are all near-white and depth reads from shadow; in dark mode each step is progressively lighter so elevation reads **without** relying on shadows. The inverted tier flips instead of climbing — see **Inverted surface**. Below `surface` sit two recessed rungs — `surface-muted` (subdued in-component fills: disabled controls, progress tracks) and, lowest, `surface-sunken` (the page canvas `c-main` paints, and the **track** fill). Each rung pairs with an **`on-` token** for its foreground.
_Avoid_: Layer, z-level, elevation token (the ladder *is* the elevation model; don't introduce a parallel term)

**Load-bearing hairline**:
A 1px edge that is the *only* cue separating a component from what it sits on — no shadow, no fill that already reads. It paints the translucent `divider` ink over the parent surface, the one ink audited to read on every **surface ladder** rung (ADR-0036, ADR-0042); an edge with another cue (a card's shadow) stays on the opaque `border` role. The **track**'s frame is one; a card's border is not.
_Avoid_: Border (the opaque role), outline (the CSS property / focus concept), divider (the token, not this use of it)

**Inverted surface**:
The top rung of the **surface ladder** (`surface-inverted`): a background that takes the *opposite* mode's ground — near-black in light mode, near-white in dark mode — so a maximum-emphasis transient layer stands apart from every other surface instead of blending one shade above it. Content on it uses the matching inverted roles (`on-surface-inverted`, the `*-inverted` status roles), which likewise borrow the opposite mode's look. Mode-**aware** (it flips with the mode) — not to be confused with the mode-**invariant** `inverse-*` family, which keeps one fixed look on a fixed brand/dark backdrop regardless of mode.
_Avoid_: Inverse surface (collides with the invariant `inverse-*` family), dark surface (only true in light mode), contrast surface

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
The consumer-facing `@theme` mapping the library publishes (`@cscfi/csc-ui/css/tailwind-theme.css`) so a consumer's own Tailwind build gains utilities for the **semantic tokens**. Semantic roles **only**, by design — **palette tokens** are excluded because a palette-step utility cannot be mode-aware (ADR-0018). It is a mapping, not a stylesheet: it must be paired with the token definitions (`tokens.css`) to resolve.
_Avoid_: Tailwind preset/config (Tailwind-v3 vocabulary), theme file (ambiguous with **theme mode** and `applyTheme`)

### Data visualization

**Chart token**:
The dataviz subset of the semantic tokens: twelve **series slots** plus the chart anatomy roles (`chart-surface`, `chart-grid`, `chart-axis`). Mode-aware like every semantic token, but the series slots are **frozen** — consumer re-seeding re-themes components, never charts, because the slots are validated as a set (ADR-0030) and a silent shift would void that guarantee. The chart surface equals the raised card surface, which is the background the slots are validated against.
_Avoid_: Chart color (a color is a slot's current value; the token is the role), viz palette, dataviz token

**Series slot**:
One of the twelve ordered positions (`chart-1` … `chart-12`) a chart series wears. Assignment is by sequence — series *n* wears slot *n* — never cycled, never skipped, and never re-assigned when filtering changes the series count: color follows the entity, not its rank. The order itself is the accessibility mechanism (adjacent slots are the validated pairs), and a slot keeps the same hue in both theme modes. Beyond six visible series, fold into "Other" or facet rather than reaching for the tail slots.
_Avoid_: Series color (the value, not the position), palette index, color 1–12

**Relief channel**:
An alternative way to read a mark's value — direct labels, tooltips, or an accompanying table view — required wherever a series slot sits below 3:1 contrast on the chart surface. The shipped slots all clear 3:1 in both modes (since the 2026-09-03 retune), so this applies to consumer overrides of `--c-chart-*`, and to any future slot that trades contrast for chroma. A sub-3:1 mark with no relief channel is an accessibility failure, not a stylistic choice.
_Avoid_: Fallback (relief supplements the mark; nothing replaces it), workaround

### Form fields

**Label**:
The consumer-supplied name of a form control, rendered by the component itself (never authored as a sibling by the consumer). Every component a user operates inside a form is labelable — holding a submittable value is not a prerequisite (`c-tags` is labelable; it holds no value). Comes in exactly two association modes: **field label** and **group label**.
_Avoid_: Title, caption, heading (a label is wired to the control for assistive technology; a heading is not)

**Field label**:
A **label** naming a *single* input, associated with it directly (the `for`/`id` pairing). The mode used by `c-input` and its text family, and by the inline controls `c-checkbox` and `c-switch`.
_Avoid_: Inline label (placement, not association, is what defines it)

**Group label**:
A **label** naming a *set* of controls operated as one field — `c-radio-group`, `c-otp-input`, `c-button-group`, `c-tags`. Associated with the group container (`aria-labelledby`), not any single input inside it. Sourced from the `label` prop; where the default slot is the children's home (`c-radio-group`), a named `slot="label"` is the fallback for rich label content (ADR-0031, prop wins).
_Avoid_: Legend (the native `<fieldset>` mechanism this library does not use), group title

**Button group** (`c-button-group`):
A standalone **labelable value control**: a segmented row of plain `c-button` children where activation carries the value — exclusive by default, cumulative with `multiple`. The form-facing component; it knows nothing about tabs. The group drives each child's **active** state; every active child paints its own active look — the **sliding indicator** never appears here (ADR-0025).
_Avoid_: Tab buttons (that is the `c-tabs` adapter, not a value control), toggle group (foreign vocabulary for this same component), segmented control as the component's *name* (fine as a description of its shape — the usage doc's "a button group is a segmented control" — never as a synonym in API names or headings), toolbar (a button group holds a value; a toolbar merely groups actions)

**Tab buttons** (`c-tab-buttons`):
The tab-strip adapter — a **composed child** of `c-tabs` that presents the tab list as a button group with the **sliding indicator**. Carries no form semantics (no label, no required, no **mandatory**) and cannot deselect: a tab strip inherently has an active tab. Standalone value-picking under this tag is Stencil-era usage; since 4.x that job belongs to **button group**.
_Avoid_: using it standalone as a value picker (that is `c-button-group`)

**Sliding indicator** (`c-tab-buttons`):
The single moving fill that glides to the active tab in a tab strip. A tab-switching affordance owned by **tab buttons** (ADR-0025) — a **button group** never shows it; there, each active button paints its own **active** look.
_Avoid_: Pill (informal), active fill (that is a button's own selected look, not the shared moving one)

**Track** (`c-button-group`, `c-tab-buttons`):
The recessed ground a control's choices sit on — the framed well the buttons of a **button group** or **tab buttons** sit in, stamped as that component's `root` part. It paints an opaque fill, so the labels on it keep one ground wherever the control is placed, and a **load-bearing hairline**, so its boundary reads on every **surface ladder** rung. In a tab strip the **sliding indicator** glides inside it.
_Avoid_: Well, rail, background, box ("segmented-control box" describes its shape; the track is the concept)

**Active** (`c-button`):
The public pressed state of a button — the selected look plus `aria-pressed`. Set by consumers for standalone toggle buttons, or driven by `c-button-group` on its children.
_Avoid_: Selected, pressed (canonical prop name is `active`; _pressed_ is only the ARIA mechanism)

**Required**:
A field-level demand from the *form*: this field must be answered before submission. Surfaces as the asterisk on the **label** and `aria-required`. Purely declarative on the component — enforcement is the consumer's validation logic. Distinct from **mandatory**.
_Avoid_: Mandatory (see below), obligatory

**Mandatory** (`c-button-group`):
A selection-behavior rule on the *control*: the selection can never become empty — the active choice (or, with `multiple`, the last active button) cannot be toggled off. Says nothing about whether the form demands an answer — a button group can be mandatory yet not **required**, or vice versa. Not a tab concept: tabs forbid deselection inherently, so `c-tab-buttons` has no such prop.
_Avoid_: Required (the form-demand concept), forced

**Hint**:
Neutral helper text under a form control, present regardless of validity. It describes how to answer, not what went wrong. When the control is invalid but no **error message** is supplied, the hint keeps rendering *as a hint* — it never inherits error presentation.
_Avoid_: Helper text, description

**Error message**:
Consumer-supplied text explaining why a control is invalid, shown in place of the **hint** while the control is invalid. The component only *displays* it — validation itself (deciding validity, choosing the wording) is the consumer's job, which is why the prop is named for the message, not the process. Has no default: an invalid control without one shows error styling on the field but keeps its hint.
_Avoid_: Validation (the Stencil-era prop name; validation is the consumer's activity, not this text), validation message

### Data table

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

### Documentation

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
The hand-written markdown file colocated with a component (`usage.md` beside the SFC) holding consumer-facing prose — purpose, guidelines, accessibility notes. The *only* place a component is described: its first paragraph is the component's description everywhere the tag is described (docs-page intro, IDE hover, tag-map JSDoc — ADR-0026); the SFC docblock carries tags only, no prose. Flows to the docs site at build time; complements, never duplicates, the generated API tables.
_Avoid_: readme (GitHub-facing), description (a description is the one-liner on a single API member; the *component* description is this file's first paragraph, not a separate text)

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
A checked-in per-**flavor** sibling of a canon example — `<name>.<flavor>.<ext>` beside `<name>.vue`. The Vue SFC stays the canon (ADR-0012): it alone renders as the live demo; variants differ in the source shown, not behavior. Generated from the canon and kept complete by the docs' example-parity check. A canon missing a variant falls back to showing the Vue tab. A variant is usually one file; the TypeScript flavor's is a markup part plus an optional script part shown as stacked panes (ADR-0024).
_Avoid_: Override (the variant adds a tab; it replaces nothing), translation, port

### Flagged ambiguities

- **"Vue version"** is ambiguous: it can mean (a) the retired `@cscfi/csc-ui-vue` directive package, (b) the fact that 4.x components are implemented in Vue, or (c) the Vue.js framework version. Prefer **"`v-control` directive"** for (a), plain **"component"** for (b) — since 4.x there is no other kind — and **"Vue 3"/"Vue 2"** explicitly for (c).
- **"Ring"** is overloaded: (a) the `ring` **semantic token** (the focus colour role — currently used by no component), (b) the radio indicator's shape, (c) Tailwind `ring-*` box-shadow utilities, (d) the keyboard **focus ring**. Say **"`ring` token"**, **"radio indicator"**, **"`ring-*` utility"** and **"focus ring"** respectively.
- **"Themeable"** (docs copy: "themable") means *re-seedable* — one of the eight **families** a consumer may re-brand (ADR-0011). Restyling one component's colours from consumer CSS is **"recolour via `::part()`"**, never "theming".

## Example dialogue

> **Dev:** Should I add a `changeValue` listener for the new dropdown?
>
> **Lead:** You can — `changeValue` is still the canonical value event. It's a grandfathered Stencil-era name (ADR-0017), so it dispatches its `change-value` kebab-case twin and `update:value` alongside; a Vue template binds the twin, or just uses `v-model`.
>
> **Dev:** So what actually broke for a 3.x app on upgrade?
>
> **Lead:** The value events survived; the autocomplete's query API didn't — `changeQuery` is gone, and its replacement `change:query` follows the new all-lowercase convention, so it gets no twin. There's no compatibility shim; the upgrade is all-at-once.
