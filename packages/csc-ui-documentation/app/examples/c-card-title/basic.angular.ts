// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-card>
        <c-card-title>
          Notifications
          <c-button slot="actions" ghost size="small">Mark all read</c-button>
        </c-card-title>

        <c-card-content>
          <p>You have 3 unread notifications.</p>
        </c-card-content>
      </c-card>
    </div>
  `,
})
export class BasicExampleComponent {}
