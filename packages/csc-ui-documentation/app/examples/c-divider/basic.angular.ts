// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <p>Profile</p>
      <c-divider></c-divider>
      <p>Preferences</p>
    </div>
  `,
})
export class BasicExampleComponent {}
