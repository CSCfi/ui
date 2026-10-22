# Page typography (ADR-0072)

Hosts pass the consumer page's typography through. Reported from MyCSC: text slotted
into `c-main` rendered in the OS font, and nested hosts (c-select option rows)
could not be reached from the page.

## Steps

1. **Guard first.** Add a check to the all-components conformance suite: mount every tag
   under a stage with distinctive typography (probe font, line-height 1.7,
   `"tnum"`, a variation setting, tab-size 7, custom `--font-sans`/`--spacing`).
   The host must compute the stage's values, and the host must not declare any custom
   property except private `--_c-*` ones. Add behaviour specs for slotted text in
   `c-main` and `c-select`'s option rows (the nested host). Watch them fail.
2. **Shared `:host` rule** (`src/tailwind.css`): `font: inherit`, `tab-size: inherit`,
   `-webkit-text-size-adjust: inherit`, `-webkit-tap-highlight-color: inherit`;
   tap highlight `transparent` on the shadow's interactive elements only.
3. **Theme inline.** `@import 'tailwindcss' source(none) theme(inline)`; the library's
   own `@theme` / `@theme static` blocks become `inline`. Anything reading a
   Tailwind theme var through `var()` (c-button's `--spacing-control`, the
   control-height spec) moves to a literal utility or a private `--_c-` name.
   Check the built sheet: no `:root,:host` theme block, keyframes still present.
4. **Remove `--c-font-family`.** Drop it from `tokens/theme/base.json`, then regenerate the
   exports. Remove every `[font-family:var(--c-font-family)]` (preflight already
   gives the shadow's form controls `font: inherit`), c-input's and c-data-table's
   escape-hatch declarations, c-table's `table.css`, and c-button's `@cssprop`.
   The c-input slotted `<input>`/`<textarea>` gets `font: inherit`.
5. **Harness** (`src/test/harness.css`): body gets the old system stack + `line-height: 1.5`
   so baselines stay byte-stable. Breadcrumb spec's `--c-font-family` probe → `font-family`.
6. **Docs**: preview frame pins `line-height: 1.5`. Add a migration guide entry under
   "Styling & customization", a typography note in Customization, and "set a body
   font" in Getting started.
7. **Changeset** (`minor`), api snapshot refresh, lint + type-check + affected specs.

## Out of scope

- MyCSC's `:where(body *)` workaround removal: do it in MyCSC once a release ships.
