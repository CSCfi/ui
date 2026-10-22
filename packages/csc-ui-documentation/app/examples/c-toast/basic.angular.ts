import type { CToastMessage } from '@cscfi/csc-ui';

// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <!-- Toasts are normally created by c-toasts, which renders a c-toast for
           each message. A persistent message can be shown standalone. -->
      <c-toast [message]="message"></c-toast>
    </div>
  `,
})
export class BasicExampleComponent {
  message: CToastMessage = {
    id: 'example',
    message: 'Your changes have been saved.',
    persistent: true,
    title: 'Saved',
    type: 'success',
  };
}
