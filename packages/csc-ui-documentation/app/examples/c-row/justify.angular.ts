// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-row align="center" justify="space-between">
        <c-button size="small" outlined>Back</c-button>
        <span>Step 2 of 3</span>
        <c-button size="small">Next</c-button>
      </c-row>
    </div>
  `,
})
export class JustifyExampleComponent {}
