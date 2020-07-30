import { newE2EPage } from '@stencil/core/testing';

describe('c-loader', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-loader></c-loader>');

    const element = await page.find('c-loader');
    expect(element).toHaveClass('hydrated');
  });
});
