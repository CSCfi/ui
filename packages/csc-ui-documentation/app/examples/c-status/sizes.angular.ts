// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div class="example-row">
      <c-status marker="icon" size="small" type="success">Small</c-status>
      <c-status marker="icon" type="success">Default</c-status>
      <c-status marker="icon" size="large" type="success">Large</c-status>
    </div>
  `,
})
export class SizesExampleComponent {}
