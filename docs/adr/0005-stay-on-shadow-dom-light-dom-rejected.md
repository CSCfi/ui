---
status: >
  amended by ADR-0006 — "the safelist stays, kept lean" is reversed (the safelist
  is deleted) and `::part()` is promoted from escape hatch to the sole customization
  API; the core Shadow-DOM decision stands and is reinforced
---

# Stay on Shadow DOM; light DOM (`shadowRoot: false`) evaluated and rejected

`csc-ui-next` components keep rendering into **Shadow DOM** (Vue's `defineCustomElement` default, per ADR-0003). We evaluated dropping the shadow root — registering with Vue 3.5's `defineCustomElement(component, { shadowRoot: false })` and relying on a global stylesheet + scoping — primarily to remove the override-class safelist introduced in ADR-0004. We reject it: every breakage is *fixable*, but the fixes amount to hand-reimplementing what Shadow DOM gives for free, while adding a new unbounded style-bleed risk. This affirms ADR-0003's "Shadow DOM preserved" decision against a concrete alternative, and refines ADR-0004's safelist trade-off with a documented escape hatch.

## Context

ADR-0004 inlines a Tailwind sheet into each component's shadow root at *library* build time, which is why consumer `override` classes outside the library's own usage must be `@source inline`-safelisted (~128 KB). The question raised: since light DOM would let the consumer's own global Tailwind resolve overrides, could we drop Shadow DOM and delete the safelist?

We spiked it on `c-accordion` (light-DOM registration + a jsdom/happy-dom behavioral suite + a browser harness for inbound bleed) before deciding. The spike is not retained in the tree; its findings are recorded here.

## Decisions worth recording

- **Shadow DOM stays.** The style encapsulation, native `<slot>`, and `::part()` boundary are load-bearing for a framework-agnostic component library; we keep them rather than rebuild them.
- **The safelist stays, kept lean.** It is a bounded, finite cost. We safelist the genuinely common override surface (colours, typography, spacing, layout, effects, and now `animate-*`) and do not chase an ever-growing list.
- **`::part()` is the documented escape hatch.** Part names are stamped as `part=` attributes (ADR-0004), so a consumer styles anything outside the safelist from their *own* stylesheet — their own Tailwind generates the utilities, no safelist entry, no bundle cost. Override-prop = ergonomic common case; `::part()` = unbounded power-user case.

## Considered alternatives

- **Light DOM via `shadowRoot: false` (the rejected option).** It does remove the safelist, but the spike showed it is not a drop-in. Each consequence is fixable, and that is exactly the point — you re-own what the platform gave you:
  - **Style injection** — Vue does not inject component `styles` in this mode (explicit runtime warning). Styling must ship as one global stylesheet the consumer imports. *Fix: trivial, and it is what removes the safelist.*
  - **Slotting** — without a shadow root, Vue's `<slot>` outlets render empty and authored children are orphaned. *Fix: a ~115-line `useManualSlots` composable (capture, slot-name routing, buffering, a reactive `has()` for conditional outlets, a MutationObserver for dynamically-added children, and excluding Vue's own rendered root) plus per-component outlet wiring — prototyped and passing, but permanent per-slotted-component complexity that native `<slot>` provides for free.*
  - **Controlled state** — `host.children` introspection (e.g. the accordion) assumes shadow projection semantics. *Fix: query descendants instead.*
  - **Host layout** — `:host` rules (`display: contents`, `:host([…])`) match nothing in light DOM. *Fix: global element `display` rules.*
  - **`::part()`** — gone with the shadow boundary; the documented escape hatch would have to be replaced by plain class targeting subject to inbound bleed.
  - **Inbound style bleed (the unfixable part)** — a consumer's global resets / base styles / framework CSS would reach component internals. Post-ADR-0004 we no longer leak *outward* (utility-only styling), so this inbound direction is the real, *unbounded* regression — strictly worse to reason about than a finite safelist.
- **Ship the full Tailwind sheet into every shadow root** (no safelist, no light DOM) — simplest mental model but megabytes per shadow root. Rejected; the lean safelist is the bounded middle.

## Consequences

- The ADR-0004 safelist and its ~128 KB cost are accepted as the deliberate, cheaper trade versus a library-wide manual-slotting layer plus unbounded inbound bleed.
- `::part()` is now the explicit, documented answer for overrides outside the safelist; the safelist is extended (not the only path) only when a *common* utility surfaces.
- Light DOM remains a legitimate strategic direction many design-system teams take; should it be revisited, it requires its own dedicated rework plan (global stylesheet, manual slotting, `:host` replacement, controlled-state rework, bleed mitigation via `@layer`/reset) — substantially larger than ADR-0004, not a config flip.
- Affirms ADR-0003's "Shadow DOM preserved"; refines ADR-0004's safelist consequence with the `::part()` escape-hatch posture.
