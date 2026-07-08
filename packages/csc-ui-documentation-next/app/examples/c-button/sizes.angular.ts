// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-button size="small">Small</c-button>
      <c-button>Default</c-button>
      <c-button size="large">Large</c-button>
    </div>
  `,
})
export class SizesExampleComponent {}
