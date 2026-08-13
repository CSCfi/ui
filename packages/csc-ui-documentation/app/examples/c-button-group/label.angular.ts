// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <c-button-group label="Billing period" required value="monthly" mandatory>
      <c-button value="monthly">Monthly</c-button>
      <c-button value="yearly">Yearly</c-button>
    </c-button-group>
  `,
})
export class LabelExampleComponent {}
