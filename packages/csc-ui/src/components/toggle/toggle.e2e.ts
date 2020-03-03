import { newE2EPage } from '@stencil/core/testing';

describe('c-toggle', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-toggle></c-toggle>');

    const element = await page.find('c-toggle');
    expect(element).toHaveClass('hydrated');
  });
});
