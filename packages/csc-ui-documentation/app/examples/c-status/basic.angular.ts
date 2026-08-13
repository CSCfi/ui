// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-status>Default</c-status>
      <c-status type="info">Pending</c-status>
      <c-status type="success">Active</c-status>
      <c-status type="warning">Expiring</c-status>
      <c-status type="error">Failed</c-status>
    </div>
  `,
})
export class BasicExampleComponent {}
