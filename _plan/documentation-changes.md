# csc-ui-documentation-next todo

## Architecture
- ~~use tailwind~~ DONE (2026-07-07): site chrome migrated to Tailwind v4
  utilities against the library's semantic tokens; consumer theme export from
  csc-ui-next (`css/tailwind-theme.css`, ADR-0018). Residual CSS in
  `app/assets/site.css` (markdown prose, Shiki, `:defined` guards,
  `.example-row`). Examples stay Tailwind-free (`@source not`).

## Bugs in components
- CAccordion
  - wrong colors in Light mode?

## Smaller changes
- Components appear after a delay on reload
- Dark / Light mode switch on the code blocks
- Use csc-ui components to build some of the documentation
  - CButton
  - CIconButton
  - CLink
  - CTabButtons
  - CTable
- Provide the HTML in the TypeScript examples and wire the usage to the template
  - Do not create the HTML with `document.createElement` calls

## Missing features
1. ~~Documentation-wide flavor selection: Vue | React | Angular | Typescript~~
   DONE (2026-07-08): `useFlavor()` + header `FlavorSwitcher`, persisted to
   localStorage `csc-docs-flavor`; example tab clicks switch globally
   (ADR-0020). See `_plan/docs-flavors.md`.
2. ~~Provide every example for all different consumers: (Vue | React | Angular | Typescript)~~
   DONE (2026-07-08): checked-in `<name>.<flavor>.<ext>` variants for every
   canon example, React via new `@cscfi/csc-ui-next-react` (ADR-0019);
   parity guarded by `scripts/check-example-parity.mjs` in the docs build.
  - Add more comprehensive examples (still open)
3. Provide LLMs.txt to agents
4. ~~Customization page~~
  DONE (2026-07-09): `/customization`
5. Colors page
6. ~~Getting started page with code-blocks for each consumer~~
   DONE (2026-07-08): `/getting-started`, flavor-aware blocks following the
   global selection.
7. About page
8. Search implementation
9. Single component imports (ability to use only the components you need, without the full UI library)
10. Skeleton loader version of components could be useful?
