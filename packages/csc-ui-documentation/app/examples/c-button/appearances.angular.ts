// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div class="example-row">
      <c-button>Default</c-button>
      <c-button appearance="outlined">Outlined</c-button>
      <c-button appearance="ghost">Ghost</c-button>
      <c-button appearance="text">Text</c-button>
      <c-button disabled>Disabled</c-button>
    </div>
  `,
})
export class AppearancesExampleComponent {}
