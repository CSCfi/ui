// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-row align="center" gap="12">
        <c-button size="small" outlined>First</c-button>
        <c-button size="small" outlined>Second</c-button>
        <c-button size="small" outlined>Third</c-button>
      </c-row>
    </div>
  `,
})
export class BasicExampleComponent {}
