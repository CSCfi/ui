import { newE2EPage } from '@stencil/core/testing';

describe('c-tab', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-tab></c-tab>');

    const element = await page.find('c-tab');
    expect(element).toHaveClass('hydrated');
  });
});
