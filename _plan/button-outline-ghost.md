# A lighter outlined border and a stronger ghost wash (before 4.0.0)

## Context

The user finds the outlined buttons' border too dark in light mode and the ghost tint too faint in both modes.

- **Border:** since the variants work (ae56c6ec, ADR-0079), the outlined border is the label's colour, `on-<role>-subtle`.
  In light mode that's step 700, a near-black teal for primary (10.5:1); before the variants it was `primary` (500).
- **Ghost:** the ghost wash is `bg-(fill)/8` at rest, `/15` hovered and `/22` pressed. Text and outlined buttons also
  hover at `/15`.
- **Comparison page:** https://claude.ai/artifact/D73oDgqJX2Tpp2LKtEB3eP, with live buttons and a wash switch.

This lands on `development` with the other pre-4.0.0 work. It stays unpushed; the user pushes.

## Decisions (grill, 2026-11-04)

1. **The outlined border is the variant's fill, in both modes** (`ring-(--_c-button-fill)`), so the outlined button's
   edge is the filled button's edge.
   - **Light:** step 500, so primary is back to its pre-variant look at 6.5:1 on white.
   - **Dark:** from step 200 to the fill: primary and secondary 300, the status colours 400. Error is vivid, as ADR-0080
     makes every non-text error use.
   - A border isn't text, so it takes the role, the rule ADR-0080 set for borders.
   - **Accepted:** light warning's border is pale yellow at 1.6:1, the same edge its filled button has, and success
     reads 3.0:1. The label identifies the button; WCAG 1.4.11 doesn't require a boundary on a button with a text
     label.
   - The label and the focus ring keep the ink.
2. **The ghost wash is `/14` at rest, `/20` hovered.** The lowest contrast at rest is dark secondary at 4.94:1, and
   hovered it's dark secondary at 4.62:1.
3. **Text and outlined buttons hover at `/20` too**, so the three lighter appearances keep one shared hover wash and
   a hovered text button doesn't look like a resting ghost.
4. **The ghost has no pressed step.**
   - **What changes:** drop `active:bg-(fill)/22`. A pressed ghost keeps its hover wash, as text and outlined buttons
     already do, and the ripple shows the press.
   - **Why:** no state falls below AA. Pressed at `/26` would have read 4.26:1 for dark secondary, and today's `/22`
     reads 4.48.

Settled by convention:
- **No new ADR:** the change isn't hard to reverse. ADR-0079 gets a Consequences line, and its "ink" bullet says the
  outline now takes the fill.
- **Unchanged:**
  - inverted ghost, outlined and text (mode-invariant);
  - disabled looks;
  - the focus ring;
  - c-accordion-item's header washes (hover `/8`, active `/15`). Its comment claims c-button's ghost washes, so I'll
    reword it to describe its own.
- One Feat commit with its own changeset (minor, like the other pre-4.0.0 Feats), then a Docs commit.

## Decided while building (2026-11-04)

- **The held-key test is Chromium-only.** Holding Space makes a button `:active` in Chromium. Firefox's WebDriver BiDi
  input does not, even on a plain light-DOM `<button>`, so the "keeps a held ghost button's wash" test skips there
  through `chromiumOnly(reason)` (ADR-0077).
- **The hover test runs once per appearance:** each hover waits out the colour transition, and one test for all three
  passed the 15s limit.
- **Dark popovers and menus are a recorded known case** (user decision, after a side agent's note). The figures above
  were measured on the page surface. On `surface-overlay` (slate-700) primary's ghost reads 4.29:1 at rest and 3.95:1
  hovered (4.66 and 4.23 before), and secondary falls short in every state, already at 4.35:1 as a text button with
  no wash. Only a lighter dark ink fixes that, so ADR-0079 records it and `_plan/dark-overlay-contrast.md` parks it.

## Commits (2026-11-04, `development`, unpushed)

- 819d2228 `Feat(c-button, c-icon-button): The outline takes the variant's colour; a stronger ghost wash`
- the records commit: the ADR-0079 amendment, this plan, `_plan/dark-overlay-contrast.md` and the release-plan line
