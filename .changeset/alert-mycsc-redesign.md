---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Redesign c-alert per the MyCSC alert spec:

- The box is now a tinted container: a 10% wash of the type's role colour
  with a 40% hairline border and a solid 4px accent edge on the left,
  replacing the old 2px outline + 12px edge look.
- Severity is carried by the icon, the title and the accent edge (the
  role's `on-*-subtle` ink); body copy stays high-contrast `on-surface`.
  Slotted titles now render at body size in the type's ink (previously
  18px neutral).
- The `default` type now renders an icon and the brand-primary look
  (previously icon-less).
- New `dismissible` prop renders a dismiss button (`aria-label="Dismiss"`)
  that emits the new `dismiss` event; the alert never removes itself — the
  consumer owns that. New `dismiss` CSS part.
- Alerts now carry an ARIA live-region role: `role="alert"` (assertive) for
  warning/error, `role="status"` (polite) for neutral/info/success.
