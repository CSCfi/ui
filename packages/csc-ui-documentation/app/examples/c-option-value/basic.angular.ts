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
        hint="Only the c-option-value text is filtered, marked and used as the label"
        label="Programming language"
        placeholder="Start typing to search"
        (changeValue)="language.set($any($event).detail)"
      >
        <c-option value="js">
          <c-option-value>JavaScript</c-option-value>
          <small>Web pages and Node.js</small>
        </c-option>
        <c-option value="ts">
          <c-option-value>TypeScript</c-option-value>
          <small>JavaScript with static types</small>
        </c-option>
        <c-option value="py">
          <c-option-value>Python</c-option-value>
          <small>Scripting and data science</small>
        </c-option>
        <c-option value="rs">
          <c-option-value>Rust</c-option-value>
          <small>Systems programming</small>
        </c-option>
      </c-autocomplete>

      <p>Value: {{ language() ?? 'null' }}</p>
    </div>
  `,
})
export class BasicExampleComponent {
  language = signal<string | null>(null);
}
