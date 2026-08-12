// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-login-card>
        <c-login-card-title>Sign in to My CSC</c-login-card-title>

        <c-login-card-content>
          <p>Access your projects and services with your CSC account.</p>
        </c-login-card-content>

        <c-login-card-actions justify="space-between">
          <c-button size="large">Sign in</c-button>

          <c-link href="https://csc.fi" underline>Forgot password?</c-link>
        </c-login-card-actions>
      </c-login-card>
    </div>
  `,
})
export class BasicExampleComponent {}
