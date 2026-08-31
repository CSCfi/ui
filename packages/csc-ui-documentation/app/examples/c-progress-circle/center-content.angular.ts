// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-progress-circle
        aria-label="Storage quota used"
        size="72"
        value="57"
        width="12"
      >
        57%
      </c-progress-circle>
    </div>
  `,
})
export class CenterContentExampleComponent {}
