// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';
import type { CToastsElement } from '@cscfi/csc-ui';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
  toasts = viewChild<ElementRef<CToastsElement>>('toasts');

  vertical = signal('bottom');

  horizontal = signal('center');

  notify() {
    this.toasts()?.nativeElement.addToast({
      type: 'info',
      title: 'Notification',
      message: `Placed at ${this.vertical()} ${this.horizontal()}.`,
      progress: true,
    });
  }
}
