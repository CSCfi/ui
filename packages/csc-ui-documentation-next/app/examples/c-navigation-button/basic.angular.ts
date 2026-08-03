// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-navigation-button
        (click)="menuVisible.set(!menuVisible())"
      ></c-navigation-button>

      <p>Menu {{ menuVisible() ? 'open' : 'closed' }}</p>
    </div>
  `,
})
export class BasicExampleComponent {
  menuVisible = signal(false);
}
