// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-alert type="warning">
        <div slot="title">Maintenance break</div>

        The service will be unavailable on Saturday between 10:00 and 12:00.
      </c-alert>
    </div>
  `,
})
export class BasicExampleComponent {}
