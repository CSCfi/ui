// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-alert heading="Maintenance break" type="warning">
        The service will be unavailable on Saturday between 10:00 and 12:00.
      </c-alert>
    </div>
  `,
})
export class BasicExampleComponent {}
