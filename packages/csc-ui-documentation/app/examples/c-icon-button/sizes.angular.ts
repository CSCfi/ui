// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { mdiMagnify } from '@mdi/js';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div class="example-row">
      <c-icon-button aria-label="Search" size="x-small">
        <c-icon [path]="mdiMagnify"></c-icon>
      </c-icon-button>

      <c-icon-button aria-label="Search" size="small">
        <c-icon [path]="mdiMagnify"></c-icon>
      </c-icon-button>

      <c-icon-button aria-label="Search">
        <c-icon [path]="mdiMagnify"></c-icon>
      </c-icon-button>
    </div>
  `,
})
export class SizesExampleComponent {
  mdiMagnify = mdiMagnify;
}
