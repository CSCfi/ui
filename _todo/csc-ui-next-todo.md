# CSC UI NEXT TODO

## Component rewrites
- match styles from the stencil version (csc-ui)

### CDataTable
- Utilize tanstack table?
- simplify data structure

### CAutoComplete
- use only value / v-model, remove separate query binding
- filter internally
- maybe a separate search field?
- show every option on open, center on the selected item (if selected)

### CMenu
- use anchor positioning
- allow setting position with a prop

### CModal
- get rid of the top-layer implementation
- do not loose the accessibility

---

## Missing features
- dark mode
- accessibility check / approvements
- type exports / refactor
- documentation page without csc-ui and the components.json it generated

---

## Remove these
- CRow
- CSpacer
- CSwiper
