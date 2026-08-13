# CSC UI NEXT TODO

## Component rewrites
- match styles from the stencil version (csc-ui)

### CDataTable
- Utilize tanstack table?
- simplify data structure

### CModal
- get rid of the top-layer implementation
- do not loose the accessibility

---

## Missing features
- accessibility check / approvements
- type exports / refactor
  - define types in the components (export them)
  - no 'string' types for values that are a set of accepted values like "'warning' | 'success' | 'error' | 'info'"
  - see ADR-0015 for the decided mechanism (component-owned unions, expanded types in the manifest, generated VS Code/JetBrains data, `@freeform` lint)
  - remove dead `color` prop on c-radio-group (declared, defaults to `''`, never read by template or script — seeded from Stencil)
  - c-spinner's `color` is NOT dead (template binds it via `:style` shorthand) — it's a freeform CSS-color passthrough, tag `@freeform`, don't convert to a union
- new documentation site without csc-ui and the components.json it generated
  - examples for ts/vue/angular/react

---

## Remove these
- CRow
- CSpacer
- CSwiper
