import { newE2EPage } from '@stencil/core/testing';

describe('c-menu', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-menu></c-menu>');

    const element = await page.find('c-menu');
    expect(element).toHaveClass('hydrated');
  });
});
