// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import type { CPaginationOptions } from '@cscfi/csc-ui-next';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-pagination
        [value]="options"
        hide-details
        simple
        (changeValue)="page.set($any($event).detail.currentPage ?? 1)"
      ></c-pagination>

      <p>Current page: {{ page() }}</p>
    </div>
  `,
})
export class SimpleExampleComponent {
  options: CPaginationOptions = {
    itemCount: 40,
    itemsPerPage: 10,
  };

  page = signal(1);
}
