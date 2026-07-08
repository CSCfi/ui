// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-tab-buttons value="list" mandatory>
        <c-tab-button value="list">List</c-tab-button>
        <c-tab-button value="grid">Grid</c-tab-button>
      </c-tab-buttons>

      <c-tab-buttons size="small" value="list" mandatory>
        <c-tab-button value="list">List</c-tab-button>
        <c-tab-button value="grid">Grid</c-tab-button>
      </c-tab-buttons>
    </div>
  `,
})
export class SizesExampleComponent {}
