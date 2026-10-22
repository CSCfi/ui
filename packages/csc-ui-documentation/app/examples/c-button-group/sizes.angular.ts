// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div class="example-row">
      <c-button-group value="list" mandatory>
        <c-button value="list">List</c-button>
        <c-button value="grid">Grid</c-button>
      </c-button-group>

      <c-button-group size="small" value="list" mandatory>
        <c-button value="list">List</c-button>
        <c-button value="grid">Grid</c-button>
      </c-button-group>
    </div>
  `,
})
export class SizesExampleComponent {}
