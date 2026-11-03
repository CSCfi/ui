// @ts-nocheck — documentation code sample; shown as text, never compiled here
import type { ElementRef } from '@angular/core';
import type { CToastsElement } from '@cscfi/csc-ui';

import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div class="example-row">
      <c-select
        [value]="position()"
        label="Position"
        (change)="position.set($any($event).detail)"
      >
        <c-option name="Top start" value="top-start">Top start</c-option>
        <c-option name="Top" value="top">Top</c-option>
        <c-option name="Top end" value="top-end">Top end</c-option>
        <c-option name="Bottom start" value="bottom-start">
          Bottom start
        </c-option>
        <c-option name="Bottom" value="bottom">Bottom</c-option>
        <c-option name="Bottom end" value="bottom-end">Bottom end</c-option>
      </c-select>

      <c-button (click)="notify()">Show toast</c-button>

      <c-toasts #toasts [position]="position()"></c-toasts>
    </div>
  `,
})
export class PlacementExampleComponent {
  position = signal('bottom');

  toasts = viewChild<ElementRef<CToastsElement>>('toasts');

  notify() {
    this.toasts()?.nativeElement.addToast({
      heading: 'Notification',
      message: `Placed at ${this.position()}.`,
      progress: true,
      type: 'info',
    });
  }
}
