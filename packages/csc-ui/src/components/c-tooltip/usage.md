A non-interactive text hint shown when its trigger is hovered or keyboard-focused, floating in the top layer on the inverted surface tier.

## Usage

Put the element the tooltip describes in the `trigger` slot and the hint in the `text` prop. For formatted content, use the `content` slot instead — it overrides the prop but must stay non-interactive: a tooltip is never focusable and can hold no links or buttons. If the content needs to be clicked, use `c-popover`.

The tooltip shows after a short hover delay (configurable via the `delay` prop) and immediately on keyboard focus. The trigger must be focusable for keyboard and screen-reader users to reach the hint — a `c-icon-button` or `c-button` qualifies; a bare `<span>` does not.

## When to use

- To name an icon-only control or clarify a truncated label.
- Never for content the user must interact with, or for information that is available nowhere else on the page for touch users — tooltips are unreliable on touch devices.

## Dismissal

The tooltip hides when the pointer leaves the trigger and panel, when focus leaves the trigger, and on Escape (without moving focus). The pointer can travel from the trigger onto the tooltip without it vanishing.

## Accessibility

The tooltip implements the WCAG 1.4.13 (Content on Hover or Focus) contract: dismissable, hoverable, persistent.

The tooltip content is mirrored onto the slotted trigger as `aria-description`, so screen readers announce it with the trigger even while the bubble is closed. `aria-describedby` is not used because ARIA ID references cannot cross the shadow boundary between the light-DOM trigger and the shadow-DOM panel (ADR-0033).

## Layering

The panel is a native popover in the top layer: it is never clipped by ancestor overflow and paints above modals — correct for a tooltip triggered from inside one.

## Customization

Structural styling via `::part(trigger)` and `::part(panel)`. Colours come from the inverted-surface semantic tokens (`--c-surface-inverted`, `--c-on-surface-inverted`); override the tokens to re-theme.
