// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-card>
        <c-card-title>Project members</c-card-title>

        <c-card-content>
          <p>Manage who has access to this project and what they can do.</p>
        </c-card-content>

        <c-card-actions justify="end">
          <c-button text>Cancel</c-button>
          <c-button>Save</c-button>
        </c-card-actions>
      </c-card>
    </div>
  `,
})
export class BasicExampleComponent {}
