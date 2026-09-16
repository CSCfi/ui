// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-login-card [src]="artwork" overlay overlay-blend-mode="multiply">
        <c-login-card-title>Sign in to My CSC</c-login-card-title>

        <c-login-card-content>
          <p>Access your projects and services with your CSC account.</p>

          <c-text-field label="Username" name="username" />

          <c-text-field label="Password" name="password" type="password" />
        </c-login-card-content>

        <c-login-card-actions justify="space-between">
          <c-button size="large">Sign in</c-button>

          <c-link href="https://csc.fi" underline>Forgot password?</c-link>
        </c-login-card-actions>
      </c-login-card>
    </div>
  `,
})
export class ColoredExampleComponent {
  // `overlay` tints the image with the primary colour through the chosen blend
  // mode, so any photo sits in the brand palette. Stand-in artwork; use your
  // service's own image url as `src` instead.
  artwork = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#006778"/><stop offset="1" stop-color="#1c3d5a"/></linearGradient></defs><rect width="600" height="800" fill="url(#g)"/><circle cx="470" cy="170" r="170" fill="#fff" fill-opacity=".14"/><circle cx="120" cy="660" r="230" fill="#fff" fill-opacity=".08"/></svg>',
  )}`;
}
