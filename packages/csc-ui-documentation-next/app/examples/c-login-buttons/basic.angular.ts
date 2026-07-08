// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { mdiAccountCircle, mdiDomain, mdiSchool } from '@mdi/js';

// Stand-in provider logos; use your identity provider's logo url instead.
const logo = (path: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}" fill="#336b8e"/></svg>`,
  )}`;

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-login-buttons>
        <c-login-button [src]="hakaLogo" alt="Haka logo">
          Haka login
        </c-login-button>

        <c-login-button [src]="virtuLogo" alt="Virtu logo">
          Virtu login
        </c-login-button>

        <c-login-button [src]="cscLogo" alt="CSC logo">
          CSC login
        </c-login-button>
      </c-login-buttons>
    </div>
  `,
})
export class BasicExampleComponent {
  hakaLogo = logo(mdiSchool);
  virtuLogo = logo(mdiDomain);
  cscLogo = logo(mdiAccountCircle);
}
