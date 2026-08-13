// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-checkbox hide-details>Unchecked</c-checkbox>
      <c-checkbox checked hide-details>Checked</c-checkbox>
      <c-checkbox indeterminate hide-details>Indeterminate</c-checkbox>
      <c-checkbox disabled hide-details>Disabled</c-checkbox>
      <c-checkbox checked disabled hide-details>
        Checked and disabled
      </c-checkbox>
    </div>
  `,
})
export class StatesExampleComponent {}
