// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-select
        [value]="countries()"
        clearable
        hint="Pick some, or all at once"
        label="Countries"
        max-tags="3"
        multiple
        select-all
        (changeValue)="countries.set($any($event).detail)"
      >
        <c-option name="Finland" value="fi">Finland</c-option>
        <c-option name="Sweden" value="se">Sweden</c-option>
        <c-option name="Norway" value="no">Norway</c-option>
        <c-option name="Denmark" value="dk">Denmark</c-option>
        <c-option name="Iceland" value="is">Iceland</c-option>
        <c-option name="Faroe Islands" value="fo" disabled>
          Faroe Islands
        </c-option>
      </c-select>

      <p>Value: {{ countries().length ? countries().join(', ') : '[]' }}</p>
    </div>
  `,
})
export class SelectAllExampleComponent {
  countries = signal<string[]>(['fi']);
}
