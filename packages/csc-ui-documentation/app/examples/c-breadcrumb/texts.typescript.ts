import type { CBreadcrumbTexts } from '@cscfi/csc-ui';

const texts: CBreadcrumbTexts = {
  breadcrumb: 'Murupolku',
  fold: (count) => `Näytä ${count} lisää`,
};

// Objects and functions have no attribute form: set `texts` as a DOM
// property.
document.querySelector('c-breadcrumb')!.texts = texts;
