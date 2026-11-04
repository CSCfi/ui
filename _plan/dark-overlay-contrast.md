# Opaque tints: lighter buttons and alerts read on every surface

Parked during the outline and ghost grill (2026-11-04, `_plan/button-outline-ghost.md`, recorded in ADR-0079). Grilled
the same day; options shown at https://claude.ai/artifact/TDkXfsHC2ffd2YP3Fbmmcf. Lands before 4.0.0 with the rest of the
button work.

## The failures

The lighter appearances (ghost, text, outlined) draw their label in `on-<role>-subtle` (step 200 in dark mode) over a
translucent wash of the fill. That wash reads against whatever is behind it:

| Where | Today's lowest |
|---|---|
| dark `surface-overlay` (slate-700: c-popover, c-menu, the pickers' panels) | secondary hovered 3.63:1; primary's ghost 4.29:1, hovered 3.95:1; a secondary text button with no wash 4.35:1 |
| light `surface-sunken` (primary-100, the c-main canvas) | success's ghost 4.13:1, hovered 3.95:1 |
| c-alert on the light canvas (a 10% translucent wash) | success heading 4.25:1 (the body text is `on-surface`; the close button is an icon, held to 3:1) |

Found while grilling: the **inverted filled hover** is translucent too (`bg-(--_c-button-inverse)/15`). Hover replaces
the white background, so on the dark backdrop an inverted button sits on, the dark label nearly vanishes.

## Decisions (grill, 2026-11-04)

1. **A tint is opaque: the role mixed into the page surface.**
   - **What changes:** every role wash under text becomes `color-mix(in srgb, <role> N%, var(--c-surface))`. That
     covers the buttons' ghost (14%) and hover (20%) and c-alert's box (10%). It also covers the accordion header,
     the breadcrumb bar's crumbs and fold button, and file-upload's choose button. Each keeps its share.
   - **Why:** the tint is the same colour on a card, a popover or the page canvas, so the page-surface figures hold
     everywhere.
   - **The trade:** a ghost on a dark popover reads as a slightly darker patch, and an alert on the light canvas as a
     near-white box.
   - **Rejected:**
     - a darker popover surface: it would have to sit within 1.07:1 of the page, against ADR-0010's elevation ladder,
       and secondary still fails;
     - lighter dark inks for primary (its ink is shared by 18 components, and it turns near-white);
     - per-surface thinning: it can't fix secondary, and it misses apps' own overlays.
2. **Secondary's dark tint ink moves from 200 to 100** (`on-secondary-subtle`): 6.69:1 as text on the popover, against
   4.35 before. Only the two button tags use it. With decision 1 nothing fails on any surface in either mode; the
   lowest is light success text on the canvas, 4.61:1.
3. **"Tint" covers both forms** (glossary): the `*-subtle` token pair and the role mixed into the page surface. Text
   on any tint takes `on-<role>-subtle`. "Wash" stays the nav's translucent ink.
4. **Every translucent role background is converted, and the guard enforces it.** Found while building:
   - c-table's mobile even rows (`table.css`) wash primary at 5% under text;
   - c-checkbox's hover ripple and c-radio's indicator hover ring wash primary at 10% with no text on them. They stay
     see-through, and the guard exempts ripple and indicator layers by selector.
   - c-slider's thumb halo is a box-shadow, not a background, and stays.

   `lint:tint` also fails a translucent role background:
   - `bg-<role>/<n>`, `bg-<role>-subtle…/<n>` and a private-variable `bg-(--_c-…)/<n>`;
   - in a `<style>` block or a component `.css`, a `background` that mixes a role with `transparent`.
5. **On a tinted container, a tint mixes into the container at half its share** (user decision, after a side agent's
   note).
   - **Why:** mixed into the page, a ghost or hover patch nearly vanished on a tinted container. On c-data-table's
     light banner it read 1.04:1 against the banner, a shade lighter than it.
   - **How:** the containers set `--_c-tint-ground` (their own colour) and `--_c-tint-scale: 0.5` for what sits on them,
     so a ghost is 7% and a hover 10%. The patch stands out (1.08–1.18) and every label keeps AA; the lowest is a dark
     selected row hovered, 4.63:1.
   - **The containers:** c-alert's message, c-data-table's banner, and its selected and hovered interactive rows.
     c-popover's panel resets both to the page.
   - **Not the expanded accordion item:** its content sits on a raised card inside the tint.
   - **Rejected:**
     - keeping the page tint (the row expander and the banner's button lose visible hover);
     - the full share in containers (dark labels at 4.05–4.44:1).
6. **ADR-0082** "A tint is opaque: a role mixed into the page surface". Back-links go in ADR-0079 (its known case is
   resolved) and ADR-0081 (the tint definition).
7. **Build it now**, before 4.0.0.

Settled by convention:
- **The utility is internal:** `bg-tint-<role>/<n>` and `bg-tint-(--var)/<n>` live in `src/tailwind.css`, not the
  consumer theme export (ADR-0018). Exporting it later is additive.
- **Inverted states mix against `--c-inverse-surface`.** The inverted ghost, text and outlined looks keep their
  `inverse-on` washes, which are the nav-like translucent ink over an unknown backdrop.
- **Commits:** each Fix commit gets its own patch changeset and a spec that fails before it.

## Commits

1. **`Fix(c-button, c-icon-button): An inverted button stays light under the pointer`**
   - The inverted filled hover becomes
     `hover:bg-[color-mix(in_oklab,var(--_c-button-inverse)_15%,var(--c-inverse-surface))]`.
   - Spec (buttonVariants): an inverted filled button on a dark stage, hovered, has an opaque background and its label
     reads AA, in every variant.
2. **`Fix(tokens): Secondary's dark tint ink reads on popovers`**
   - Dark `on-secondary-subtle` → secondary-100, with its comment updated.
   - Spec (`roleContrast.node.spec.ts`): every `on-<role>-subtle` reads AA on every surface rung (surface, raised,
     overlay, muted, sunken) in both modes. It fails before for dark secondary on the overlay.
   - Baselines: c-button and c-icon-button variants, and the docs examples.
3. **`Fix: Tints are opaque, mixed into the page surface`**
   - **Code:** the `bg-tint-*` utility; the conversions in decision 1; the guard rule in decision 4.
   - **Specs:**
     - buttonVariants: every lighter appearance reads AA at rest and hovered on every surface rung, in both modes.
       This fails before on the dark overlay. The alpha tests change to "the tint is opaque and equals the page mix".
     - CAlert.spec: each type's heading reads AA on every surface rung in both modes. This fails before for success
       on the light canvas (4.25:1).
   - **Baselines:** full pixel-regen sweep plus the docs.
4. **`Docs: Opaque tints in the records`**
   - ADR-0082, with the back-links in ADR-0079 and ADR-0081;
   - the glossary's **Tint** entry, already edited during the grill;
   - this plan with its commit hashes;
   - the release-plan line.

## Verification

- Each new spec fails against HEAD first; swap with `git show HEAD:`.
- Run every touched spec on Chromium, then on Firefox from the scratch install.
- Then run:
  - the conformance all-components suite and `tintInk.spec`;
  - `pnpm ui type-check`, `pnpm lint` (the extended guard is clean, and it fails on a planted translucent wash),
    `pnpm format:check`;
  - `pnpm build`, then the docs smoke in every flavour.
- Gate the commits on tree counts and never push.

## Decided while building (2026-11-04)

- **The tints mix in sRGB, not oklab.** The first build mixed in oklab and came out visibly lighter than the previews
  (an alert box up to 11 levels lighter). The previews and every figure used gamma-sRGB blending, which is what alpha
  compositing does. In sRGB the page-surface baselines differ from the see-through wash by 1–2 levels of rounding.
- **The c-alert failure was its heading** (4.25:1), not its close button: that's an icon, held to 3:1.
- **The expanded accordion item is not a container:** its content sits on a raised card inside its tint.

## Commits (2026-11-04, `development`, unpushed)

- b974ec74 `Fix(c-button, c-icon-button): An inverted button stays light under the pointer`
- 09780809 `Fix(tokens): Secondary's dark tint ink reads on popovers`
- 4236ce46 `Fix: Tints are opaque, mixed into the page surface`
- the records commit: ADR-0082, the back-links in ADR-0079 and ADR-0081, the glossary's **Tint**, CLAUDE.md's
  `lint:tint` line, this plan and the release-plan line
