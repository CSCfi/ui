A persistent, in-flow status message: a tinted box whose type carries a status family's colours through the icon, heading and accent edge, while the body copy stays neutral.

Give the alert a `heading` with the prop for plain text; the `heading` slot overrides the prop when rich content (links, emphasis) is needed. The message goes in the default slot.

## When to use

- Persistent status that belongs to the page or a section: a maintenance notice, a failed validation summary, a quota warning.
- Not for transient feedback on an action — use `c-toasts`, which overlays and dismisses itself; the alert stays in the layout until the consumer removes it.

## Types

The four status types (`error`, `info`, `success`, `warning`) carry their status family's colours and icon; `default` — equivalently, omitting the attribute — renders the brand-primary look. Severity is signalled by the icon, the heading's ink and the accent edge, never by colouring the body text.

## Dismissal

`dismissible` renders a dismiss button, but pressing it only emits the `dismiss` event — removing the alert from the page stays the consumer's job.

## Accessibility

The alert manages its own live-region role: `warning` and `error` interrupt (`role="alert"`), while the other types announce politely (`role="status"`). Content that is present at page load is not announced — live regions only announce changes.

## Customization

Structural styling via `::part(root)`, `::part(icon)`, `::part(content)`, `::part(heading)` and `::part(dismiss)`. Colours come from the status-family semantic tokens; override the tokens to re-theme.
