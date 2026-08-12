// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-link href="https://csc.fi">Default link</c-link>

      <c-link href="https://csc.fi" underline>Underlined link</c-link>

      <c-link href="https://csc.fi" target="_blank">Opens in a new tab</c-link>

      <c-link href="https://csc.fi" weight="400">Normal weight</c-link>
    </div>
  `,
})
export class BasicExampleComponent {}
