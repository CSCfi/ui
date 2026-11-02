# 78. ARIA id references reach the control through element reflection

Date: 2026-10-27

## Status

Accepted. Amends ADR-0014 and ADR-0033 (naming a dialog by `aria-labelledby`). Lands before `4.0.0-rc.1`.

## Context

A page names and describes a control by pointing at other elements by id:
`aria-labelledby`, `aria-describedby`, `aria-controls` and the rest. On a
csc-ui element those attributes did nothing. An id resolves only in its own
tree, and the control a screen reader announces (a field's input, a
button, a dialog) lives in the component's shadow root. Copied inside, the
ids named nothing (they were forwarded mangled, then under their own name);
kept on the host (d6253feb), they sat on an element that is not the
control. The docs said so for c-icon-button only, and ADR-0014 and ADR-0033
concluded that `aria-labelledby` could not name a dialog, so both mirror
`aria-label` instead.

ARIA element reflection (`ariaLabelledByElements` and its siblings) lets
script hand an element the referenced elements themselves. Its scoping rule
forbids an outer element from referencing shadow content (why ADR-0033 ruled
it out for the tooltip), but allows the opposite: an element in a shadow root
may reference elements in any tree around it. That is exactly this case.
Chromium 148 computes an inner input's name and description from reflected
light-DOM elements (checked through the CDP accessibility tree). Support
covers the supported browsers (ADR-0077): Chrome 135, Firefox 136 (ESR 140
included), Safari 16.4.

## Decision

- **Each component hands the host's id references to the element that
  carries its role**: the input or combobox of a field, the input of a
  checkbox, switch, radio or slider, the group of a radio group, button group,
  tag list, code input or file upload, the button or link of the button and
  navigation tags, the dialog of c-modal and c-popover, the tablist of c-tabs,
  the `nav` of the navigation landmarks, the table, the progress bars, and the
  `article` or `main` of c-card, c-login-card and c-main. One composable,
  `useIdReferences(target)`, does it.
- **The ids resolve where the element is written**: in the host's tree (the
  page, or the shadow root around the host). The component's own ids on the
  same element (a group's label, a combobox's listbox) resolve in its own tree
  and come first; for `aria-activedescendant`, which names one element, the
  component's own wins.
- **Attributes stay on the host** (no copy inside points at nothing), and
  defineElement re-renders the component when one changes.
- **Every tag is accounted for.** The all-components suite checks that a host
  `aria-labelledby` and `aria-describedby` reach exactly one role-bearing
  element in the shadow tree, unless the tag is listed: its host carries the
  role itself (c-tab, c-tab-item, c-tag, c-list-item, whose host attributes
  already work), or it has nothing a page names by id (decoration, layout,
  internal parts, self-announcing alerts, the menu).

## Consequences

- c-modal and c-popover accept `aria-labelledby` pointing at a title in their
  content, and no longer warn when it is set.
- Setting a reflected property blanks the content attribute to `""`, and any
  later attribute write (Vue patching the component's own ids) clears the
  elements. The composable therefore re-applies after every render and
  remembers the component's own raw ids per element; when the host attribute
  goes, the element gets its own ids back.
- An element the page renders after the component is found one frame after
  mount, on the next render or attribute change, or when the control takes
  focus. One rendered later still, while the control is not focused, is not
  referenced until then.
- An id inside another component's shadow root still cannot be reached, as
  for any element.
- Playwright's aria snapshot and testing-library's name computation read
  attributes, not reflected elements, so specs assert the properties.
