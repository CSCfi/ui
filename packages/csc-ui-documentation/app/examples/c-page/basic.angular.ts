// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <c-page class="demo-page">
      <h2>Reports</h2>
      <p>The default slot is wrapped in a centered max-width container.</p>

      <div slot="footer">Footer content</div>
    </c-page>
  `,
  styles: [
    `
      /* Demo-only sizing: c-page normally fills the viewport below the toolbar. */
      .demo-page {
        height: 240px;
      }
    `,
  ],
})
export class BasicExampleComponent {}
