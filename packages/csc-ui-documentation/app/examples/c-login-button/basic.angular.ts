// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { mdiAccountCircle, mdiSchool } from '@mdi/js';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-login-buttons>
        <c-login-button [src]="logo(mdiSchool)" alt="Haka logo">
          Haka login
        </c-login-button>

        <c-login-button [src]="logo(mdiAccountCircle)" alt="CSC logo">
          CSC login
        </c-login-button>
      </c-login-buttons>
    </div>
  `,
})
export class BasicExampleComponent {
  mdiAccountCircle = mdiAccountCircle;

  mdiSchool = mdiSchool;

  // Stand-in provider logos; use your identity provider's logo url instead.
  logo(path: string) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}" fill="#336b8e"/></svg>`,
    )}`;
  }
}
