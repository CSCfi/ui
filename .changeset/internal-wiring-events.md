---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

The events composed children send only to their parent are no longer public
API (ADR-0075): `c-tab`'s `tabChange` and `tabFocus`, `c-tab-buttons`'
`tabChange`, `c-tab-item`'s `contentChange`, `c-accordion-item`'s
`item-change` and `c-radio`'s `change`. They have lowercase internal names now,
stop at the parent, and are left out of `custom-elements.json`, the element
types and the React wrapper (`onTabChange`, `onTabFocus`, `onContentChange`,
`CAccordionItem`'s `onItemChange`, `CRadio`'s `onChange`). Listen on the
parent: `c-tabs`, `c-accordion` and `c-radio-group` report the value.
`c-select` no longer lets its inner list's `selectOption` and
`dropdownStateChange` reach the page.

Fixed: toggling an item of an accordion nested inside another accordion's item
no longer changes the outer accordion's value too.
