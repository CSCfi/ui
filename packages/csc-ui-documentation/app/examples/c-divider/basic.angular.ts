// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <p>Profile</p>
      <c-divider></c-divider>
      <p>Preferences</p>
    </div>
  `,
})
export class BasicExampleComponent {}
