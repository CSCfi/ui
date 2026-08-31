// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
