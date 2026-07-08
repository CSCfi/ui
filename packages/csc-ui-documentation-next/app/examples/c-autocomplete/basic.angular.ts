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
        clearable
        hint="Type to filter the options"
        label="Programming language"
        placeholder="Start typing to search"
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
        <c-option value="rs">
          <c-option-value>Rust</c-option-value>
        </c-option>
      </c-autocomplete>

      <span>Value: {{ language() ?? 'null' }}</span>
    </div>
  `,
})
export class BasicExampleComponent {
  language = signal<string | null>(null);
}
