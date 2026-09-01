# Magnifier icon in c-autocomplete's search input

> After approval, copy this file to `_plan/autocomplete-search-input-magnifier.md` (repo convention for plan files).

## Context

The autocomplete's in-panel **search input** (glossary term — not "search field") currently renders as a bare text input with only a placeholder to signal its purpose. Adding a magnifying-glass glyph in front of it gives the universal "type to filter" affordance.

Decisions grilled and settled with Oskari (2026-08-31):

- **Target**: the in-panel search input row (`part="search"`), *not* the value field (which already has a consumer `pre` slot).
- **Ownership**: component-owned, always rendered. No new prop, no new slot.
- **Customization contract**: purely internal region, **no `part=`** — per the glossary's Part entry ("purely internal regions … are not parts") and ADR-0006's warning against leaking icon parts. Consumers can still recolor it via `::part(search) { color: … }` inheritance.
- **Color**: `text-on-surface-muted` (matches the input's placeholder; ADR-0010 semantic tokens).
- **Behavior**: static — never hides or changes with query state.
- **No ADR, no CONTEXT.md change**: reversible, unsurprising, no new vocabulary.

## Change

Single file: `packages/csc-ui/src/components/c-autocomplete/CAutocomplete.vue`

1. Import `mdiMagnify` from `@mdi/js` (already a production dependency; joins the existing `mdiClose`/`mdiChevronDown` imports).
2. In the search row (template ~lines 112–129, `<div :class="ui.search()" part="search">`), render the glyph before the `<input>` using the component's existing **raw inline SVG idiom** for panel-internal glyphs (same shape as `infoIcon` at lines 157–159 and `check` at 183–190 — not `c-icon`, which the component reserves for field-row controls):

   ```html
   <svg :class="ui.searchIcon()" aria-hidden="true" viewBox="0 0 24 24">
     <path :d="mdiMagnify" />
   </svg>
   ```

3. Add a `searchIcon` slot to the `tv` config (~line 412), modeled on the existing `infoIcon`:

   ```
   searchIcon: 'w-[18px] h-[18px] shrink-0 fill-current text-on-surface-muted',
   ```

4. Add `gap-2` to the existing `search` tv slot (the row is `flex items-center` with no gap today; `gap-2` matches c-input's field row). The input is `w-full` and stays that way.

**No docblock changes** — no new `@slot`/`@csspart`, so the strict manifest lint (`scripts/analyzer/lint.mjs`) is unaffected. No `usage.md` prose needed for a decorative glyph.

## Release

- Changeset (patch, `@cscfi/csc-ui` — fixed group bumps the React wrapper automatically): one high-level line, e.g. "c-autocomplete: the panel's search input now shows a magnifying-glass icon".

## Verification

1. `pnpm ui build` (or at minimum `pnpm ui lint:tokens` + `pnpm docs:manifest` strict) — confirms the semantic-token rule and manifest lint pass.
2. `pnpm dev` → open http://localhost:3500, open the c-autocomplete basic example, open the panel: magnifier sits left of the placeholder, muted color, input still fills the row, floating no layout shift while typing.
3. Check both themes (headless-chromium screenshot recipe in memory: light + dark) — the glyph should track `on-surface-muted` in dark mode.
4. Sanity-check `::part(search) { color: red }` from the docs page devtools recolors the glyph (currentColor inheritance).
