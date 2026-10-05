// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import type { CBreadcrumbTexts } from '@cscfi/csc-ui';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div style="width: 320px; max-width: 100%">
      <c-breadcrumb [texts]="texts">
        <c-breadcrumb-item href="https://csc.fi">Etusivu</c-breadcrumb-item>
        <c-breadcrumb-item href="https://csc.fi/palvelut">
          Palvelut
        </c-breadcrumb-item>
        <c-breadcrumb-item href="https://csc.fi/palvelut/laskenta">
          Laskenta
        </c-breadcrumb-item>
        <c-breadcrumb-item>Supertietokoneet</c-breadcrumb-item>
      </c-breadcrumb>
    </div>
  `,
})
export class TextsExampleComponent {
  texts: CBreadcrumbTexts = {
    breadcrumb: 'Murupolku',
    fold: (count) => `Näytä ${count} lisää`,
  };
}
