// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-text-field
        [value]="description()"
        hint="A rows value above 1 renders a textarea"
        label="Description"
        [rows]="4"
        (changeValue)="description.set($any($event).detail)"
      ></c-text-field>
    </div>
  `,
})
export class TextareaExampleComponent {
  description = signal('');
}
