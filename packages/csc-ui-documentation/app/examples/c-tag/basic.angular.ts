// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-tag>Default</c-tag>
      <c-tag active>Active</c-tag>
      <c-tag badge="3">With badge</c-tag>
      <c-tag flat>Flat</c-tag>
      <c-tag size="small">Small</c-tag>
    </div>
  `,
})
export class BasicExampleComponent {}
