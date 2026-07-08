// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-message hint="Use your organization email address"></c-message>

      <c-message [valid]="false" validation="Email is required"></c-message>
    </div>
  `,
})
export class BasicExampleComponent {}
