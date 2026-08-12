// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-row align="center">
        <c-button outlined>Back</c-button>
        <c-spacer></c-spacer>
        <c-button>Continue</c-button>
      </c-row>
    </div>
  `,
})
export class BasicExampleComponent {}
