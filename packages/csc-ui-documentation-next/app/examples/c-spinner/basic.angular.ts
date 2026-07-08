// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-spinner />
      <c-spinner size="48" width="4" />
      <c-spinner size="48" width="4" color="var(--c-success)" />
    </div>
  `,
})
export class BasicExampleComponent {}
