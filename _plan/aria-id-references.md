# ARIA id references reach the component's control (decided 2026-10-27)

**Status 2026-10-27: done.** Field `aria-label` fix 10836590; forwarding 3cd86e37 (ADR-0078, `useIdReferences`,
38 tags wired, all-components conformance + spec). Full browser suite 70/70 files (three crashed under memory
pressure in the batch run and passed alone), node 435, docs smoke with axe 509/509.

**Decision (user, 2026-10-27): forward them.** `aria-labelledby`, `aria-describedby`, `aria-controls` and the
other id-reference attributes on a `c-*` element stay on the host (d6253feb) and reached nothing: an id
resolves only in its own tree, and the control is in the shadow root. Fix with ARIA element reflection
(`ariaLabelledByElements`, …): an element in a shadow root may reference elements in its shadow-including
ancestor trees, so the component resolves the host's ids in the host's tree and hands the elements to its
control. (ADR-0033 rules out the other direction, page → shadow content, which stays true.)

Verified 2026-10-27: Chromium 148 computes the inner input's name and description from reflected light-DOM
elements (CDP AX tree); Firefox 150 matches Chromium on the property/attribute interplay. Support: Chrome 135,
Firefox 136 (ESR 140 included), Safari 16.4 — inside the supported-browsers matrix. Playwright's own aria
snapshot does not read reflected elements (tooling gap), so specs assert the properties.

## Mechanism — `src/shared/useIdReferences.ts`

`useIdReferences(target)`: `target` returns the element that carries the component's role.
- Resolves each host id in the host's tree (`getRootNode().getElementById`), and the component's own ids
  on the target (c-radio-group's label, the combobox's listbox) in the target's tree; sets the reflected
  property to both, own first. `aria-activedescendant`: the component's own wins.
- Setting the property blanks the content attribute to `""`; a later attribute write by Vue clears the
  reflected elements. So it re-applies after every render (`onUpdated`) and remembers the component's raw
  ids per target. Host attribute removed → the target's own ids are written back (or the attribute removed).
- Re-applies on mount (+ one frame later, for references parsed after the element), on a host attribute
  change (defineElement re-renders, as for `data-*`), and on `focusin` (references rendered later).
- The id list is defineElement's `ID_REFERENCES`, exported from one place.

## Targets

| Kind | Tags → element |
|---|---|
| Fields | c-text-field, c-number-field, c-select, c-autocomplete, c-tree-select, c-date-picker, c-time-picker, c-color-picker → the input / combobox |
| Choice | c-checkbox, c-switch, c-radio, c-slider → input; c-radio-group, c-button-group, c-tags, c-otp-input, c-file-upload → the group |
| Buttons, links | c-button, c-icon-button, c-login-button, c-navigation-button, c-link, c-breadcrumb-item, c-accordion-item, c-side-navigation-item, c-sub-navigation-item → the button / link |
| Dialogs | c-modal, c-popover → the dialog |
| Tabs | c-tabs → the tablist (c-tab-buttons' tablist in buttons mode) |
| Landmarks, others | c-pagination, c-side-navigation, c-breadcrumb → nav; c-data-table → table; c-progress-bar, c-progress-circle → progressbar |
| Host is the box | c-tab, c-tab-item, c-tag, c-list-item: the host carries the role, so its id references already work |

Conformance (all-components): every tag either reflects a host `aria-labelledby` / `aria-describedby` onto
one element of its shadow tree that carries a role (or is a native control), has a role on the host, or is
listed in `NO_ARIA_OBJECT` (layout and decoration tags), asserted in both directions like `NO_ROOT_PART`.

## Found on the way (separate Fix commit first)

A host `aria-label` on a field never named its input: c-text-field and c-number-field forwarded it to the
c-input wrapper, and c-select, c-autocomplete, c-tree-select, c-color-picker, c-date-picker and c-time-picker
dropped it (their input's name is `label` only, the pickers fall back to fixed English). The input's name
is `label`, else the host's `aria-label` (user decision 2026-10-27, 2e2b4a4e: the visible label wins, WCAG 2.5.3;
10836590 had let `aria-label` win).

## Docs

c-icon-button, c-modal, c-popover usage notes; ADR-0033's popover naming line; a new ADR for the mechanism;
Getting started gets one Accessibility paragraph.
