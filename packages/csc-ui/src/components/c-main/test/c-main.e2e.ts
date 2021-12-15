import { newE2EPage } from '@stencil/core/testing';

describe('c-main', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-main></c-main>');

    const element = await page.find('c-main');
    expect(element).toHaveClass('hydrated');
  });
});
