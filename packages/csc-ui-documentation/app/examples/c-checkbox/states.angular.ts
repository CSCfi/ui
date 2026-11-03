// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div class="example-row">
      <c-checkbox hide-message>Unchecked</c-checkbox>
      <c-checkbox checked hide-message>Checked</c-checkbox>
      <c-checkbox indeterminate hide-message>Indeterminate</c-checkbox>
      <c-checkbox disabled hide-message>Disabled</c-checkbox>
      <c-checkbox checked disabled hide-message>
        Checked and disabled
      </c-checkbox>
    </div>
  `,
})
export class StatesExampleComponent {}
