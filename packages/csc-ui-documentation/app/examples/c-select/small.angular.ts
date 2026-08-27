// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-select
        [value]="country()"
        label="Country"
        size="small"
        (changeValue)="country.set($any($event).detail)"
      >
        <c-option name="Finland" value="fi">Finland</c-option>
        <c-option name="Sweden" value="se">Sweden</c-option>
        <c-option name="Norway" value="no">Norway</c-option>
      </c-select>
    </div>
  `,
})
export class SmallExampleComponent {
  country = signal<string | null>('fi');
}
