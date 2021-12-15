import { newE2EPage } from '@stencil/core/testing';

describe('c-flex', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-flex></c-flex>');

    const element = await page.find('c-flex');
    expect(element).toHaveClass('hydrated');
  });
});
