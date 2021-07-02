import { newE2EPage } from '@stencil/core/testing';

describe('c-paginationrow', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-paginationrow></c-paginationrow>');

    const element = await page.find('c-paginationrow');
    expect(element).toHaveClass('hydrated');
  });
});
