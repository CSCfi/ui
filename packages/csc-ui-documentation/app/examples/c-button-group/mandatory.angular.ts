// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-button-group
        label="Alignment"
        mandatory
        [value]="align()"
        (change)="align.set($any($event).detail)"
      >
        <c-button value="left">Left</c-button>
        <c-button value="center">Center</c-button>
        <c-button value="right">Right</c-button>
      </c-button-group>

      <span>
        Selected: {{ align() }} — the active button cannot be toggled off
      </span>
    </div>
  `,
})
export class MandatoryExampleComponent {
  align = signal('left');
}
