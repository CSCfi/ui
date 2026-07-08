// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  viewChild,
} from '@angular/core';
import type { CToastsElement } from '@cscfi/csc-ui-next';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-button (click)="notify('success')">Show success toast</c-button>

      <c-button (click)="notify('error')">Show error toast</c-button>

      <c-toasts #toasts></c-toasts>
    </div>
  `,
})
export class BasicExampleComponent {
  toasts = viewChild<ElementRef<CToastsElement>>('toasts');

  notify(type: 'error' | 'success') {
    this.toasts()?.nativeElement.addToast({
      type,
      title: type === 'success' ? 'Saved' : 'Upload failed',
      message:
        type === 'success'
          ? 'Your changes have been saved.'
          : 'The file could not be uploaded.',
      progress: true,
    });
  }
}
