---
status: accepted
supersedes: >
  ADR-0004 (the `override` prop and the `@source inline` safelist only),
  and ADR-0005's "safelist stays, kept lean" decision
---

# `::part()` is the sole consumer customization API; drop the `override` prop and the safelist

`csc-ui-next` exposes a single mechanism for consumers to restyle components: **`::part()`** from the consumer's own stylesheet, targeting the `part=`-stamped regions each component already advertises. We **remove the `override` prop** introduced in ADR-0004 and **delete the `@source inline` override safelist** from `tailwind.css`. The rest of ADR-0004 stands — `tailwind-variants` remains the internal styling-authoring system, parts stay, `--c-*` vars stay dropped, the `@theme` token map and the `:host { display: contents }` rule stay. This supersedes ADR-0004's `override`-prop and safelist decisions, and reverses ADR-0005's "safelist stays, kept lean."

## Context

ADR-0004 gave every component an `override` prop (Tailwind class strings, per part, `tailwind-merge` consumer-wins) and accepted a ~128 KB `@source inline` safelist as its cost, because the Tailwind sheet is inlined into each shadow root at *library* build time and only contains utilities the library itself uses. ADR-0005 kept Shadow DOM and framed `::part()` as the documented *overflow* for anything outside the safelist.

Living with it surfaced that the `override` prop is, under Shadow DOM, **structurally** a partial mirror of Tailwind rather than a leaky-but-fixable one:

- **It can only ever expose the safelisted subset.** For an arbitrary consumer class to resolve, its rule must already exist in the build-time-inlined sheet. The only ways to make *any* class resolve are the consumer's own Tailwind (light DOM — rejected in ADR-0005) or `::part()`. Chasing completeness with a bigger safelist never arrives.
- **Arbitrary values are categorically impossible.** `rounded-[7px]`, `p-[13px]`, `bg-[#abc]` are an infinite set; they cannot be safelisted. `::part()` does them trivially.
- **It fails silently.** A non-safelisted class does not error — it renders wrong (the `animate-pulse` incident). A partial API is tolerable; a partial API that silently no-ops is a footgun.

Weighed against this, the prop's *only* unique advantage is co-located, per-instance, one-off Tailwind tweaks in markup. The consuming teams' customization is **mostly global** ("all our buttons are rounded", "our cards have more padding"), which `::part()` serves directly and better. The per-instance niche does not justify a permanently-partial, silently-failing API plus a 128 KB cost that grows as it chases a target it can't reach.

This is the cheapest moment to decide: only `c-button`, `c-accordion`, and `c-accordion-item` are converted.

## Decisions worth recording

- **`::part()` is the one customization mechanism.** Consumers restyle components from their own stylesheet against the curated `part=` surface (`c-button::part(root) { … }`), globally by tag or scoped by class/container. Full CSS power: arbitrary values, pseudo-classes, media/container queries, no silent failures, no bundle cost.
- **The `override` prop is removed** from every component (prop, the `override?: …Parts` type, the `{ class: override.* }` wiring). `tailwind-variants` configs still author styling internally; they simply no longer accept a consumer merge layer.
- **The override safelist is deleted.** The `@source inline(...)` block in `tailwind.css` goes (~128 KB; the inlined sheet returns from ~666 KB toward ~538 KB). What stays in `tailwind.css`: `@import 'tailwindcss'`, the `@source './components/**/*.vue'` pointer, the `@theme inline` token map (still needed so the library's *own* utilities resolve inside shadow roots and re-theme at runtime), the `@theme { --ease-standard }` token, and `:host { display: contents }`.
- **Parts become load-bearing, so curate them deliberately.** They are no longer one of two override surfaces — they are *the* surface. Each component's public part set is its customization contract; adding/removing a `part=` is now an API change.
- **Design tokens remain the path for color theming.** Overriding `--c-*` at `:root` still re-themes values across the shadow boundary (ADR-0004); `::part()` covers shape/layout/everything else. Two complementary tools, not two redundant ones.

## Considered alternatives

- **Keep the two-tier system (prop + `::part()`), trim the safelist to a frozen "common surface."** Bounds the cost but keeps a partial, silently-failing prop and a non-trivial safelist. Rejected: it preserves the footgun for marginal co-location benefit the consumers don't need.
- **Keep the prop, drop the safelist.** Makes the prop reliable only for utilities the library happens to use — unpredictable per component. Strictly worse than either tier alone. Rejected.
- **Light DOM so the consumer's own Tailwind resolves overrides** — would make a full-Tailwind prop possible, but rejected in ADR-0005 for unbounded inbound bleed and re-implementing platform features.

## Consequences

- **Breaking for any consumer using `override`** (internal only so far — the converted components are not yet released against this API). They move global customization to `::part()` and color theming to `--c-*` token overrides.
- **Per-instance one-offs cost more.** A single-element tweak now needs a class on the element *and* a `::part()` rule in a stylesheet, instead of an inline prop. Accepted: customization is mostly global, where `::part()` is the better fit.
- **Consumers must be able to add global CSS.** True for app consumers; markup-only / locked-down embedding contexts lose the prop's pure-markup styling. Accepted as an edge case.
- **Simpler mental model and docs:** one mechanism, predictable, debuggable in devtools, no "why doesn't my class work?" The customization docs' `::part()` section becomes the primary guidance, not an escape hatch.
- **Migration work:** strip the `override` prop/type/wiring from `c-button`, `c-accordion`, `c-accordion-item` (and any other converted SFCs); delete the safelist block from `tailwind.css`; drop `override`-prop references from ADR-0004-era examples/docs.
- **Amends ADR-0005:** its "safelist stays, kept lean" is reversed; its core decision (Shadow DOM stays) is unaffected and in fact reinforced — the safelist cost it accepted is now gone. `::part()` is promoted from documented escape hatch to the sole customization API.
