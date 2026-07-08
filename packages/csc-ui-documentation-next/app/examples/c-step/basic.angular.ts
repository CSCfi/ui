// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-steps value="3">
        <c-step>Choose resources</c-step>
        <c-step>Billing details</c-step>
        <c-step>Review</c-step>
        <c-step>Confirmation</c-step>
      </c-steps>
    </div>
  `,
})
export class BasicExampleComponent {}
