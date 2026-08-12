// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <span>Details</span>
      <c-divider vertical></c-divider>
      <span>Members</span>
      <c-divider vertical></c-divider>
      <span>Settings</span>
    </div>
  `,
})
export class VerticalExampleComponent {}
