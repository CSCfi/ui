// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  styles: [
    `
      /* Demo-only sizing: c-page normally fills the dashboard's page area and the document scrolls. */
      .demo-page {
        height: 240px;
      }
    `,
  ],
  template: `
    <c-page class="demo-page">
      <h2>Reports</h2>
      <p>The default slot is wrapped in a centered max-width container.</p>

      <div slot="footer">Footer content</div>
    </c-page>
  `,
})
export class BasicExampleComponent {}
