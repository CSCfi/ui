// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-progress-circle
        aria-label="Upload progress"
        value="72"
      ></c-progress-circle>
    </div>
  `,
})
export class BasicExampleComponent {}
