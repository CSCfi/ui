// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <c-tags label="Research fields" required>
      <c-tag active>All</c-tag>
      <c-tag>Biosciences</c-tag>
      <c-tag>Chemistry</c-tag>
      <c-tag>Physics</c-tag>
    </c-tags>
  `,
})
export class LabelExampleComponent {}
