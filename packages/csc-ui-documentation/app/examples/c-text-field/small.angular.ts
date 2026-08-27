// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div style="display: flex; align-items: flex-start; gap: 16px">
      <c-text-field
        [value]="query()"
        label="Search"
        size="small"
        (changeValue)="query.set($any($event).detail)"
      ></c-text-field>

      <c-button size="small">Search</c-button>
    </div>
  `,
})
export class SmallExampleComponent {
  query = signal('');
}
