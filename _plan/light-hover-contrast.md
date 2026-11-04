# Contrast follow-ups: lighter hover fills and primary on its tint

Parked during the status-colour grill (2026-11-04, ADR-0080). Both predate it, and both reach past warning and error.
Grill this next.

## 1. Light filled hover: white labels on lighter fills

In light mode a filled role lightens on hover (`<role>-hover` → step 300), but `on-<role>` stays white:

| Role | Hover fill | White on it |
|---|---|---|
| `primary` | primary-300 | 2.82:1 |
| `secondary` | secondary-300 | 3.75:1 |
| `error` (c-button `danger`) | error-300 | 2.53:1 |
| `accent` | accent-300 | 1.54:1 |
| `link` | accent-100 | 1.18:1 |

Success, info and warning pass, because their labels went dark in d95be1d4. Dark mode passes everywhere: its fills
lighten under a dark 950 ink.

Users:
- c-button and c-icon-button filled (`--_c-button-fill-hover`);
- anything else that pairs `hover:bg-<role>-hover` with `text-on-<role>`.

Candidate fixes:
- **Darken on hover in light mode.** `<role>-hover` → step 600: primary-600, error-600 at 6.9:1. This reverses the
  "lighten-on-hover" structure ADR-0034 kept from the MyCSC spec, so light mode would darken while dark mode
  lightens.
- **Dark label on the hover fill.** It flips the label from white to near-black on hover, which is a jarring
  change.
- **A smaller lightening step**, e.g. step 400 for primary. Each family needs a check, and it may still fail.

The audit (`scripts/audit-contrast.mjs`) checks `on-<role> / <role>` but not `on-<role> / <role>-hover`. Add those
pairs first.

## 2. Primary text on the primary tint, dark mode: 3.72:1

Active option rows and highlighted menu items draw `text-primary` on `bg-primary-subtle`. In dark mode that is
primary-300 on primary-700, at 3.72:1; light mode reads 4.64:1.

Seen in c-menu-item (hover and keyboard highlight), c-autocomplete, c-dropdown, c-tree-select, c-date-picker,
c-time-picker, c-file-upload, c-breadcrumb-item and c-card.

Candidate fix: ink with the tint's paired `on-primary-subtle`, as c-button's lighter appearances (ADR-0079) and
c-menu-item's danger label (b47b065e) already do. The ring can stay `primary`.
