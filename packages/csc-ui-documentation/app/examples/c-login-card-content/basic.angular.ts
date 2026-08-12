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

          <c-text-field label="Username" name="username"></c-text-field>

          <c-text-field
            label="Password"
            name="password"
            type="password"
          ></c-text-field>
        </c-login-card-content>

        <c-login-card-actions>
          <c-button>Sign in</c-button>
        </c-login-card-actions>
      </c-login-card>
    </div>
  `,
})
export class BasicExampleComponent {}
