// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div style="display: grid; gap: 1rem">
      <c-alert>A default alert without a type.</c-alert>

      <c-alert type="info">Your session expires in 15 minutes.</c-alert>

      <c-alert type="success">Your project was created.</c-alert>

      <c-alert type="warning">Your quota is almost full.</c-alert>

      <c-alert type="error">The file could not be uploaded.</c-alert>
    </div>
  `,
})
export class TypesExampleComponent {}
