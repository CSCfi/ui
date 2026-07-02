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
- new documentation site without csc-ui and the components.json it generated
  - examples for ts/vue/angular/react

---

## Remove these
- CRow
- CSpacer
- CSwiper
