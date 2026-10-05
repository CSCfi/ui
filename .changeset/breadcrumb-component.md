---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Add `c-breadcrumb` and its crumbs, `c-breadcrumb-item`: a navigation aid naming
where the current page sits in a site's hierarchy (ADR-0067).

- A crumb with an `href` is a link (an optional `target` sets where it opens);
  the last crumb is always the current page, plain text announced as the
  current page. An icon goes in a crumb's `icon` slot; an icon-only crumb is
  named by its `aria-label`.
- The breadcrumb is one line. When it runs out of room, the middle crumbs fold
  behind a "…" button whose panel lists them as links (Tab or the arrow keys
  move through them), and past that the current and first crumbs' labels
  shorten with an ellipsis. A single-page app routes by intercepting a crumb's
  click, folded crumbs included.
- Parts: `root`, `list`, `separator`, `fold-button`, `panel`, `panel-list` on
  the breadcrumb; `root`, `separator`, `content`, `label` on a crumb, with the
  `current` and `folded` custom states. Texts are overridable through `texts`.
