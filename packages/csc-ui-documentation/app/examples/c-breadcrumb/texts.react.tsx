// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CBreadcrumb, CBreadcrumbItem } from '@cscfi/csc-ui-react';
import type { CBreadcrumbTexts } from '@cscfi/csc-ui';

const texts: CBreadcrumbTexts = {
  breadcrumb: 'Murupolku',
  fold: (count) => `Näytä ${count} lisää`,
};

export const Texts = () => {
  return (
    <div style={{ width: 320, maxWidth: '100%' }}>
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
