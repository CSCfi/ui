import { newE2EPage } from '@stencil/core/testing';

describe('c-link', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-link></c-link>');

    const element = await page.find('c-link');
    expect(element).toHaveClass('hydrated');
  });
});
