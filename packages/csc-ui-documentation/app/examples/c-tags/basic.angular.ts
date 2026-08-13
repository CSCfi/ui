// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div style="display: grid; gap: 1rem">
      <c-tags>
        <c-tag active>All</c-tag>
        <c-tag>Biosciences</c-tag>
        <c-tag>Chemistry</c-tag>
        <c-tag>Physics</c-tag>
      </c-tags>

      <c-tags size="small">
        <c-tag active>All</c-tag>
        <c-tag>Biosciences</c-tag>
        <c-tag>Chemistry</c-tag>
        <c-tag>Physics</c-tag>
      </c-tags>
    </div>
  `,
})
export class BasicExampleComponent {}
