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
        [value]="vertical()"
        label="Vertical"
        (changeValue)="vertical.set($any($event).detail)"
      >
        <c-option name="Bottom" value="bottom">Bottom</c-option>
        <c-option name="Top" value="top">Top</c-option>
      </c-select>

      <c-select
        [value]="horizontal()"
        label="Horizontal"
        (changeValue)="horizontal.set($any($event).detail)"
      >
        <c-option name="Left" value="left">Left</c-option>
        <c-option name="Center" value="center">Center</c-option>
        <c-option name="Right" value="right">Right</c-option>
      </c-select>

      <c-button (click)="notify()">Show toast</c-button>

      <c-toasts
        #toasts
        [horizontal]="horizontal()"
        [vertical]="vertical()"
      ></c-toasts>
    </div>
  `,
})
export class PlacementExampleComponent {
  horizontal = signal('center');

  toasts = viewChild<ElementRef<CToastsElement>>('toasts');

  vertical = signal('bottom');

  notify() {
    this.toasts()?.nativeElement.addToast({
      message: `Placed at ${this.vertical()} ${this.horizontal()}.`,
      progress: true,
      title: 'Notification',
      type: 'info',
    });
  }
}
