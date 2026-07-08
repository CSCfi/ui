// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // The styles target ::part(), so they must apply globally.
  encapsulation: ViewEncapsulation.None,
  template: `
    <c-main class="demo-shell">
      <c-toolbar class="relative">
        <c-csc-logo></c-csc-logo>
        <span>My Service</span>
      </c-toolbar>

      <c-page>
        <h2>Dashboard</h2>
        <p>Page content goes here.</p>
      </c-page>
    </c-main>
  `,
  styles: [
    `
      /* Demo-only sizing: c-main normally fills the whole viewport. */
      .demo-shell::part(root) {
        height: 320px;
      }

      .demo-shell c-page {
        height: auto;
      }
    `,
  ],
})
export class BasicExampleComponent {}
