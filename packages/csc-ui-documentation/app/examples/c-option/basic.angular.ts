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
        clearable
        hint="Each c-option provides a name and a value"
        label="Country"
        placeholder="Choose a country"
        (changeValue)="country.set($any($event).detail)"
      >
        <c-option name="Finland" value="fi">Finland</c-option>
        <c-option name="Sweden" value="se">Sweden</c-option>
        <c-option name="Norway" value="no">Norway</c-option>
        <c-option name="Denmark" value="dk" disabled>Denmark</c-option>
      </c-select>

      <p>Value: {{ country() ?? 'null' }}</p>
    </div>
  `,
})
export class BasicExampleComponent {
  country = signal<string | null>(null);
}
