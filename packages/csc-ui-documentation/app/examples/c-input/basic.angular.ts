// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-input
        [filled]="query().length > 0"
        hint="c-input is the field shell — you provide the native input"
        input-id="example-search"
        label="Search"
      >
        <input
          id="example-search"
          type="text"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />
      </c-input>
    </div>
  `,
})
export class BasicExampleComponent {
  query = signal('');
}
