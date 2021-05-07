import { newE2EPage } from '@stencil/core/testing';

describe('c-csc-logo', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-csc-logo></c-csc-logo>');

    const element = await page.find('c-csc-logo');
    expect(element).toHaveClass('hydrated');
  });
});
