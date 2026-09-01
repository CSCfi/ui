A click-opened, non-modal surface anchored to its trigger, floating in the top layer; its content may be interactive.

Put the element that opens the popover in the `trigger` slot and the content in the default slot. An optional `heading` prop renders a heading and doubles as the panel's accessible name (it is not called `title` — a `title` attribute would trigger the browser's native tooltip). The popover is deliberately minimal: compose footers, actions, or a close button from existing components (e.g. `c-button`) inside the body.

## Designated trigger

When the opener cannot be slotted — a button living elsewhere in the layout — point the `trigger` prop at it instead: the ID of the element, or the element itself via property binding. The two routes are the same concept: the popover wires click-to-toggle onto the designated element, mirrors `aria-haspopup`/`aria-expanded`, returns focus to it on Escape, anchors the panel to it, and clicking it never counts as a light dismiss. Supplying both routes is a misuse: the prop wins, the slotted element gets no wiring, and a console warning flags it.

## When to use

- Contextual, dismissable UI attached to a control: a small settings panel, a confirm-lite prompt, help content with links.
- Not for a plain text hint — use `c-tooltip`.
- Not for blocking flows the user must complete — the popover never traps focus or blocks the page; use `c-modal`.

## Dismissal

Clicking outside the popover or pressing Escape closes it. Escape returns focus to the trigger when focus was inside the panel; light dismiss leaves focus where the user clicked. Focus is not moved into the panel on open — Tab reaches the content naturally from the trigger.

## Nesting

Popovers nest: a control inside one popover's panel can open another. The open popovers form a popover chain — each nested in the previous one; opening a popover whose trigger is not inside the open one closes it first, so sibling popovers never coexist. Escape closes only the innermost popover, one press per layer; clicking outside closes every popover that does not contain the click (clicking in a parent panel closes just its child); closing a popover closes everything nested inside it. Nesting follows the trigger, not the markup — a popover opened from a designated trigger inside another popover's panel chains under it even though its host element lives elsewhere.

## Accessibility

The panel is a non-modal `role="dialog"` and needs an accessible name: the `heading` prop provides one, or set `aria-label` on the `c-popover` element (`aria-labelledby` cannot reference slotted content across the shadow boundary). The component warns in the console when it opens unnamed. `aria-haspopup="dialog"` and `aria-expanded` are mirrored onto the slotted trigger.

## Layering

The panel is a native popover in the top layer: it is never clipped by ancestor overflow and needs no z-index management, even when opened from inside a modal.

## Customization

Structural styling via `::part(trigger)`, `::part(panel)` and `::part(heading)`. Colours come from the overlay-surface semantic tokens (`--c-surface-overlay`, `--c-on-surface`); override the tokens to re-theme.
