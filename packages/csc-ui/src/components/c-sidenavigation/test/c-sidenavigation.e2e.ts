import { newE2EPage } from '@stencil/core/testing';

describe('c-sidenavigation', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-sidenavigation></c-sidenavigation>');

    const element = await page.find('c-sidenavigation');
    expect(element).toHaveClass('hydrated');
  });
});
