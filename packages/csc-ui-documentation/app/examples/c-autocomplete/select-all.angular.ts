// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-autocomplete
        [value]="languages()"
        [texts]="texts"
        clearable
        hint="Type to narrow the list, then select all matches"
        label="Programming languages"
        max-tags="3"
        multiple
        placeholder="Start typing to search"
        select-all
        (changeValue)="languages.set($any($event).detail)"
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
        <c-option value="go">
          <c-option-value>Go</c-option-value>
        </c-option>
        <c-option value="rb">
          <c-option-value>Ruby</c-option-value>
        </c-option>
        <c-option value="cobol" disabled>
          <c-option-value>COBOL</c-option-value>
        </c-option>
      </c-autocomplete>

      <p>Value: {{ languages().length ? languages().join(', ') : '[]' }}</p>
    </div>
  `,
})
export class SelectAllExampleComponent {
  languages = signal<string[]>(['ts']);

  texts = {
    selectAll: (count: number) => `Select all ${count} matches`,
  };
}
