// @ts-nocheck — documentation code sample; shown as text, never compiled here
import type { ElementRef } from '@angular/core';
import type { CToastsElement } from '@cscfi/csc-ui';

import { Component, CUSTOM_ELEMENTS_SCHEMA, viewChild } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
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
      message:
        type === 'success'
          ? 'Your changes have been saved.'
          : 'The file could not be uploaded.',
      progress: true,
      title: type === 'success' ? 'Saved' : 'Upload failed',
      type,
    });
  }
}
