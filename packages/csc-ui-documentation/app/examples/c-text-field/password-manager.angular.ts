// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <form (submit)="$event.preventDefault(); loggedIn.set(username())">
      <c-text-field label="Username">
        <input
          [value]="username()"
          autocomplete="username"
          name="username"
          (input)="username.set($any($event.target).value)"
        />
      </c-text-field>

      <c-text-field label="Password">
        <input
          [value]="password()"
          autocomplete="current-password"
          name="password"
          type="password"
          (input)="password.set($any($event.target).value)"
        />
      </c-text-field>

      <!-- The submit button is the page's own too: a password manager reads
           it to tell what the form is for. -->
      <c-button>
        <button type="submit">Log in</button>
      </c-button>

      @if (loggedIn()) {
        <p>Logged in as {{ loggedIn() }}</p>
      }
    </form>
  `,
})
export class PasswordManagerExampleComponent {
  loggedIn = signal('');

  password = signal('');

  username = signal('');
}
