The card of a sign-in page: a large surface holding the service's heading, the sign-in form or choices and their actions, with an optional background image showing below a curved edge.

Build it from its sections, in this order: `c-login-card-title` for the heading, `c-login-card-content` for the intro text and the fields, and `c-login-card-actions` for the sign-in button and any links next to it.

```html
<c-login-card src="/img/sign-in.jpg">
  <c-login-card-title>Sign in to My CSC</c-login-card-title>

  <c-login-card-content>
    <p>Access your projects and services with your CSC account.</p>
    <c-text-field label="Username"></c-text-field>
    <c-text-field label="Password" type="password"></c-text-field>
  </c-login-card-content>

  <c-login-card-actions justify="space-between">
    <c-button size="large">Sign in</c-button>
    <c-link href="/reset-password">Forgot password?</c-link>
  </c-login-card-actions>
</c-login-card>
```

## When to use

- As the one card on a sign-in page.
- For grouping any other content, use `c-card`.

## Background image

`src` sets the image. On a wide card it fills the bottom-right corner below a curved edge, and the content column leaves room for it; `background-position` (any CSS `background-position` value, `bottom right` by default) chooses which part of the image shows. Without `src` there is no image and the content takes the card's full width.

`overlay` tints the image with the primary colour, blended through `overlay-blend-mode` — `multiply` by default, or any other CSS blend mode — so a photograph sits in the brand palette.

## Compact layout

The card measures its own width, not the window's. At `mobile-breakpoint` pixels (600 by default) or narrower it switches to a compact layout: tighter padding, content across the full width, the image moved to a wave-shaped strip along the bottom edge, and the heading shrunk from 40px to 32px with hyphenation.

## Accessibility

The image is a CSS background: it is never announced, so it must not carry information the page needs. `c-login-card-title` is a heading, level 2 unless its `heading-level` says otherwise.

## Customization

`::part(root)` is the card's surface (background, ink and corner radius), `::part(card)` the shadowed box inside it, `::part(image)` the clipped image layer and `::part(content)` the padded column holding the sections. Each section has parts of its own, listed with it below.

A login card that pins its own theme mode with `data-theme="light"` or `data-theme="dark"` repaints its surface and the ink of everything slotted into it.
