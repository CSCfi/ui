import type { CBreadcrumbTexts } from '@cscfi/csc-ui';

// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CBreadcrumb, CBreadcrumbItem } from '@cscfi/csc-ui-react';

const texts: CBreadcrumbTexts = {
  breadcrumb: 'Murupolku',
  fold: (count) => `Näytä ${count} lisää`,
};

export const Texts = () => {
  return (
    <div style={{ maxWidth: '100%', width: 320 }}>
      <CBreadcrumb texts={texts}>
        <CBreadcrumbItem href="https://csc.fi">Etusivu</CBreadcrumbItem>
        <CBreadcrumbItem href="https://csc.fi/palvelut">
          Palvelut
        </CBreadcrumbItem>
        <CBreadcrumbItem href="https://csc.fi/palvelut/laskenta">
          Laskenta
        </CBreadcrumbItem>
        <CBreadcrumbItem>Supertietokoneet</CBreadcrumbItem>
      </CBreadcrumb>
    </div>
  );
};
