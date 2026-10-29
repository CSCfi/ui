# csc-ui 4 — contrast decisions for design (before rc.1)

**Status 2026-10-29: done** (f3d9a620, 0823ba5b). The user chose the recommendation for each decision: 1 →
`tertiary-600` with disabled buttons on `on-surface-disabled`, 2 → (a) dark `error` = `error-300` (and
`error-hover` = `error-200`, so the hover stays distinct), 3 → (a) `on-primary-subtle`. The c-main reports were an
axe-core 4.14 bug with the docs' boxed scroller; the smoke unboxes c-main for the axe pass instead of disabling the
rule. The axe baseline is empty. The "below-AA pairs no example shows yet" section below still stands.

D14 makes zero axe violations (WCAG 2.1 AA) a gate for rc.1. Everything else in the axe baseline is cleared; what is
left is `color-contrast` on 78 of the 161 docs examples, and each failure traces to a token choice. Measured
2026-10-27 by running the example smoke with the contrast baseline removed, then grouping failures by colour pair.

## 1. Light-mode hint ink — 76 examples (the main one)

`on-surface-muted` and `on-surface-faint` are both `tertiary-500` (`#7e888d`) in light mode: field labels at rest,
hints, placeholders, toolbar and pagination meta text, table meta.

| Ink | on white (`surface`) | on `surface-muted` (`#eff0f1`) |
|---|---|---|
| `tertiary-500` `#7e888d` (today) | 3.62:1 ✗ | 3.18:1 ✗ |
| `tertiary-600` `#5e6a71` (proposed 2026-10-23) | 5.56:1 ✓ | 4.87:1 ✓ |

**Proposal:** both roles → `tertiary-600` in light mode (`border-strong` already uses it). Dark mode is unchanged
(`slate-300` / `slate-400` pass).

**Consequence to decide with it:** `c-button` and `c-icon-button` ink disabled text with `on-surface-faint` (equal to
the muted ink in light mode). With faint at `tertiary-600`, disabled buttons would darken and read closer to
enabled; they should then move to `on-surface-disabled`, the step the disabled options and days already use.
Disabled text is exempt from AA.

## 2. Dark-mode error text on raised surfaces — c-message (and every field error message)

Field error messages and c-message ink their text with `error`, which is `error-400` in dark mode:

| Ink | on `surface-raised` (`#2b2f33`) | on a 5% wash (`#2d353a`) |
|---|---|---|
| `error-400` `#fc3d30` (today) | 3.76:1 ✗ | 3.48:1 ✗ |
| `error-300` `#ff7b6b` | 5.33:1 ✓ | 4.93:1 ✓ |
| `error-200` `#ffaa9d` | 7.38:1 ✓ | 6.83:1 ✓ |

**Options:** (a) dark `error` → `error-300`. It also moves the fills that use `error` (a danger button's
`on-error` ink, `error-950`, goes from 5.15:1 to 7.31:1 on it). (b) A separate error-text role, leaving the fills alone.
**Recommendation:** (a), the smaller change, unless design wants the fill to stay `error-400`.

## 3. Dark-mode expanded accordion heading — c-accordion

An expanded item's heading is `primary` on its own 5% primary wash: `primary-300` `#54a5b7` on `#2d353a` is
**4.43:1** ✗ (just short). The paired subtle ink, `on-primary-subtle` (`primary-200` in dark), gives **6.37:1**.
In light mode that role is `primary-700`, a darker heading than today's `primary-500`.

**Options:** (a) expanded headings use `on-primary-subtle` in both modes. (b) Keep `primary` and lighten the wash.
**Recommendation:** (a): it is what the role pairing is for (c-alert and c-list already use the paired ink on
their washes).

## Ours to fix once these land

- The accordion custom-style example recolours the expanded item with `secondary` text on a secondary wash: in
  dark mode 3.42:1. It follows whichever option 3 picks (`on-secondary-subtle` there gives 5.48:1).
- c-main examples: axe reports the side-navigation title (white) and the toolbar text against `primary-100`
  (`#c4dee4`), but they render on the drawer (dark teal) and the white toolbar (checked by screenshot). The
  pinned drawer and toolbar confuse axe's background lookup. The toolbar text is the ink of decision 1 anyway;
  re-check after it lands, and if axe still misreads, disable the rule with a stated reason (D14 allows that per
  rule, not per example).

## Context: below-AA pairs no example shows yet

From the token audit (light mode), not flagged by axe because no example reaches the state: white on `accent`,
`success`, `info` and `warning` fills; `on-accent-subtle`; the navigation hover state. They do not block rc.1,
but the moment an example shows one, D14 fails.
