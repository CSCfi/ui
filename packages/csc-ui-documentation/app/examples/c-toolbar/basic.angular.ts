// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <!-- static keeps the toolbar in the page flow; by default it is pinned to the top of its scroll container -->
      <c-toolbar static>
        <c-csc-logo></c-csc-logo>
        <span>My Service</span>
        <c-button style="margin-inline-start: auto" text>Log out</c-button>
      </c-toolbar>
    </div>
  `,
})
export class BasicExampleComponent {}
