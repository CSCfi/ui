// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { mdiMagnify } from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-icon-button size="x-small">
        <c-icon [path]="mdiMagnify"></c-icon>
      </c-icon-button>

      <c-icon-button size="small">
        <c-icon [path]="mdiMagnify"></c-icon>
      </c-icon-button>

      <c-icon-button>
        <c-icon [path]="mdiMagnify"></c-icon>
      </c-icon-button>
    </div>
  `,
})
export class SizesExampleComponent {
  mdiMagnify = mdiMagnify;
}
