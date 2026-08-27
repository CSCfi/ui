// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-autocomplete
        [value]="language()"
        label="Programming language"
        size="small"
        (changeValue)="language.set($any($event).detail)"
      >
        <c-option value="js">
          <c-option-value>JavaScript</c-option-value>
        </c-option>
        <c-option value="ts">
          <c-option-value>TypeScript</c-option-value>
        </c-option>
        <c-option value="py">
          <c-option-value>Python</c-option-value>
        </c-option>
      </c-autocomplete>
    </div>
  `,
})
export class SmallExampleComponent {
  language = signal<string | null>(null);
}
