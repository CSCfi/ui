import type { CDatePickerRange } from '@cscfi/csc-ui';

// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-date-picker
        [value]="leave()"
        label="Leave"
        range
        clearable
        (change)="leave.set($any($event).detail)"
      ></c-date-picker>

      <p>
        Value: {{ leave() ? leave()!.start + ' – ' + leave()!.end : 'null' }}
      </p>
    </div>
  `,
})
export class RangeExampleComponent {
  leave = signal<CDatePickerRange | null>(null);
}
