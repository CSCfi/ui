// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import type { CTimePickerRange } from '@cscfi/csc-ui';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-time-picker
        [value]="maintenance()"
        hint="An end before the start spans midnight"
        label="Maintenance maintenance"
        range
        clearable
        (change)="maintenance.set($any($event).detail)"
      ></c-time-picker>

      <p>
        Value:
        {{
          maintenance()
            ? maintenance()!.start + ' – ' + maintenance()!.end
            : 'null'
        }}
      </p>
    </div>
  `,
})
export class RangeExampleComponent {
  maintenance = signal<CTimePickerRange | null>(null);
}
