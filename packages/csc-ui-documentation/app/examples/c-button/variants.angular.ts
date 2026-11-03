// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div class="example-grid">
      <div class="example-row">
        <c-button>Primary</c-button>
        <c-button variant="secondary">Secondary</c-button>
        <c-button variant="success">Success</c-button>
        <c-button variant="info">Info</c-button>
        <c-button variant="warning">Warning</c-button>
        <c-button variant="danger">Danger</c-button>
      </div>

      <div class="example-row">
        <c-button appearance="outlined">Primary</c-button>
        <c-button appearance="outlined" variant="secondary">Secondary</c-button>
        <c-button appearance="outlined" variant="success">Success</c-button>
        <c-button appearance="outlined" variant="info">Info</c-button>
        <c-button appearance="outlined" variant="warning">Warning</c-button>
        <c-button appearance="outlined" variant="danger">Danger</c-button>
      </div>

      <div class="example-row">
        <c-button appearance="ghost">Primary</c-button>
        <c-button appearance="ghost" variant="secondary">Secondary</c-button>
        <c-button appearance="ghost" variant="success">Success</c-button>
        <c-button appearance="ghost" variant="info">Info</c-button>
        <c-button appearance="ghost" variant="warning">Warning</c-button>
        <c-button appearance="ghost" variant="danger">Danger</c-button>
      </div>

      <div class="example-row">
        <c-button appearance="text">Primary</c-button>
        <c-button appearance="text" variant="secondary">Secondary</c-button>
        <c-button appearance="text" variant="success">Success</c-button>
        <c-button appearance="text" variant="info">Info</c-button>
        <c-button appearance="text" variant="warning">Warning</c-button>
        <c-button appearance="text" variant="danger">Danger</c-button>
      </div>
    </div>
  `,
})
export class VariantsExampleComponent {}
